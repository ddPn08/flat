import { useI18n } from '@solid-primitives/i18n'
import { css, styled, useTheme } from 'decorock'
import { Component, createSignal, Match, onCleanup, onMount, Show, Switch } from 'solid-js'

import { CondaInstall } from './conda-install'
import { ipc } from '../../lib/ipc'
import { Log } from '../log'
import { Modal } from '../modal'
import { Button } from '../ui/button'

const Container = styled.div``

export const GitInstall: Component = () => {
  const theme = useTheme()
  const [t] = useI18n()
  const [isOpen, setIsOpen] = createSignal(false)
  const [installed, setInstalled] = createSignal(false)
  const [errorInstallation, setErrorInstallation] = createSignal(false)
  const [finishInstallation, setFinishInstallation] = createSignal(false)
  const [installing, setInstalling] = createSignal(false)
  const [logs, setLogs] = createSignal<string[]>([])

  const onLog = (_: any, log: string) => {
    setLogs((prev) => [...prev, ...log.split('\n')])
  }

  onMount(async () => {
    const isInstalled = await ipc.git.invoke('check')
    setInstalled(isInstalled)
    if (isInstalled) return setIsOpen(false)
    setIsOpen(true)
  })

  onCleanup(() => {
    ipc.git.off('log', onLog)
  })

  return (
    <Container>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <Switch>
          <Match when={installing()}>
            <h1>Installing Git...</h1>
            <Log>{logs()}</Log>
          </Match>
          <Match when={!installing() && errorInstallation()}>
            <h1
              class={css`
                color: ${theme.colors.primary};
                font-size: 1.25rem;
                font-weight: bold;
              `}
            >
              {t('system/git-install-error/title')}
            </h1>
            <p>{t('system/git-install-error/description')}</p>
          </Match>
          <Match when={!installing() && !finishInstallation()}>
            <h1
              class={css`
                color: ${theme.colors.primary};
                font-size: 1.25rem;
                font-weight: bold;
              `}
            >
              {t('system/git-install/title')}
            </h1>
            <p>{t('system/git-install/description')}</p>
            <br />
            <Button
              onClick={() => {
                setInstalling(true)
                ipc.git.invoke('install')
                ipc.git.on('log', onLog)
                ipc.git.once('install/close', (_, code) => {
                  if (code !== 0) setErrorInstallation(true)
                  else setFinishInstallation(true)
                  setInstalling(false)
                })
              }}
            >
              {t('system/git-install/button')}
            </Button>
          </Match>
          <Match when={!installing() && finishInstallation()}>
            <h1>{t('system/git-install-finish/title')}</h1>
            <p>{t('system/git-install-finish/description')}</p>
            <Button
              onClick={() => {
                ipc.system.invoke('app/restart')
              }}
            >
              Restart
            </Button>
          </Match>
        </Switch>
      </Modal>
      <Show when={installed()}>
        <CondaInstall />
      </Show>
    </Container>
  )
}
