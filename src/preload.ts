import electron from 'electron'
import path from 'path'

window['__node_lib'] = {
    path,
    electron,
}

declare global {
    interface Window {
        __node_lib: {
            path: typeof path
            electron: typeof electron
        }
    }
}
