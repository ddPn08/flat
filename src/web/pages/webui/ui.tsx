import { useI18n } from '@solid-primitives/i18n'
import { css, styled } from 'decorock'
import {
  Component,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
  Show,
  useContext,
} from 'solid-js'
import { createStore } from 'solid-js/store'

import { WebUIContext } from '.'

import __inject_webui from '~/scripts/webui/__inject_webui.js?raw'
import { Modal } from '~/web/components/modal'
import { Button } from '~/web/components/ui/button'
import { Input } from '~/web/components/ui/input'
import { VStack } from '~/web/components/ui/stack'
import { ipc } from '~/web/lib/ipc'
import { shell } from '~/web/lib/node/electron'

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
  const [promptData, setPromptData] = createStore({
    open: false,
    title: '',
    value: '',
    fin: false,
    cancel: false,
  })
  const [t] = useI18n()

  const prompt = (title: string) => {
    return new Promise((resolve, reject) => {
      setPromptData({
        open: true,
        title,
        fin: false,
        cancel: false,
      })
      setInterval(() => {
        if (!promptData.fin && !promptData.cancel) return
        if (promptData.cancel) reject()
        const value = promptData.value.toString()
        setPromptData({
          open: false,
          title: '',
          value: '',
          fin: false,
          cancel: false,
        })
        resolve(value)
      }, 100)
    })
  }

  const evalWebView = (js: string) => {
    const webview = ref()!
    webview.executeJavaScript(js)
  }

  const setup = (url: string) => {
    if (!url) return
    const webview = ref()!
    webview.addEventListener('ipc-message', async (e) => {
      switch (e.channel) {
        case 'click_anchor': {
          const url = e.args[0]
          shell.openExternal(url)
          break
        }
        case 'ask_for_style_name': {
          try {
            const name = await prompt(e.args[0])
            webview.send('ask_for_style_name', name)
          } catch (_) {
            webview.send('ask_for_style_name', null)
          }
          break
        }
      }
    })
    webview.addEventListener('dom-ready', () => {
      webview.executeJavaScript(__inject_webui)
    })
  }

  onMount(() => {
    ipc.webui.local.on('webui/eval', evalWebView)
  })

  onCleanup(() => {
    ipc.webui.local.off('webui/eval', evalWebView)
  })

  createEffect(on(url, setup))

  return (
    <Container>
      <Modal isOpen={promptData.open} onClose={() => setPromptData('open', false)}>
        <h1>{promptData.title}</h1>
        <br />
        <Input
          value={promptData.value}
          onInput={(e) => setPromptData('value', e.currentTarget.value)}
        />
        <br />
        <Button
          onClick={() => {
            setPromptData('fin', true)
          }}
        >
          OK
        </Button>
        <Button
          onClick={() => {
            setPromptData('cancel', true)
          }}
        >
          Cancel
        </Button>
      </Modal>
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
        <webview
          ref={setRef}
          src={url()}
          nodeintegration
          disablewebsecurity
          webpreferences="contextIsolation=false"
        />
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
        Electron.WebviewTag &
          HTMLElement & {
            ref: IntrinsicElements['webview'] | ((el: IntrinsicElements['webview']) => void)
          }
      >
    }
  }
}
