import { shell } from 'electron'
import { ipcRenderer } from 'electron/renderer'
import path from 'path'

window['ipcRenderer'] = ipcRenderer
window['bpath'] = path
window['shell'] = shell
