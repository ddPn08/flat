import { useI18n } from '@solid-primitives/i18n'
import Color from 'color'
import { css, styled, useTheme } from 'decorock'
import packageJson from 'package.json'
import { createResource, createSignal, For } from 'solid-js'

import { Modal } from '~/web/components/modal'
import { Button } from '~/web/components/ui/button'
import { Label } from '~/web/components/ui/label'
import { Select } from '~/web/components/ui/select'
import { VStack } from '~/web/components/ui/stack'
import { Config, config, setConfig } from '~/web/lib/config'
import { ipc } from '~/web/lib/ipc'
import Icon from '~assets/icon-512x512.png'
import IconUpdate from '~icons/material-symbols/update-rounded'

const Container = styled.div`
  height: 100%;
  padding: 1rem;

  img {
    width: 96px;
    height: 96px;
  }
`

const Setting = styled.div`
  display: grid;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: ${(p) => p.theme.colors.primary.fade(0.95)};
  grid-template-columns: 30% 70%;
  grid-template-rows: 100%;
`

export const General = () => {
  const [t, { locale }] = useI18n()
  const theme = useTheme()
  const [hasUpdate, { refetch }] = createResource(() => ipc.system.invoke('update/check'))
  const [isOpen, setIsOpen] = createSignal(false)
  return (
    <>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <h1>{t('system/update-installed/title')}</h1>
        <div>{t('system/update-installed/description')}</div>
      </Modal>
      <Container>
        <h1>General</h1>
        <br />
        <div
          class={css`
            display: flex;
            align-items: center;
            gap: 1rem;

            & > div {
              p {
                color: ${theme.colors.primary.fade(0.2)};
              }

              & > div {
                margin-top: 0.5rem;
              }

              a {
                margin-right: 0.5rem;
                color: ${theme.name === 'light'
                  ? Color('rgb(0, 255, 255)').darken(0.25)
                  : Color('rgb(0, 255, 255)')};

                &:hover {
                  text-decoration: underline;
                }
              }
            }
          `}
        >
          <img src={Icon} alt="" />
          <div>
            <div>
              <For each={t('general/app/description').split('\n')}>{(txt) => <p>{txt}</p>}</For>
            </div>
            <a href="https://github.com/ddPn08/flat">{t('general/app/repository')}</a>
            <a href="https://github.com/ddPn08/flat/issues">{t('general/app/report')}</a>
          </div>
        </div>
        <br />
        <Setting>
          <div
            class={css`
              display: grid;
              gap: 1rem;
              grid-template-columns: 64px 1fr;
              grid-template-rows: 100%;

              svg {
                width: 64px;
                height: 64px;
              }
            `}
          >
            <IconUpdate />
            <VStack>
              <span>{packageJson.version}</span>
              <div>
                {hasUpdate() ? t('system/update-available/title') : t('system/update/latest')}
              </div>
            </VStack>
          </div>
          <div
            class={css`
              text-align: right;
            `}
          >
            <Button
              // eslint-disable-next-line solid/reactivity
              task={async () => {
                if (hasUpdate()) {
                  await ipc.system.invoke('update/install')
                  setIsOpen(true)
                } else {
                  await refetch()
                }
              }}
            >
              {hasUpdate() ? t('system/update/install') : t('system/update/check')}
            </Button>
          </div>
        </Setting>
        <br />
        <Setting>
          <Label>{t('system/settings/lang')}</Label>
          <Select
            options={[
              {
                label: '日本語',
                value: 'ja',
              },
              {
                label: 'English',
                value: 'en',
              },
            ]}
            value={config['system/lang']}
            onChange={(option) => {
              setConfig('system/lang', option.value as Config['system/lang'])
              locale(option.value)
            }}
          />
        </Setting>
        <br />
        <Setting>
          <Label>{t('system/settings/theme')}</Label>
          <Select
            options={[
              {
                label: 'Dark',
                value: 'dark',
              },
              {
                label: 'Light',
                value: 'light',
              },
            ]}
            value={config['system/theme']}
            onChange={(option) => {
              setConfig('system/theme', option.value as Config['system/theme'])
            }}
          />
        </Setting>
      </Container>
    </>
  )
}
