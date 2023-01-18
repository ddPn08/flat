import type { Config } from '~/web/lib/config'

export interface ServerToClientEvents {}

export interface ClientToServerEvents {
    'app/restart': () => void
    'path/user-data': () => string
    'update/check': () => boolean
    'window/is-focused': () => boolean
    'config/save': (config: Config) => void
}
