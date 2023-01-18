export interface ServerToClientEvents {
    log: (log: string) => void
    'install/close': (code: number) => void
    'install/error': (error: string) => void
}

export interface ClientToServerEvents {
    check: () => boolean
    install: () => void
}
