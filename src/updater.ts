import AdmZip from 'adm-zip'
import crypto from 'crypto'
import { app } from 'electron'
import fs from 'fs'
import fetch, { Response } from 'node-fetch'
import path from 'path'
import yaml from 'yaml'

import { isDev } from '.'
import type { BuildMeta } from './types'
import packageJson from '../package.json'

const BASE_RELEASE_URL = 'https://github.com/ddPn08/flat/releases/'

let checking = false

const fetchRelease = async (url: string): Promise<Response> => {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'flat',
        },
    })
    switch (res.status) {
        case 302:
            return await fetchRelease(res.headers.get('location')!)
        case 200:
            return res
    }
    throw new Error(`Failed to fetch release: ${url} ${res.status}`)
}

const getMeta = async (): Promise<BuildMeta> => {
    const res = await fetchRelease(BASE_RELEASE_URL + 'latest/download/meta.yaml')
    const text = await res.text()
    return yaml.parse(text)
}

export const update = async () => {
    if (checking) return false
    checking = true
    const meta = await getMeta()
    if (meta.version === packageJson.version) return false

    const appResponse = await fetchRelease(BASE_RELEASE_URL + 'latest/download/app.zip')
    const appBuf = Buffer.from(await appResponse.arrayBuffer())
    const md5 = crypto.createHash('md5').update(appBuf).digest('hex')
    if (appBuf.byteLength !== meta.size) return false
    if (md5 !== meta.md5) return false

    const zip = new AdmZip(appBuf)
    zip.extractAllTo(path.join(app.getPath('userData'), '.next'))
    console.log('Update available')

    if (!isDev) {
        app.on('will-quit', () => {
            const appRoot = path.join(__dirname, '../../../')
            fs.rmSync(path.join(appRoot, 'resources/app'), { recursive: true })
            fs.renameSync(
                path.join(app.getPath('userData'), '.next'),
                path.join(appRoot, 'resources/app'),
            )
        })
    }
    checking = false

    return true
}
