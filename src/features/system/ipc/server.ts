import type { ClientToServerEvents, ServerToClientEvents } from './types'

import { IpcServer } from '~/ipc/server'

export const ipcSystem = new IpcServer<ServerToClientEvents, ClientToServerEvents>('system')
