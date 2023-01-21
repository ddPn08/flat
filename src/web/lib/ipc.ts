import { IpcClient } from '../../ipc/client'

import type {
    ClientToServerEvents as CondaClientToServerEvents,
    ServerToClientEvents as CondaServerToClientEvents,
} from '~/features/conda/ipc'
import type {
    ClientToServerEvents as GalleryClientToServerEvents,
    ServerToClientEvents as GalleryServerToClientEvents,
} from '~/features/gallery/ipc'
import type {
    ClientToServerEvents as GitClientToServerEvents,
    ServerToClientEvents as GitServerToClientEvents,
} from '~/features/git/ipc'
import type {
    ClientToServerEvents as WebUIClientToServerEvents,
    ServerToClientEvents as WebUIServerToClientEvents,
} from '~/features/stable-diffusion-webui/ipc'
import type {
    ClientToServerEvents as SystemClientToServerEvents,
    ServerToClientEvents as SystemServerToClientEvents,
} from '~/features/system/ipc/types'

export const ipc = {
    system: new IpcClient<SystemServerToClientEvents, SystemClientToServerEvents>('system'),
    conda: new IpcClient<CondaServerToClientEvents, CondaClientToServerEvents>('conda'),
    gallery: new IpcClient<GalleryServerToClientEvents, GalleryClientToServerEvents>('gallery'),
    webui: new IpcClient<WebUIServerToClientEvents, WebUIClientToServerEvents>(
        'stable-diffusion-webui',
    ),
    git: new IpcClient<GitServerToClientEvents, GitClientToServerEvents>('git'),
}
