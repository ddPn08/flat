import { createI18nContext, I18nContext } from '@solid-primitives/i18n'
import { styled, useTheme } from 'decorock'
import { createSignal } from 'solid-js'

import { GitInstall } from './components/dependencies/git-install'
import { MenuButton } from './components/menu-button'
import { TabList, TabPanel } from './components/ui/tabs'
import { ToastProvider } from './components/ui/toast'
import { Updater } from './components/updater'
import { config } from './lib/config'
import { Gallery } from './pages/gallery'
import { General } from './pages/general'
import { WebUI } from './pages/webui'
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
  General,
  Gallery,
  WebUI,
}

const Index = () => {
  const theme = useTheme()
  const [current, setCurrent] = createSignal('General')
  const [isOpen, setIsOpen] = createSignal(true)
  return (
    <>
      <GitInstall />
      <Updater />
      <MenuButton onChange={setIsOpen} />
      <TabList
        vertical
        tabs={PAGES}
        tab={([label, Comp], isSelected) => (
          <TabPanel show={isSelected()} unmount={label !== 'WebUI'}>
            <Comp />
          </TabPanel>
        )}
      />
      {/* <TabGroup
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
                transform: translate(${isOpen() ? '0' : '-200px'}, 0);
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
                        margin-left: ${isOpen() ? '200px' : '0'};
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
      </TabGroup> */}
    </>
  )
}
