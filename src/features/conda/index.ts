import { spawn, SpawnOptions, spawnSync } from 'child_process'
import { app } from 'electron'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'

import type { ClientToServerEvents, ServerToClientEvents } from './ipc'

import { IpcServer } from '~/ipc/server'

const ext = process.platform === 'win32' ? '.exe' : ''

class Conda {
    private readonly condaDir = path.join(app.getPath('userData'), 'miniconda')
    private readonly ipc = new IpcServer<ServerToClientEvents, ClientToServerEvents>('conda')
    private installing = false

    public setup() {
        process.env['CONDA_EXE'] = path.join(this.condaDir, 'Scripts', 'conda' + ext)
        process.env['CONDA_PREFIX'] = this.condaDir
        process.env['CONDA_PYTHON_EXE'] = path.join(this.condaDir, 'python' + ext)
        this.ipc.handle('install/start', this.install.bind(this))
        this.ipc.handle('env/installed', this.isInstalled.bind(this))
    }

    public isInstalled() {
        return fs.existsSync(path.join(this.condaDir))
    }

    public async install() {
        if (this.isInstalled() || this.installing) return

        switch (process.platform) {
            case 'win32': {
                this.installing = true
                const url =
                    'https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe'

                const res = await fetch(url)
                const buf = Buffer.from(await res.arrayBuffer())
                const installer = path.join(app.getPath('temp'), 'flat-miniconda-installer.exe')
                fs.writeFileSync(installer, buf)

                const ps = spawn(installer, [
                    '/InstallationType=JustMe',
                    '/RegisterPython=0',
                    '/AddToPath=0',
                    '/S',
                    `/D=${this.condaDir}`,
                ])

                ps.stdout.on('data', (data: Buffer) =>
                    this.ipc.emit('install/log', data.toString()),
                )
                ps.stderr.on('data', (data: Buffer) =>
                    this.ipc.emit('install/log', data.toString()),
                )
                ps.on('close', (code) => {
                    this.installing = false
                    this.ipc.emit('install/close', code ?? 1)
                })
                ps.on('error', (error) => {
                    this.installing = false
                    this.ipc.emit('install/error', error.message)
                })
            }
        }
    }

    public condaBin() {
        switch (process.platform) {
            case 'win32':
                return path.resolve(path.join(this.condaDir, 'Library', 'bin', 'conda.bat'))
            default:
                throw new Error('This platform is not supported.')
        }
    }

    public async version(bin = this.condaBin()) {
        const { stdout } = spawnSync(bin, ['--version'])
        const str = stdout.toString()
        const matches = str.match(/conda (\d+.\d+.\d+)/)
        if (!matches || matches.length < 2) return
        return matches[1]
    }

    public envs() {
        const dir = path.join(this.condaDir, 'envs')
        if (!fs.existsSync(dir)) return []
        return fs.readdirSync(dir)
    }

    public createEnvVars(env: string) {
        const sep = process.platform === 'win32' ? ';' : ':'
        const paths = [[], ['Library', 'bin'], ['Scripts'], ['bin']]
        const create = (dir: string) => `${paths.map((v) => path.join(dir, ...v)).join(sep)}`
        const PATH =
            (env !== 'base' ? create(path.join(this.condaDir, 'envs', env)) : '') +
            `;${create(this.condaDir)}${'PATH' in process.env ? ';' + process.env['PATH'] : ''}`
        const envs: Record<string, string> = {
            PATH,
            CONDA_DEFAULT_ENV: env,
            CONDA_EXE: path.join(this.condaDir, 'Scripts', 'conda.exe'),
            CONDA_PREFIX: env === 'base' ? this.condaDir : path.join(this.condaDir, 'envs', env),
            CONDA_PYTHON_EXE: path.join(this.condaDir, 'python' + ext),
        }

        if (env !== 'base') envs['CONDA_PREFIX_1'] = this.condaDir
        return envs
    }

    public run(cmd: string, env?: string | undefined, options?: SpawnOptions | undefined) {
        const re = /[^\s'"]+|'([^']*)'|"([^"]*)"/gi
        const matches = cmd.match(re) || []
        const [exec, ...args] = matches.map((v) => v.replace(/['"]/g, ''))
        options = options || {}
        options.env = {
            ...options.env,
            ...this.createEnvVars(env || 'base'),
        }
        if (!exec) throw new Error('Command is empty.')
        return spawn(exec, args, options)
    }

    public promise(cmd: string, env?: string | undefined, options?: SpawnOptions | undefined) {
        return new Promise<{
            status: number | null
            pid: number | undefined
            stdout: string
            stderr: string
        }>((resolve, reject) => {
            const ps = this.run(cmd, env, options)
            let stdout = ''
            let stderr = ''
            ps.stdout?.on('data', (data) => (stdout += data.toString()))
            ps.stderr?.on('data', (data) => (stderr += data.toString()))
            ps.on('close', (code) => {
                resolve({
                    status: code,
                    pid: ps.pid,
                    stdout,
                    stderr,
                })
            })
            ps.on('error', reject)
        })
    }
}

export const conda = new Conda()
