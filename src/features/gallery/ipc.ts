import type { ImageData, ImageSearchOptions } from './types'

export interface ServerToClientEvents {}

export interface ClientToServerEvents {
    'dirs/update': (paths: string[]) => void
    'images/get': (dir: string, search?: ImageSearchOptions) => ImageData[]
    'images/glob': (dir?: string | undefined) => void
    'favorite/add': (dir: string, path: string) => void
    'favorite/remove': (dir: string, path: string) => void
}
