import { css, useTheme } from 'decorock'
import { editor } from 'monaco-editor'
import { Component, createSignal, onMount } from 'solid-js'

import { ipc } from '~/web/lib/ipc'

export const UIConfig: Component = () => {
  const theme = useTheme()
  const [ref, setRef] = createSignal<HTMLDivElement>()

  onMount(async () => {
    const value = await ipc.webui.invoke('ui-config/get')
    const ctx = editor.create(ref()!, {
      value,
      language: 'json',
      theme: theme.name === 'dark' ? 'vs-dark' : 'vs-light',
    })
    ctx.onDidChangeModelContent((e) => {
      const json = ctx.getValue()
      try {
        JSON.parse(json)
        ipc.webui.invoke('ui-config/save', json)
      } catch (_) {}
    })
  })

  return (
    <div
      ref={setRef}
      class={css`
        width: 100%;
        height: 100%;
      `}
    />
  )
}
