import AdmZip from 'adm-zip'
import { spawn } from 'child_process'
import crypto from 'crypto'
import builder from 'electron-builder'
import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as vite from 'vite'
import yaml from 'yaml'

import packageJson from '../package.json' assert { type: 'json' }

const __dirname = fileURLToPath(path.dirname(import.meta.url))
const __dev = process.env['NODE_ENV'] === 'development'
const cwd = path.dirname(__dirname)

/**
 * @param {boolean} run
 */
const bundle = async (run) => {
    const outdir = path.join(cwd, 'dist')
    if (fs.existsSync(outdir)) await fs.promises.rm(outdir, { recursive: true })

    /** @type {import('esbuild').BuildOptions} */
    const config = {
        logLevel: 'info',
        bundle: true,
        sourcemap: __dev,
        minify: !__dev,
        entryPoints: {
            index: path.join(cwd, 'main', 'index.ts'),
            preload: path.join(cwd, 'preload', 'index.ts'),
        },
        outdir,
        format: 'cjs',
        platform: 'node',
    }
    if (!run)
        await vite.build({
            configFile: './vite.config.ts',
        })
    await esbuild.build({
        ...config,
        entryPoints: {
            index: path.join(cwd, 'src', 'index.ts'),
            preload: path.join(cwd, 'src', 'preload', 'index.ts'),
        },
        outdir,
        format: 'cjs',
        outExtension: {
            '.js': '.cjs',
        },
        external: ['electron'],
        platform: 'node',
    })
}

const build = async () => {
    await builder.build({
        publish: 'never',
        config: {
            appId: 'world.ddpn.flat',
            productName: 'flat',
            artifactName: '${productName}-v${version}.${ext}',
            copyright: 'Copyright © 2023 ddPn08',
            directories: { app: cwd, output: path.join(cwd, 'product') },
            win: {
                target: [
                    {
                        target: 'nsis',
                        arch: 'x64',
                    },
                ],
            },
            icon: './assets/icon-512x512.png',
            compression: 'store',
            files: ['dist/**/*', '!node_modules/**/*'],
            asar: false,
        },
    })
    await fs.promises.writeFile(path.join(cwd, 'product/win-unpacked/resources/.portable'), '')

    const application = new AdmZip()
    application.addLocalFolder(path.join(cwd, 'product/win-unpacked'))
    application.writeZip(path.join(cwd, `product/flat-v${packageJson.version}.zip`))

    const app = new AdmZip()
    app.addLocalFolder(path.join(cwd, 'product/win-unpacked/resources/app'))
    app.writeZip(path.join(cwd, `product/app.zip`))

    const file = await fs.promises.readFile(path.join(cwd, 'product/app.zip'))
    const size = file.byteLength
    const md5 = crypto.createHash('md5').update(file).digest('hex')
    const meta = {
        version: packageJson.version,
        size,
        md5,
    }
    await fs.promises.writeFile(path.join(cwd, 'product/meta.yaml'), yaml.stringify(meta))
}

const bundleOnly = process.argv.includes('--bundle-only')
const run = process.argv.includes('--run')

await bundle(run)
if (run) {
    const port = 3000

    const server = await vite.createServer({
        configFile: './vite.config.ts',
    })
    server.listen(port)
    const ps = spawn('pnpm', ['electron', 'dist/index.cjs', '--remote-debugging-port=9222'], {
        env: {
            ...process.env,
            NODE_ENV: 'development',
            DEV_SERVER_ADDRESS: `http://localhost:${port}`,
        },
    })
    ps.stdout.pipe(process.stdout)
    ps.stderr.pipe(process.stderr)
    ps.on('close', async () => {
        await server.close()
        process.exit()
    })
} else {
    if (bundleOnly) process.exit()
    await build()
}
