import { execSync, spawn } from 'child_process'
import { app } from 'electron'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'

import type { ClientToServerEvents, ServerToClientEvents } from './ipc'

import { IpcServer } from '~/ipc/server'

class Git {
    private readonly ipc = new IpcServer<ServerToClientEvents, ClientToServerEvents>('git')
    private installing = false

    public setup() {
        this.ipc.handle('check', this.check.bind(this))
        this.ipc.handle('install', this.install.bind(this))
    }

    public check() {
        let git
        try {
            git = execSync('git --version').toString('utf-8').trim()
        } catch (err) {
            git = null
        }
        return !!git
    }

    public async install() {
        switch (process.platform) {
            case 'win32': {
                this.ipc.emit('log', 'Downloading git installer...')
                const url =
                    'https://github.com/git-for-windows/git/releases/download/v2.39.1.windows.1/Git-2.39.1-64-bit.exe'

                const res = await fetch(url)
                const buf = Buffer.from(await res.arrayBuffer())
                const installer = path.join(app.getPath('temp'), 'flat-git-installer.exe')
                fs.writeFileSync(installer, buf)

                const ps = spawn(installer, { detached: true })
                ps.stdout.on('data', (data: Buffer) => this.ipc.emit('log', data.toString()))
                ps.stderr.on('data', (data: Buffer) => this.ipc.emit('log', data.toString()))
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
}

export const git = new Git()
