import { createI18nContext, I18nContext } from '@solid-primitives/i18n'
import { css, styled, useTheme } from 'decorock'
import { Tab, TabGroup, TabList, TabPanel } from 'solid-headless'
import { createMemo, createSignal, For } from 'solid-js'

import { GitInstall } from './components/dependencies/git-install'
import { MenuButton } from './components/menu-button'
import { ToastProvider } from './components/ui/toast'
import { Updater } from './components/updater'
import { classnames } from './lib/classnames'
import { config } from './lib/config'
import { GALLERY } from './pages/galley'
import { SETTINGS } from './pages/settings'
import { WEBUI } from './pages/webui'
import { ThemeProvider } from './styles'

import { dict } from '~i18n/index'

const Container = styled.div`
  display: block;
  width: 100%;
`

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
  GALLERY,
  WEBUI,
  SETTINGS,
}

const Index = () => {
  const theme = useTheme()
  const [current, setCurrent] = createSignal('WEBUI')
  const [open, setOpen] = createSignal(true)
  return (
    <>
      <GitInstall />
      <Updater />
      <MenuButton onChange={setOpen} />
      <TabGroup
        class={css`
          display: flex;
          width: 100%;
          height: 100vh;
        `}
        value={current()}
        onChange={setCurrent}
        horizontal
      >
        {({ isSelected }) => (
          <>
            <TabList
              class={css`
                position: fixed;
                z-index: 5;
                display: inline-flex;
                width: 200px;
                height: 100%;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                background-color: ${theme.colors.secondary};
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                transform: translate(${open() ? '0' : '-200px'}, 0);
                transition: 0.2s;
                user-select: none;
              `}
            >
              <For each={Object.keys(PAGES)}>
                {(page) => (
                  <Tab
                    class={classnames(
                      css`
                        position: relative;
                        width: 100%;
                        padding: 0.5rem 1rem;
                        color: ${theme.colors.primary.fade(0.25)};
                        cursor: pointer;
                        font-size: 1.25rem;
                        font-weight: bold;
                        text-align: right;
                        transition: 0.2s;

                        &:active {
                          color: ${theme.colors.primary.darken(0.5)};
                        }

                        &::after {
                          position: absolute;
                          right: 0;
                          bottom: 50%;
                          width: 2px;
                          height: ${isSelected(page) ? '100%' : '0'};
                          background: ${theme.colors.primary};
                          content: '';
                          transform: translateY(50%);
                          transition: 0.2s;
                        }

                        &:hover {
                          &::after {
                            height: ${isSelected(page) ? '100%' : '25%'};
                          }
                        }
                      `,
                    )}
                    value={page}
                  >
                    {page}
                  </Tab>
                )}
              </For>
            </TabList>
            <Container>
              <For each={Object.keys(PAGES)}>
                {(page) => {
                  const Comp = PAGES[page as keyof typeof PAGES]
                  const isSelected = createMemo(() => current() === page)
                  return (
                    <TabPanel
                      class={css`
                        position: ${isSelected() ? 'static' : 'fixed'};
                        height: 100%;
                        margin-left: ${open() ? '200px' : '0'};
                        opacity: ${isSelected() ? '1' : '0'};
                        pointer-events: ${isSelected() ? 'auto' : 'none'};
                      `}
                      value={page}
                      unmount={false}
                    >
                      <Comp />
                    </TabPanel>
                  )
                }}
              </For>
            </Container>
          </>
        )}
      </TabGroup>
    </>
  )
}
