import type { ImageData, ImageSearchOptions } from './types'

export interface ServerToClientEvents {}

export interface ClientToServerEvents {
    'dirs/update': (paths: string[]) => void
    'images/get': (dir: string, search?: ImageSearchOptions) => ImageData[]
    'favorite/add': (dir: string,path: string) => void
    'favorite/remove': (dir: string,path: string) => void
}
