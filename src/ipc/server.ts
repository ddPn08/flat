import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'

export class IpcServer<
    StoC extends Record<string, any> = Record<string, any>,
    CtoS extends Record<string, any> = Record<string, any>,
> {
    constructor(private readonly key: string) {}
    public emit<K extends keyof StoC & string>(key: K, ...args: Parameters<StoC[K]>) {
        BrowserWindow.getAllWindows().forEach((window) => {
            window.webContents.send(`${this.key}:${key}`, ...args)
        })
    }
    public handle<K extends keyof CtoS & string>(
        key: K,
        listener: (
            event: IpcMainInvokeEvent,
            ...args: Parameters<CtoS[K]>
        ) => ReturnType<CtoS[K]> | Promise<ReturnType<CtoS[K]>>,
    ) {
        ipcMain.handle(`${this.key}:${key}`, (event, ...args) => listener(event, ...(args as any)))
    }
}
