import { app } from 'electron'
import fs from 'fs'
import path from 'path'

const isDev = process.env['NODE_ENV'] === 'development'
const appRoot = path.join(__dirname, '../../../')
const isPortable = !isDev && fs.existsSync(path.join(appRoot, 'resources/.portable'))
const userData = isPortable
    ? path.join(appRoot, 'userData')
    : path.join(app.getPath('appData'), 'flat')

if (!fs.existsSync(userData)) fs.mkdirSync(userData, { recursive: true })
app.setPath('userData', userData)
