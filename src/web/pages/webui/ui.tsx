import { useI18n } from '@solid-primitives/i18n'
import { css, styled } from 'decorock'
import { Component, createEffect, createSignal, on, Show, useContext } from 'solid-js'

import { WebUIContext } from '.'

import { VStack } from '~/web/components/ui/stack'
import { shell } from '~/web/lib/electron'

const Container = styled.div`
  height: 100%;

  webview {
    width: 100%;
    height: 100%;
    border: none;
    vertical-align: bottom;
  }
`

export const UI: Component = () => {
  const { url } = useContext(WebUIContext)
  const [ref, setRef] = createSignal<Electron.WebviewTag>()
  const [t] = useI18n()

  const setup = (url: string) => {
    if (!url) return
    const el = ref()!
    el.addEventListener('console-message', (e) => {
      if (e.message.startsWith('flat:message:anchor-click:')) {
        const url = e.message.replace('flat:message:anchor-click:', '')
        shell.openExternal(url)
      }
    })
    el.addEventListener('dom-ready', (e) => {
      el.executeJavaScript(`
        if(typeof window['__flat_click_registered'] === 'undefined') {
          window['__flat_click_registered'] = true
          gradioApp().addEventListener('click', (e) => {
            const el = e.target
            if(el.tagName && el.tagName === 'A'){
              console.log('flat:message:anchor-click:' + el.href)
            }
          })
        }
      `)
    })
  }

  createEffect(on(url, setup))

  return (
    <Container>
      <Show
        when={url()}
        fallback={
          <VStack
            class={css`
              height: 100%;
              justify-content: center;
            `}
          >
            <h1>{t('webui/launcher/not-running/title')}</h1>
          </VStack>
        }
      >
        <webview ref={setRef} src={url()} />
      </Show>
    </Container>
  )
}

declare module 'solid-js' {
  export namespace JSX {
    export interface IntrinsicElements
      extends HTMLElementTags,
        HTMLElementDeprecatedTags,
        SVGElementTags {
      webview: Partial<
        Electron.WebviewTag & {
          ref: any
        }
      >
    }
  }
}
