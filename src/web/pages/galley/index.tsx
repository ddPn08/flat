import { css, styled } from 'decorock'
import { createSignal, For, Show } from 'solid-js'

import { Config } from './config'
import { Images } from './images'

const Container = styled.div`
  display: grid;
  overflow: hidden;
  height: 100vh;
  margin: 0;
  grid-template-columns: 100%;
  grid-template-rows: 50px 1fr;
`

const Tabs = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
`

const Tab = styled.div<{ selected: boolean }>`
  position: relative;
  padding: 0.5rem 1rem;
  color: ${(p) => p.theme.colors.primary.fade(p.selected ? 0 : 0.3)};
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;

  &::after {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: ${(p) => (p.selected ? '30%' : '0')};
    height: 2px;
    background: ${(p) => p.theme.colors.primary};
    content: '';
    transform: translateX(-50%);
    transition: 0.2s;
  }

  &:hover {
    color: ${(p) => p.theme.colors.primary};
  }
`

const TABS = {
  Images,
  Config,
}

export const Galley = () => {
  const [current, setCurrent] = createSignal('Images')

  return (
    <>
      <Container>
        <Tabs>
          <For each={Object.keys(TABS)}>
            {(tab) => (
              <Tab
                class={css`
                  display: inline-flex;
                  height: 100%;
                  align-items: center;
                  justify-content: center;
                  user-select: none;
                `}
                selected={current() === tab}
                onClick={() => setCurrent(tab)}
              >
                {tab}
              </Tab>
            )}
          </For>
        </Tabs>
        <For each={Object.keys(TABS)}>
          {(tab) => {
            const Comp = TABS[tab as keyof typeof TABS]
            return (
              <Show when={tab === current()}>
                <div
                  class={css`
                    height: 100%;
                  `}
                >
                  <Comp />
                </div>
              </Show>
            )
          }}
        </For>
      </Container>
    </>
  )
}
