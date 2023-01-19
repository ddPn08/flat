import type { ipcRenderer, shell } from 'electron'
import type path from 'path'

declare global {
    interface Window {
        ipcRenderer: typeof ipcRenderer
        bpath: typeof path
        shell: typeof shell
    }
}
