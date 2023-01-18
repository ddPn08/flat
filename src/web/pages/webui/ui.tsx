import { useI18n } from '@solid-primitives/i18n'
import { css, styled } from 'decorock'
import { Component, createEffect, createSignal, Show, useContext } from 'solid-js'

import { WebUIContext } from '.'

import { VStack } from '~/web/components/ui/stack'

const Container = styled.div`
  height: 100%;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    vertical-align: bottom;
  }
`

export const UI: Component = () => {
  const { url } = useContext(WebUIContext)
  const [t] = useI18n()
  const [ref, setRef] = createSignal<HTMLIFrameElement>()
  createEffect(() => {
    const iframe = ref()!
  })
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
        <iframe ref={setRef} src={url()} id="iiii" />
      </Show>
    </Container>
  )
}
