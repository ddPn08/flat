import type { Config } from '~/web/lib/config'

export interface ServerToClientEvents {}

export interface ClientToServerEvents {
    'app/restart': () => void
    'path/user-data': () => string
    'update/check': () => boolean
    'update/prepare': () => void
    'update/install': () => void
    'window/is-focused': () => boolean
    'config/save': (config: Config) => void
}
