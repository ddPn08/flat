import './__setup'
import { app, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import { FEATURES_PATH } from './constants'
import { conda } from './features/conda'
import { git } from './features/git'
import { webui } from './features/stable-diffusion-webui'
import { ipcSystem } from './features/system/ipc/server'
import { update } from './updater'

export const isDev = process.env['NODE_ENV'] === 'development'

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

    git.setup()
    conda.setup()
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
