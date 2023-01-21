import { useI18n } from '@solid-primitives/i18n'
import { css, styled } from 'decorock'
import { Component, For, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'

import { Button } from '~/web/components/ui/button'
import { IconButton } from '~/web/components/ui/icon-button'
import { Input } from '~/web/components/ui/input'
import { Label } from '~/web/components/ui/label'
import { config, setConfig } from '~/web/lib/config'
import { ipc } from '~/web/lib/ipc'
import AddIcon from '~icons/material-symbols/add'
import RemoveIcon from '~icons/material-symbols/remove'

const Container = styled.div`
  margin: 0.5rem 1rem;
  text-align: left;
`

export const Config: Component = () => {
  const [t] = useI18n()
  const [dirs, setDirs] = createStore<string[]>([])

  onMount(() => setDirs(config['gallery/dirs']))

  return (
    <Container>
      <Label>{t('gallery/config/paths')}</Label>

      <div>
        <For each={dirs}>
          {(path, i) => (
            <div
              class={css`
                display: grid;
                align-items: center;
                grid-template-columns: 1fr 50px;
                grid-template-rows: 100%;
              `}
            >
              <Input value={path} onChange={(e) => setDirs(i(), e.currentTarget.value)} />
              <IconButton
                onClick={() => {
                  setDirs((dirs) => dirs.filter((_, i2) => i2 !== i()))
                }}
              >
                <RemoveIcon />
              </IconButton>
            </div>
          )}
        </For>
        <br />
        <IconButton
          onClick={() => {
            setDirs((paths) => [...paths, ''])
          }}
        >
          <AddIcon />
        </IconButton>
      </div>
      <br />
      <Button
        task={() => {
          setConfig('gallery/dirs', [...dirs])
          return ipc.gallery
            .invoke('dirs/update', [...dirs])
            .then(() => ipc.gallery.invoke('images/glob'))
        }}
      >
        {t('gallery/config/apply')}
      </Button>
    </Container>
  )
}
