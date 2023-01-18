import path from 'path'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
    base: './',
    build: { target: 'esnext' },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
            '~i18n': path.resolve(__dirname, 'i18n'),
        },
    },
    plugins: [
        Icons({
            compiler: 'solid',
        }),
        solidPlugin(),
    ],
})
