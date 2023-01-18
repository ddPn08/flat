import { useI18n } from '@solid-primitives/i18n'
import { css, styled, useTheme } from 'decorock'
import type { DefaultLogFields, LogResult } from 'simple-git'
import { Component, createSignal, onCleanup, onMount, Show, useContext } from 'solid-js'

import { WebUIContext } from '.'

import { Log } from '~/web/components/log'
import { AutoComplete } from '~/web/components/ui/auto-complete'
import { Button } from '~/web/components/ui/button'
import { IconButton } from '~/web/components/ui/icon-button'
import { Label } from '~/web/components/ui/label'
import { HStack } from '~/web/components/ui/stack'
import { useToast } from '~/web/components/ui/toast'
import { config, setConfig } from '~/web/lib/config'
import { ipc } from '~/web/lib/ipc'
import IconStartArrow from '~icons/material-symbols/play-arrow'
import IconStop from '~icons/material-symbols/stop'

const Container = styled.div`
  display: grid;
  overflow: auto;
  height: calc(100vh - 50px);
  grid-template-columns: 70% 30%;
  grid-template-rows: 1fr 150px;
`

const StyledIconButton = styled(IconButton)`
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 1.5rem;
`

export const createArgs = () => {
  let result = ''
  for (const [key, val] of Object.entries(config)) {
    if (!key.startsWith('webui/args')) continue
    const arg = key.split('/').slice(-1)[0]
    if (arg === 'vae-path') continue
    if (arg === 'custom') result += val
    else if (typeof val === 'boolean' && val) result += ` --${arg}`
    else if (typeof val === 'string') result += ` --${arg} "${val}"`.replace(/\\/g, '\\\\')
    else result += ` --${arg} ${val}`
  }
  return result
}

export const Launcher: Component = () => {
  const theme = useTheme()
  const toast = useToast()
  const [t] = useI18n()
  const { setUrl, onLaunch } = useContext(WebUIContext)
  const [gitLog, setGitLog] = createSignal<LogResult<DefaultLogFields>['all']>([])
  const [logs, setLogs] = createSignal<string[]>([])
  const [installed, setInstalled] = createSignal(false)
  const [installing, setInstalling] = createSignal(false)
  const [running, setRunning] = createSignal(false)

  const onLog = (_: any, log: string) => {
    const logs = log.split('\n')
    setLogs((prev) => [...prev, ...logs])

    const re = /Running on local URL: (.*)/
    const url = logs.map((v) => v.match(re)).filter(Boolean)
    if (url.length > 0) {
      toast({
        title: t('webui/launcher/launched/title'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      const matches = url[0] as RegExpMatchArray
      setTimeout(() => onLaunch(matches[1] as string), 500)
    }
  }

  onMount(async () => {
    const installed = await ipc.webui.invoke('env/installed')
    setInstalled(installed)
    setLogs(await ipc.webui.invoke('webui/logs'))
    setRunning(await ipc.webui.invoke('webui/running'))
    if (installed) {
      const log = await ipc.webui.invoke('git/log')
      setGitLog(log.all)
    }

    ipc.webui.on('log', onLog)
    ipc.webui.on('env/uninstalled', () => setInstalled(false))
  })

  onCleanup(() => {
    ipc.webui.off('log', onLog)
  })

  const install = () => {
    setInstalling(true)
    setLogs([])
    ipc.webui.invoke('env/install').then(() => {
      setInstalling(false)
      setInstalled(true)
      toast({
        title: t('webui/launcher/install-success/title'),
        description: t('webui/launcher/install-success/description'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    })
  }

  return (
    <Container>
      <Show
        when={installed() || installing()}
        fallback={
          <div
            class={css`
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
              background-color: ${theme.colors.primary.fade(0.8)};
            `}
          >
            <h1>{t('webui/launcher/not-installed/title')}</h1>
            <p>{t('webui/launcher/not-installed/description')}</p>
            <Button onClick={install}>{t('webui/launcher/not-installed/button')}</Button>
          </div>
        }
      >
        <Log
          class={css`
            grid-row: 1/2;
            height: 100%;
          `}
          height="100%"
        >
          {logs()}
        </Log>
      </Show>
      <div
        class={css`
          position: relative;
          grid-row: 1/3;
          grid-column: 2/3;
          padding: 1rem;
          pointer-events: ${installed() ? 'inherit' : 'none'};
          user-select: none;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        `}
      >
        <Show when={!installed()}>
          <div
            class={css`
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 10;
              background-color: rgba(0, 0, 0, 0.5);
            `}
          />
        </Show>
        <Label>{t('webui/launcher/config/commit')}</Label>
        <AutoComplete
          suggestions={() => ['master', ...gitLog().map((v) => v.hash.slice(0, 6))]}
          value={config['webui/git/commit']}
          onInput={(value) => setConfig('webui/git/commit', value)}
          onChange={(value) => setConfig('webui/git/commit', value)}
          limit={50}
        />

        <Button task={() => ipc.webui.invoke('git/pull')}>
          {t('webui/launcher/config/update')}
        </Button>
      </div>
      <div
        class={css`
          grid-row: 2/3;
          padding: 0 1rem;
        `}
      >
        <HStack>
          <StyledIconButton
            onClick={() => {
              setRunning(true)
              setLogs([])
              ipc.webui.invoke('webui/launch', createArgs(), '')
              ipc.webui.once('webui/close', () => {
                setUrl('about:blank')
                setRunning(false)
              })
            }}
            disabled={running() || !installed()}
          >
            <IconStartArrow />
          </StyledIconButton>
          <StyledIconButton
            onClick={() => {
              setUrl('about:blank')
              setRunning(false)
              ipc.webui.invoke('webui/stop')
            }}
            disabled={!running() || !installed()}
          >
            <IconStop />
          </StyledIconButton>
        </HStack>
      </div>
    </Container>
  )
}
