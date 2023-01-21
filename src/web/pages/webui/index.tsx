import { styled } from 'decorock'
import { Accessor, createContext, createSignal, onMount, Setter } from 'solid-js'

import { Config } from './config'
import { Launcher } from './launcher'
import { Settings } from './settings'
import { UI } from './ui'
import { UIConfig } from './ui-config'

import { Tabs, TabPanel } from '~/web/components/ui/tabs'
import { ipc } from '~/web/lib/ipc'

const Container = styled.div`
  display: grid;
  height: 100vh;
  margin: 0;
  grid-template-columns: 100%;
  grid-template-rows: 50px 1fr;
`

type Context = {
  url: Accessor<string>
  setUrl: Setter<string>
  onLaunch: (url: string) => void
}

export const WebUIContext = createContext({} as Context)

const TABS = {
  Launcher,
  UI,
  Settings,
  Config,
  UIConfig,
}

export const WebUI = () => {
  const [webUIUrl, setWebUIUrl] = createSignal('')
  const [current, setCurrent] = createSignal('Launcher')

  onMount(async () => {
    const port = await ipc.webui.invoke('webui/port')
    const url = `http://localhost:${port}`
    if (!url || url === webUIUrl()) return
    setWebUIUrl(url)
  })

  return (
    <WebUIContext.Provider
      value={{
        url: webUIUrl,
        setUrl: setWebUIUrl,
        onLaunch: (url) => {
          setWebUIUrl(url)
          setCurrent('UI')
        },
      }}
    >
      <Tabs
        tabs={TABS}
        tab={current()}
        onChange={([label]) => setCurrent(label)}
        component={([label, Comp], isSelected) => {
          return (
            <TabPanel show={isSelected()} unmount={label !== 'UI'}>
              <Comp />
            </TabPanel>
          )
        }}
      />
    </WebUIContext.Provider>
  )
}
