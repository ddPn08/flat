import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'

import type { ClientToServerEvents, ServerToClientEvents } from './ipc'
import { parseMetadata } from './parse-png-meta'
import { loadMeta } from './png-meta'
import type { ImageData, ImageSearchOptions } from './types'

import { FEATURES_PATH } from '~/constants'
import { getConfig } from '~/index'
import { IpcServer } from '~/ipc/server'

const toArrayBuffer = (buffer: Buffer) => {
    const ab = new ArrayBuffer(buffer.length)
    const view = new Uint8Array(ab)
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i] as number
    }
    return ab
}

class Gallery {
    private readonly dir = path.join(FEATURES_PATH, 'gallery')
    private readonly ipc = new IpcServer<ServerToClientEvents, ClientToServerEvents>('gallery')
    private readonly dbFilePath = path.join(this.dir, 'db.json')
    private dirs: string[] = []
    private db: Record<string, ImageData[]> = {}
    private globbing = false

    public async setup() {
        if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir)
        if (!fs.existsSync(this.dbFilePath)) fs.writeFileSync(this.dbFilePath, '{}')
        const config = getConfig()
        if (config) {
            this.dirs = Array.isArray(config['gallery/dirs']) ? config['gallery/dirs'] : []
        }
        this.ipc.handle('dirs/update', async (_, paths) => {
            this.dirs = paths
        })
        this.ipc.handle('images/get', (_, dir, search) => this.get(dir, search))
        this.ipc.handle('images/glob', (_, dir) => this.glob(dir))
        this.ipc.handle('favorite/add', (_, dir, path) => this.addFav(dir, path))
        this.ipc.handle('favorite/remove', (_, dir, path) => this.removeFav(dir, path))
        this.load()
        this.glob()
    }

    private load() {
        const saved = fs.readFileSync(this.dbFilePath, 'utf-8')
        try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed)) return (this.db = {})
            this.db = JSON.parse(saved)
        } catch (error) {
            this.db = {}
        }
    }

    private sort() {
        for (const [key, images] of Object.entries(this.db))
            this.db[key] = images.sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
    }

    private save() {
        this.sort()
        return fs.promises.writeFile(this.dbFilePath, JSON.stringify(this.db))
    }

    public addFav(dir: string, path: string) {
        if (!(dir in this.db)) return
        const db = this.db[dir]!
        const i = db.findIndex((v) => v.filepath === path)
        if (i === -1) return
        db[i]!.favorite = true
    }

    public removeFav(dir: string, path: string) {
        if (!(dir in this.db)) return
        const db = this.db[dir]!
        const i = db.findIndex((v) => v.filepath === path)
        if (i === -1) return
        db[i]!.favorite = false
    }

    public async glob(dir?: string) {
        if (this.globbing) return
        this.globbing = true
        const dirs = this.dirs.slice().filter((v) => !dir || v === dir)
        await Promise.all(
            dirs.map(async (cwd) => {
                if (!(cwd in this.db)) this.db[cwd] = []
                const db = this.db[cwd]!
                const update: ImageData[] = []
                const files = fg.stream('**/*.png', { cwd: cwd })
                const exists: string[] = []
                for await (const filename of files) {
                    const filepath = path.join(cwd, filename.toString())
                    exists.push(filepath)
                    if (db.findIndex((v) => v.filepath === filepath) !== -1) continue
                    const [stat, buf] = await Promise.all([
                        fs.promises.stat(filepath),
                        fs.promises.readFile(filepath),
                    ])
                    const meta = await loadMeta(toArrayBuffer(buf))
                    const info = parseMetadata(meta)
                    if (info)
                        update.push({
                            filepath,
                            created_at: stat.ctime,
                            favorite: false,
                            info,
                        })
                }

                this.db[cwd]! = db
                    .concat(update)
                    .filter((img) => img.filepath.startsWith(cwd) && exists.includes(img.filepath))
                    .filter(
                        (img, index, self) =>
                            self.findIndex((e) => e.filepath === img.filepath) === index,
                    )
            }),
        )
        await this.save()
        this.globbing = false
    }

    public async get(cwd: string, search?: ImageSearchOptions) {
        search = search || {}
        if (!(cwd in this.db)) return []
        const db = this.db[cwd]!
        const result: ImageData[] = []
        const limit = search.limit || 100
        const since = search.since || 0

        const files = [...db]

        if (typeof search.latest !== 'boolean' || search.latest) files.reverse()

        for (const v of files.slice(since, since + limit)) {
            if (result.length >= limit) break
            if (typeof search.favorite === 'boolean' && v.favorite !== search.favorite) continue
            if (search.filename && !path.basename(v.filepath).includes(search.filename)) continue
            if (search.info) {
                let c = false
                for (const [ik, iv] of Object.entries(search.info)) {
                    if (
                        Object.keys(v.info).includes(ik) &&
                        !`${v.info[ik as keyof typeof v.info]}`.includes(`${iv}`)
                    )
                        c = true
                }
                if (c) continue
            }
            result.push(v)
        }
        return result
    }
}

export const gallery = new Gallery()
