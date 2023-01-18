import './__setup'
import { app, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import { FEATURES_PATH } from './constants'
import { conda } from './features/conda'
import { galley } from './features/gallery'
import { git } from './features/git'
import { webui } from './features/stable-diffusion-webui'
import { ipcSystem } from './features/system/ipc/server'
import { update } from './updater'
import type { Config } from './web/lib/config'

export const isDev = process.env['NODE_ENV'] === 'development'

export const getConfig = (): Config | null => {
    const filepath = path.join(app.getPath('userData'), 'flat-config.json')
    if (!fs.existsSync(filepath)) return null
    const txt = fs.readFileSync(filepath, 'utf-8')
    try {
        return JSON.parse(txt)
    } catch (_) {}
    return null
}

app.once('ready', async () => {
    try {
        if (!fs.statSync(FEATURES_PATH).isDirectory())
            fs.renameSync(FEATURES_PATH, 'flat-rm-file.' + FEATURES_PATH)
    } catch (_) {}
    if (!fs.existsSync(FEATURES_PATH)) fs.mkdirSync(FEATURES_PATH, { recursive: true })

    ipcSystem.handle('app/restart', () => app.relaunch())
    ipcSystem.handle('path/user-data', () => app.getPath('userData'))
    ipcSystem.handle('update/check', update)
    ipcSystem.handle('window/is-focused', (e) => e.sender.isFocused())
    ipcSystem.handle('config/save', (_, config) => {
        const filepath = path.join(app.getPath('userData'), 'flat-config.json')
        return fs.promises.writeFile(filepath, JSON.stringify(config))
    })

    git.setup()
    conda.setup()
    galley.setup()
    webui.setup()
    await createWindow()
})

const createWindow = async () => {
    const window = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 960,
        minHeight: 480,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.cjs'),
        },
        backgroundColor: '#ffffff',
    })
    window.setMenuBarVisibility(false)

    if (isDev) window.loadURL(process.env['DEV_SERVER_ADDRESS'] as string)
    else window.loadFile('./dist/index.html')
}
