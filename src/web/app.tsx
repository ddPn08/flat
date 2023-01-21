import { createI18nContext, I18nContext } from '@solid-primitives/i18n'
import { css } from 'decorock'
import { createSignal } from 'solid-js'

import { GitInstall } from './components/dependencies/git-install'
import { MenuButton } from './components/menu-button'
import { Tabs, TabPanel } from './components/ui/tabs'
import { ToastProvider } from './components/ui/toast'
import { Updater } from './components/updater'
import { config } from './lib/config'
import { Gallery } from './pages/gallery'
import { General } from './pages/general'
import { WebUI } from './pages/webui'
import { ThemeProvider } from './styles'

import { dict } from '~i18n/index'

const value = createI18nContext(dict, config['system/lang'])

export const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <I18nContext.Provider value={value}>
          <Index />
        </I18nContext.Provider>
      </ToastProvider>
    </ThemeProvider>
  )
}

const PAGES = {
  General,
  Gallery,
  WebUI,
}

const Index = () => {
  const [isOpen, setIsOpen] = createSignal(true)
  return (
    <>
      <GitInstall />
      <Updater />
      <MenuButton onChange={setIsOpen} />
      <Tabs
        tabClose={!isOpen()}
        vertical
        tabs={PAGES}
        tab={([label, Comp], isSelected) => {
          return (
            <TabPanel
              class={css`
                transition: 0.2s;
                ${isOpen() ? '' : 'margin-left: -150px;'}
              `}
              show={isSelected()}
              unmount={label !== 'WebUI'}
            >
              <Comp />
            </TabPanel>
          )
        }}
      />
    </>
  )
}
