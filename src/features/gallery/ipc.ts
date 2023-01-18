import type { ImageData, ImageSearchOptions } from './types'

export interface ServerToClientEvents {}

export interface ClientToServerEvents {
    'pathes/update': (paths: string[]) => void
    'images/get': (search?: ImageSearchOptions) => ImageData[]
}
