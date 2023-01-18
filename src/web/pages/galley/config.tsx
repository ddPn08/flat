import { useI18n } from '@solid-primitives/i18n'
import { css, styled } from 'decorock'
import { Component, For } from 'solid-js'

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

const Paths: Component = () => {
  return (
    <div>
      <For each={config['galley/paths']}>
        {(path, i) => (
          <div
            class={css`
              display: grid;
              align-items: center;
              grid-template-columns: 1fr 50px;
              grid-template-rows: 100%;
            `}
          >
            <Input
              value={path}
              onInput={(e) => setConfig('galley/paths', i(), e.currentTarget.value)}
            />
            <IconButton
              onClick={() => {
                setConfig('galley/paths', (paths) => paths.filter((_, i2) => i2 !== i()))
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
          setConfig('galley/paths', (paths) => ['', ...paths])
        }}
      >
        <AddIcon />
      </IconButton>
    </div>
  )
}

export const Config: Component = () => {
  const [t] = useI18n()

  return (
    <Container>
      <Label>{t('galley/config/paths')}</Label>
      <Paths />
      <br />
      <Button
        task={() => {
          console.log(config['galley/paths'])
          return ipc.galley.invoke('pathes/update', [...config['galley/paths']])
        }}
      >
        {t('galley/config/apply')}
      </Button>
    </Container>
  )
}
