import { css, styled, useTheme } from 'decorock'
import { Component, createSignal, onCleanup, onMount } from 'solid-js'

import { ipc } from '../../lib/ipc'
import { Log } from '../log'
import { Modal } from '../modal'

const Container = styled.div``

export const CondaInstall: Component = () => {
  const theme = useTheme()
  const [isOpen, setIsOpen] = createSignal(false)
  const [message, setMessage] = createSignal('Checking conda environment...')
  const [logs, setLogs] = createSignal<string[]>([])

  const onLog = (_: any, log: string) => {
    setLogs((prev) => [...prev, ...log.split('\n')])
  }

  onMount(async () => {
    const isInstalled = await ipc.conda.invoke('env/installed')
    if (isInstalled) return setIsOpen(false)
    setIsOpen(true)
    setMessage('Installing miniconda3 ...')
    ipc.conda.invoke('install/start')
    ipc.conda.on('install/log', onLog)
    ipc.conda.once('install/close', () => {
      setIsOpen(false)
    })
  })

  onCleanup(() => {
    ipc.conda.off('install/log', onLog)
  })

  return (
    <Container>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <h1
          class={css`
            color: ${theme.colors.primary};
            font-size: 1.25rem;
            font-weight: bold;
          `}
        >
          {message()}
        </h1>
        <br />
        <Log height="50vh">{logs()}</Log>
      </Modal>
    </Container>
  )
}
