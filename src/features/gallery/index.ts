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

class Galley {
    private readonly dir = path.join(FEATURES_PATH, 'galley')
    private readonly ipc = new IpcServer<ServerToClientEvents, ClientToServerEvents>('galley')
    private readonly dbFilePath = path.join(this.dir, 'db.json')
    private paths: string[] = []
    private db: ImageData[] = []

    public async setup() {
        if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir)
        if (!fs.existsSync(this.dbFilePath)) fs.writeFileSync(this.dbFilePath, '{}')
        const config = getConfig()
        if (config) {
            this.paths = Array.isArray(config['galley/paths']) ? config['galley/paths'] : []
        }
        this.ipc.handle('pathes/update', async (_, paths) => {
            this.paths = paths
            await this.glob()
        })
        this.ipc.handle('images/get', (_, search) => {
            return this.get(search)
        })
        this.load()
        this.glob()
    }

    private load() {
        const saved = fs.readFileSync(this.dbFilePath, 'utf-8')
        try {
            const parsed = JSON.parse(saved)
            if (!Array.isArray(parsed)) return (this.db = [])
            this.db = JSON.parse(saved)
        } catch (error) {
            this.db = []
        }
    }

    private save() {
        return fs.promises.writeFile(
            this.dbFilePath,
            JSON.stringify(this.db.sort((a, b) => (a.created_at < b.created_at ? -1 : 1))),
        )
    }

    public async glob() {
        await Promise.all(
            this.paths.map(async (cwd) => {
                const files = fg.stream('**/*.png', { cwd: cwd })
                for await (const filename of files) {
                    const filepath = path.join(cwd, filename.toString())
                    const key = filepath.toString()
                    if (this.db.findIndex((v) => v.filepath === filepath) !== -1) continue
                    const stat = await fs.promises.stat(filepath)
                    const buf = await fs.promises.readFile(filepath)
                    const meta = await loadMeta(toArrayBuffer(buf))
                    const info = parseMetadata(meta)
                    if (info)
                        this.db.push({
                            filepath: key,
                            created_at: stat.ctime,
                            info,
                        })
                }
            }),
        )
        this.db = this.db.filter(
            (img) => this.paths.filter((p) => img.filepath.startsWith(p)).length > 0,
        )
        await this.save()
    }

    public async get(search?: ImageSearchOptions) {
        search = search || {}
        const result: ImageData[] = []
        const limit = search.limit || 100
        const since = search.since || 0

        const files = [...this.db.sort((a, b) => (a.created_at < b.created_at ? -1 : 1))]

        if (typeof search.latest !== 'boolean' || search.latest) files.reverse()

        for (const v of files.slice(since, since + limit)) {
            if (result.length >= limit) break
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

export const galley = new Galley()
