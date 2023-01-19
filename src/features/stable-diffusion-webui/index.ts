import type { ChildProcess } from 'child_process'
import fs from 'fs'
import net, { AddressInfo } from 'net'
import path from 'path'
import { simpleGit } from 'simple-git'

import type { ClientToServerEvents, ServerToClientEvents } from './ipc'
import { conda } from '../conda'

import { FEATURES_PATH } from '~/constants'
import { IpcServer } from '~/ipc/server'

const GIT_URL = 'https://github.com/AUTOMATIC1111/stable-diffusion-webui.git'

const getFreePort = async () => {
    return new Promise<number>((res) => {
        const srv = net.createServer()
        srv.listen(0, () => {
            const address = srv.address() as AddressInfo
            srv.close(() => res(address.port))
        })
    })
}

class StableDiffusionWebUI {
    private readonly dir = path.join(FEATURES_PATH, 'stable-diffusion-webui')
    private readonly condaEnv = 'stable-diffusion-webui'
    private readonly ipc = new IpcServer<ServerToClientEvents, ClientToServerEvents>(
        'stable-diffusion-webui',
    )
    private port = 0
    private ps: ChildProcess | null = null
    private logs: string[] = []

    public setup() {
        if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir)

        this.ipc.handle('env/install', this.install.bind(this))
        this.ipc.handle('env/installed', this.isInstalled.bind(this))
        this.ipc.handle('env/uninstall', this.uninstallEnv.bind(this))

        this.ipc.handle('config/get', this.getConfig.bind(this, 'config.json'))
        this.ipc.handle('config/save', (_, str) => this.saveConfig('config.json', str))

        this.ipc.handle('ui-config/get', this.getConfig.bind(this, 'ui-config.json'))
        this.ipc.handle('ui-config/save', (_, str) => this.saveConfig('ui-config.json', str))

        this.ipc.handle('webui/running', () => this.ps !== null)
        this.ipc.handle('webui/launch', (_, args, commit) => this.launch(args, commit))
        this.ipc.handle('webui/stop', this.stop.bind(this))
        this.ipc.handle('webui/logs', () => this.logs)
        this.ipc.handle('webui/port', () => this.port)
        this.ipc.handle('webui/data-dir', () => this.dir)

        this.ipc.handle('git/log', this.commits.bind(this))
        this.ipc.handle('git/pull', this.pull.bind(this))
    }

    public getConfig(filename: string) {
        const filepath = path.join(this.dir, 'repository', filename)
        if (fs.existsSync(filepath)) {
            return fs.promises.readFile(filepath, 'utf-8')
        } else {
            return ''
        }
    }

    public saveConfig(filename: string, str: string) {
        const filepath = path.join(this.dir, 'repository', filename)
        return fs.promises.writeFile(filepath, str)
    }

    public isInstalled() {
        return (
            fs.existsSync(path.join(this.dir, 'repository')) && conda.envs().includes(this.condaEnv)
        )
    }

    public log(ps: ChildProcess) {
        return new Promise<number>((resolve, reject) => {
            ps.stdout?.on('data', (data: Buffer) => this.ipc.emit('log', data.toString()))
            ps.stderr?.on('data', (data: Buffer) => this.ipc.emit('log', data.toString()))
            ps.on('error', (error) => {
                reject(error)
            })
            ps.on('close', resolve)
        })
    }

    public async uninstallEnv() {
        await this.log(conda.run(`conda remove -y -n ${this.condaEnv} --all`))
        this.ipc.emit('env/uninstalled')
    }

    public async install() {
        this.ipc.emit('log', 'Cloning repository...')
        const repoPath = path.join(this.dir, 'repository')
        if (!fs.existsSync(repoPath))
            await simpleGit().clone(GIT_URL, path.join(this.dir, 'repository'))
        this.ipc.emit('log', 'Successfully cloned the repository.')

        const envs = conda.envs()

        if (envs.includes(this.condaEnv)) await this.uninstallEnv()
        await this.log(
            conda.run(`conda create -y -n ${this.condaEnv} python==3.10 pip=22.2.2`, 'base'),
        )
        if (process.platform === 'linux')
            await this.log(
                conda.run('conda install -y xformers -c xformers/label/dev', this.condaEnv),
            )

        await this.log(
            conda.run(
                'python -u -c "from launch import prepare_environment; prepare_environment()"',
                this.condaEnv,
                { cwd: repoPath },
            ),
        )
        this.ipc.emit('log', 'Installation finished🎉')
    }

    public async launch(args: string, commit = 'master') {
        if (this.ps) throw new Error('already running.')
        const git = this.git()
        try {
            await git.checkout(commit)
        } catch (_) {
            this.ipc.emit('log', 'Incorrect commit hash.')
        }
        this.port = await getFreePort()
        args += ` --port ${this.port}`
        this.ps = conda.run(`python -u launch.py`, this.condaEnv, {
            cwd: path.join(this.dir, 'repository'),
            env: {
                COMMANDLINE_ARGS: args,
            },
        })
        this.ps.stdout?.on('data', (data: Buffer) => {
            this.logs.push(...data.toString().split('\n'))
            this.ipc.emit('log', data.toString())
        })
        this.ps.stderr?.on('data', (data: Buffer) => {
            this.logs.push(...data.toString().split('\n'))
            this.ipc.emit('log', data.toString())
        })
        this.ps.on('close', (code) => {
            this.ps = null
            this.ipc.emit('webui/close', code ?? 1)
        })
        this.ps.on('error', (error) => this.ipc.emit('webui/error', error.message))

        return this.port
    }

    public stop() {
        this.logs = []
        this.ps?.kill()
        this.ps = null
    }

    public git() {
        return simpleGit(path.join(this.dir, 'repository'))
    }

    public async pull() {
        const git = this.git()
        await git.fetch()
        const log = await git.pull('origin', 'master')
        this.ipc.emit('log', 'Updated WebUI.')
        return log
    }

    public async commits() {
        if (!fs.existsSync(path.join(this.dir, 'repository')))
            throw new Error('Repository not cloned.')
        const git = this.git()
        const log = await git.log()
        return log
    }
}

export const webui = new StableDiffusionWebUI()
