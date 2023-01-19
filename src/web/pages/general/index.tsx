import { useI18n } from '@solid-primitives/i18n'
import Color from 'color'
import { css, styled, useTheme } from 'decorock'
import packageJson from 'package.json'
import { For } from 'solid-js'

import { Label } from '~/web/components/ui/label'
import { Select } from '~/web/components/ui/select'
import { Config, config, setConfig } from '~/web/lib/config'
import Icon from '~assets/icon-512x512.png'

const Container = styled.div`
  height: 100%;
  padding: 1rem;

  img {
    width: 128px;
    height: 128px;
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
  return (
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
          <span>v{packageJson.version}</span>
          <div>
            <For each={t('general/app/description').split('\n')}>{(txt) => <p>{txt}</p>}</For>
          </div>
          <a href="https://github.com/ddPn08/flat">{t('general/app/repository')}</a>
          <a href="https://github.com/ddPn08/flat/issues">{t('general/app/report')}</a>
        </div>
      </div>
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
  )
}
