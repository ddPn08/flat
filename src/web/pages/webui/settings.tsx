import { useI18n } from '@solid-primitives/i18n'
import { css, styled } from 'decorock'
import { Component, createSignal, onCleanup, Show } from 'solid-js'

import { Log } from '~/web/components/log'
import { Modal } from '~/web/components/modal'
import { Button } from '~/web/components/ui/button'
import { CheckBox } from '~/web/components/ui/checkbox'
import { Input } from '~/web/components/ui/input'
import { Label } from '~/web/components/ui/label'
import { HStack } from '~/web/components/ui/stack'
import { config, setConfig } from '~/web/lib/config'
import { ipc } from '~/web/lib/ipc'

const Container = styled.div`
  height: 100%;
  margin: 0.5rem 1rem;
  text-align: left;
`

const UninstallEnv: Component<{ onClose: () => void }> = (props) => {
  const [t] = useI18n()
  const [uninstalling, setUninstalling] = createSignal(false)
  const [logs, setLogs] = createSignal<string[]>([])

  const onLog = (_: any, log: string) => {
    setLogs((prev) => [...prev, ...log.split('\n')])
  }

  onCleanup(() => {
    ipc.webui.off('log', onLog)
  })

  return (
    <>
      <Show
        when={uninstalling()}
        fallback={
          <>
            <h1>{t('webui/launcher/uninstall-env/title')}</h1>
            <p>{t('webui/launcher/uninstall-env/description')}</p>
            <HStack>
              <Button
                onClick={() => {
                  setUninstalling(true)
                  ipc.webui.invoke('env/uninstall').then(() => props.onClose())
                  ipc.webui.on('log', onLog)
                }}
              >
                OK
              </Button>
              <Button onClick={() => props.onClose()}>Cancel</Button>
            </HStack>
          </>
        }
      >
        <h1>Uninstalling conda environment ...</h1>
        <Log
          class={css`
            min-height: 50vh;
          `}
        >
          {logs()}
        </Log>
      </Show>
    </>
  )
}

export const Settings: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false)
  const [dialog, setDialog] = createSignal<'uninstall-env' | 'uninstall'>('uninstall-env')
  const [t] = useI18n()

  return (
    <Container>
      <Label>{t('webui/config/ckpt-dir')}</Label>
      <Input
        value={config['webui/args/ckpt-dir']}
        onInput={(e) => setConfig('webui/args/ckpt-dir', e.currentTarget.value)}
      />
      <br />

      <Label>{t('webui/config/vae-dir')}</Label>
      <Input
        value={config['webui/args/vae-dir']}
        onInput={(e) => setConfig('webui/args/vae-dir', e.currentTarget.value)}
      />
      <br />

      <Label>{t('webui/config/hypernetwork-dir')}</Label>
      <Input
        value={config['webui/args/hypernetwork-dir']}
        onInput={(e) => setConfig('webui/args/hypernetwork-dir', e.currentTarget.value)}
      />
      <br />

      <Label>{t('webui/config/embeddings-dir')}</Label>
      <Input
        value={config['webui/args/embeddings-dir']}
        onInput={(e) => setConfig('webui/args/embeddings-dir', e.currentTarget.value)}
      />
      <br />

      <HStack>
        <Label>{t('webui/config/xformers')}</Label>
        <br />
        <CheckBox
          checked={config['webui/args/xformers']}
          onChange={(e) => setConfig('webui/args/xformers', e.currentTarget.checked)}
        />
      </HStack>
      <br />

      <Label>{t('webui/config/custom')}</Label>
      <Input
        value={config['webui/args/custom']}
        onInput={(e) => setConfig('webui/args/custom', e.currentTarget.value)}
      />
      <br />

      <Label>{t('webui/config/env')}</Label>
      <Input
        value={config['webui/settings/env']}
        onInput={(e) => setConfig('webui/settings/env', e.currentTarget.value)}
      />
      <br />

      <HStack>
        <Button
          onClick={() => {
            setIsOpen(true)
            setDialog('uninstall-env')
          }}
        >
          {t('webui/launcher/uninstall-env/button')}
        </Button>
        {/* <Button>{t('webui/launcher/uninstall/button')}</Button> */}
      </HStack>

      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)} closable>
        <Show when={dialog() === 'uninstall-env'}>
          <UninstallEnv onClose={() => setIsOpen(false)} />
        </Show>
      </Modal>
    </Container>
  )
}
