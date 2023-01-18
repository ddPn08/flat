import { useI18n } from '@solid-primitives/i18n'
import { css, styled } from 'decorock'
import { Component, Show, useContext } from 'solid-js'

import { WebUIContext } from '.'

import { VStack } from '~/web/components/ui/stack'

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
  const [t] = useI18n()
  return (
    <Container>
      <Show
        when={url() !== 'about:blank'}
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
        <webview src={url()} />
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
      webview: {
        src: string
      }
    }
  }
}
