import { css, styled } from 'decorock'
import {
  Accessor,
  Component,
  ComponentProps,
  createContext,
  createMemo,
  createSignal,
  For,
  JSX,
  Setter,
  Show,
  splitProps,
} from 'solid-js'

import { classnames } from '~/web/lib/classnames'

export const TabGroup = styled.div<{ vertical?: boolean | undefined }>`
  display: grid;
  height: 100%;
  grid-template-columns: ${(p) => (p.vertical ? '150px 1fr' : '100%')};
  grid-template-rows: ${(p) => (p.vertical ? '100%' : '50px 1fr')};
`

export const TabList = styled.div<{
  vertical?: boolean | undefined
  tabClose?: boolean | undefined
}>`
  display: flex;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  justify-content: flex-start;
  align-items: flex-end;
  transform: ${(p) =>
    `${p.vertical ? 'translateX' : 'translateY'}(${
      p.tabClose ? (p.vertical ? '-150px' : '-50px') : '0'
    })`};
  transition: 0.2s;

  ${(p) => (p.vertical ? 'height: 100%' : 'width: 100%')};
  flex-direction: ${(p) => (p.vertical ? 'column' : 'row')};
`

export const Tab = styled.div<{ selected: boolean; vertical?: boolean | undefined }>`
  position: relative;
  display: inline-flex;
  padding: 0.5rem 1rem;
  color: ${(p) => p.theme.colors.primary.fade(p.selected ? 0 : 0.3)};
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
  user-select: none;
  align-items: center;
  text-align: right;

  justify-content: ${(p) => (p.vertical ? 'flex-end' : 'center')};
  ${(p) => (p.vertical ? 'width: 100%' : 'height: 100%')};

  &::after {
    position: absolute;
    background: ${(p) => p.theme.colors.primary};
    bottom: ${(p) => (p.vertical ? '50' : '0')}%;
    right: ${(p) => (p.vertical ? '0' : '50')}%;
    ${(p) => `${p.vertical ? 'height' : 'width'}:${p.selected ? '30%' : '0'}`};
    ${(p) => (p.vertical ? 'width' : 'height')}: 2px;
    transform: ${(p) => (p.vertical ? 'translateY(50%)' : 'translateX(50%)')};
    content: '';
    transition: 0.2s;
  }

  &:hover {
    color: ${(p) => p.theme.colors.primary};
  }
`

const TabContext = createContext(
  {} as {
    current: Accessor<number>
    setCurrent: Setter<number>
  },
)

export const TabPanel: Component<
  {
    show: boolean
    unmount?: boolean
    tabClose?: boolean | undefined
    vertical?: boolean | undefined
  } & ComponentProps<'div'>
> = (props) => {
  const [local, others] = splitProps(props, ['show', 'unmount', 'class', 'children'])

  const unmount = createMemo(() => typeof local.unmount !== 'boolean' || local.unmount === true)

  return (
    <Show when={local.show || !unmount()}>
      <div
        class={classnames(
          local.class,
          css`
            height: 100%;
          `,
          !unmount()
            ? css`
                ${local.show ? '' : 'width: 0; height: 0;'};
                position: ${local.show ? 'static' : 'fixed'};
                opacity: ${local.show ? '1' : '0'};
                pointer-events: ${local.show ? 'auto' : 'none'};
                transition: none;
              `
            : '',
        )}
        {...others}
      >
        {local.children}
      </div>
    </Show>
  )
}

export const Tabs: Component<{
  tabs: Record<string, Component>
  tabClose?: boolean
  vertical?: boolean
  tab?: ([label, Comp]: [string, Component], isSelected: Accessor<boolean>) => JSX.Element
}> = (props) => {
  const [current, setCurrent] = createSignal(0)
  const selected = (i: number) => i === current()
  return (
    <TabContext.Provider value={{ current, setCurrent }}>
      <TabGroup vertical={props.vertical}>
        <TabList vertical={props.vertical} tabClose={props.tabClose}>
          <For each={Object.keys(props.tabs)}>
            {(label, i) => (
              <Tab
                vertical={props.vertical}
                selected={selected(i())}
                onClick={() => setCurrent(i())}
              >
                {label}
              </Tab>
            )}
          </For>
        </TabList>
        <For each={Object.entries(props.tabs)}>
          {([label, Comp], i) =>
            props.tab ? (
              props.tab([label, Comp], () => i() === current())
            ) : (
              <TabPanel show={i() === current()}>
                <Comp />
              </TabPanel>
            )
          }
        </For>
      </TabGroup>
    </TabContext.Provider>
  )
}
