import type { IpcRendererEvent } from 'electron/renderer'

import { ipcRenderer } from '../web/lib/electron'

export class IpcClient<
    StoC extends Record<string, any> = Record<string, any>,
    CtoS extends Record<string, any> = Record<string, any>,
> {
    constructor(private readonly key: string) {}

    public on<K extends keyof StoC & string>(
        key: K,
        listener: (event: IpcRendererEvent, ...args: Parameters<StoC[K]>) => void,
    ) {
        ipcRenderer.on(`${this.key}:${key}`, (event, ...args) => {
            return listener(event, ...(args as any))
        })
    }

    public once<K extends keyof StoC & string>(
        key: K,
        listener: (event: IpcRendererEvent, ...args: Parameters<StoC[K]>) => void,
    ) {
        ipcRenderer.once(`${this.key}:${key}`, (event, ...args) => {
            return listener(event, ...(args as any))
        })
    }

    public off<K extends keyof StoC & string>(key: K, listener: any) {
        ipcRenderer.off(`${this.key}:${key}`, listener)
    }

    public invoke<K extends keyof CtoS & string>(
        key: K,
        ...args: Parameters<CtoS[K]>
    ): Promise<ReturnType<CtoS[K]>> {
        return ipcRenderer.invoke(`${this.key}:${key}`, ...args)
    }
}
