import type { DefaultLogFields, LogResult, PullResult } from 'simple-git'

export interface ServerToClientEvents {
    log: (log: string) => void
    'env/uninstalled': () => void
    'webui/launch': (port: number) => void
    'webui/close': (code: number) => void
    'webui/error': (error: string) => void
}

export interface ClientToServerEvents {
    'env/install': () => void
    'env/uninstall': () => void
    'env/installed': () => boolean
    'git/log': () => LogResult<DefaultLogFields>
    'git/pull': () => PullResult
    'config/get': () => string
    'config/save': (str: string) => void
    'ui-config/get': () => string
    'ui-config/save': (str: string) => void
    'folder/open': () => void
    'webui/running': () => boolean
    'webui/logs': () => string[]
    'webui/launch': (args: string, env: Record<string, any>, commit: string) => number
    'webui/stop': () => void
    'webui/port': () => number
    'webui/data-dir': () => string
}
