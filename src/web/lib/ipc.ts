import { IpcClient } from '../../ipc/client'

import type {
    ClientToServerEvents as CondaClientToServerEvents,
    ServerToClientEvents as CondaServerToClientEvents,
} from '~/features/conda/ipc'
import type {
    ClientToServerEvents as GalleyClientToServerEvents,
    ServerToClientEvents as GalleyServerToClientEvents,
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
    galley: new IpcClient<GalleyServerToClientEvents, GalleyClientToServerEvents>('galley'),
    webui: new IpcClient<WebUIServerToClientEvents, WebUIClientToServerEvents>(
        'stable-diffusion-webui',
    ),
    git: new IpcClient<GitServerToClientEvents, GitClientToServerEvents>('git'),
}
