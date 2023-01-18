import { useI18n } from '@solid-primitives/i18n'
import { styled } from 'decorock'

import { Label } from '~/web/components/ui/label'
import { Select } from '~/web/components/ui/select'
import { Config, config, setConfig } from '~/web/lib/config'

const Container = styled.div`
  padding: 1rem;
`

export const SETTINGS = () => {
  const [t, { locale }] = useI18n()
  return (
    <Container>
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
      <br />
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
    </Container>
  )
}
