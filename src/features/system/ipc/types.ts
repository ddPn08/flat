export interface ServerToClientEvents {}

export interface ClientToServerEvents {
    'app/restart': () => void
    'path/user-data': () => string
    'update/check': () => boolean
    'window/is-focused': () => boolean
}
