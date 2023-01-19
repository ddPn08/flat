import { createEffect } from 'solid-js'
import { createStore } from 'solid-js/store'

import { bpath } from './electron'
import { ipc } from './ipc'

export type Config = {
    'system/lang': 'ja' | 'en'
    'system/theme': 'light' | 'dark'
    'galley/paths': string[]
    'webui/git/commit': string
    'webui/args/ckpt-dir': string
    'webui/args/vae-dir': string
    'webui/args/embeddings-dir': string
    'webui/args/hypernetwork-dir': string
    'webui/args/xformers': boolean
    'webui/args/custom': string
}

const defaultConfig: Config = {
    'system/lang': 'ja',
    'system/theme': 'dark',
    'galley/paths': [],
    'webui/git/commit': 'master',
    'webui/args/ckpt-dir': bpath.join(
        await ipc.webui.invoke('webui/data-dir'),
        'repository',
        'models',
        'Stable-diffusion',
    ),
    'webui/args/vae-dir': '',
    'webui/args/embeddings-dir': bpath.join(
        await ipc.webui.invoke('webui/data-dir'),
        'repository',
        'embeddings',
    ),
    'webui/args/hypernetwork-dir': bpath.join(
        await ipc.webui.invoke('webui/data-dir'),
        'repository',
        'models',
        'hypernetworks',
    ),
    'webui/args/xformers': true,
    'webui/args/custom': '',
}

const merge = (obj: any) => {
    const c: Record<string, any> = {}
    for (const key of Object.keys(defaultConfig)) {
        const val = key in obj ? obj[key] : null
        const defaultVal = defaultConfig[key as keyof typeof defaultConfig]
        if (!val) c[key] = defaultVal
        else if (!Array.isArray(val) && Array.isArray(defaultVal)) c[key] = defaultVal
        else if (typeof val === 'object' && !Array.isArray(val)) c[key] = merge(val)
        else c[key] = val
    }
    return c as Config
}

const raw = localStorage.getItem('config') || ''
let saved = {} as Config
try {
    saved = JSON.parse(raw)
} catch (error) {
    saved = defaultConfig
}
saved = merge(saved)
localStorage.setItem('config', JSON.stringify(saved))
export const [config, setConfig] = createStore<Config>(saved)

createEffect(() => {
    const raw = JSON.stringify(config)
    ipc.system.invoke('config/save', JSON.parse(raw))
    localStorage.setItem('config', raw)
})
