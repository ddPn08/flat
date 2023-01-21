import { createI18nContext, I18nContext } from '@solid-primitives/i18n'
import { css } from 'decorock'
import { createSignal, onCleanup, onMount } from 'solid-js'

import { GitInstall } from './components/dependencies/git-install'
import { MenuButton } from './components/menu-button'
import { Tabs, TabPanel } from './components/ui/tabs'
import { ToastProvider } from './components/ui/toast'
import { Updater } from './components/updater'
import { config } from './lib/config'
import { ipc } from './lib/ipc'
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
  const [current, setCurrent] = createSignal('General')

  onMount(() => {
    ipc.system.local.on('main-tab/change', setCurrent)
  })
  onCleanup(() => {
    ipc.system.local.off('main-tab/change', setCurrent)
  })

  return (
    <>
      <GitInstall />
      <Updater />
      <MenuButton onChange={setIsOpen} />
      <Tabs
        close={!isOpen()}
        vertical
        tab={current()}
        onChange={setCurrent}
        tabs={PAGES}
        component={([label, Comp], isSelected) => {
          return (
            <TabPanel
              class={css`
                transition: 0.2s;
                margin-left: ${isOpen() ? '0px' : '-150px'};
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
