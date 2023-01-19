import path from 'path'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
    base: './',
    build: { target: 'esnext' },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
            '~i18n': path.resolve(__dirname, 'i18n'),
            'package.json': path.resolve(__dirname, 'package.json'),
        },
    },
    plugins: [
        (monacoEditorPlugin as any).default({}),
        Icons({
            compiler: 'solid',
        }),
        solidPlugin(),
    ],
})
