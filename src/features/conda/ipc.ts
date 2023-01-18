export interface ServerToClientEvents {
    'install/log': (log: string) => void
    'install/close': (code: number) => void
    'install/error': (error: string) => void
}

export interface ClientToServerEvents {
    'install/start': () => void
    'env/installed': () => boolean
}
