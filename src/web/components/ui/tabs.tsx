import { css, useTheme } from 'decorock'
import {
  Accessor,
  Component,
  ComponentProps,
  createContext,
  createSignal,
  For,
  JSX,
  Setter,
  Show,
  splitProps,
} from 'solid-js'

import { classnames } from '~/web/lib/classnames'

const TabContext = createContext(
  {} as {
    current: Accessor<number>
    setCurrent: Setter<number>
  },
)

export const TabPanel: Component<{ show: boolean; unmount?: boolean } & ComponentProps<'div'>> = (
  props,
) => {
  const [local, others] = splitProps(props, ['show', 'unmount', 'class', 'children'])
  const sharedStyle = css`
    height: 100%;
  `
  return (
    <Show
      when={typeof local.unmount === 'undefined' || local.unmount === true}
      fallback={() => (
        <div
          class={classnames(
            sharedStyle,
            css`
              position: ${local.show ? 'static' : 'fixed'};
              opacity: ${local.show ? '1' : '0'};
              pointer-events: ${local.show ? 'auto' : 'none'};
              transition: 0;
            `,
            local.class,
          )}
          {...others}
        >
          {local.children}
        </div>
      )}
    >
      <Show when={local.show}>
        <div class={classnames(sharedStyle, local.class)} {...others}>
          {local.children}
        </div>
      </Show>
    </Show>
  )
}

export const TabList: Component<{
  tabs: Record<string, Component>
  vertical?: boolean
  tab?: ([label, Comp]: [string, Component], isSelected: Accessor<boolean>) => JSX.Element
}> = (props) => {
  const theme = useTheme()
  const [current, setCurrent] = createSignal(0)
  const selected = (i: number) => i === current()
  return (
    <TabContext.Provider value={{ current, setCurrent }}>
      <div
        class={css`
          display: grid;
          height: 100%;
          grid-template-columns: ${props.vertical ? '20% 80%' : '100%'};
          grid-template-rows: ${props.vertical ? '100%' : '50px 1fr'};
        `}
      >
        <div
          class={css`
            display: flex;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            ${props.vertical ? 'height: 100%' : 'width: 100%'};
            flex-direction: ${props.vertical ? 'column' : 'row'};
            justify-content: flex-start;
            align-items: flex-end;
          `}
        >
          <For each={Object.keys(props.tabs)}>
            {(label, i) => (
              <div
                class={css`
                  position: relative;
                  display: inline-flex;
                  padding: 0.5rem 1rem;
                  color: ${theme.colors.primary.fade(selected(i()) ? 0 : 0.3)};
                  cursor: pointer;
                  font-weight: bold;
                  transition: 0.2s;
                  user-select: none;
                  align-items: center;
                  justify-content: ${props.vertical ? 'flex-end' : 'center'};
                  text-align: right;
                  ${props.vertical ? 'width: 100%' : 'height: 100%'};

                  &::after {
                    position: absolute;
                    bottom: ${props.vertical ? '50' : '0'}%;
                    right: ${props.vertical ? '0' : '50'}%;
                    ${`${props.vertical ? 'height' : 'width'}:${selected(i()) ? '30%' : '0'}`};
                    ${props.vertical ? 'width' : 'height'}: 2px;
                    background: ${theme.colors.primary};
                    content: '';
                    transform: ${props.vertical ? 'translateY(50%)' : 'translateX(50%)'};
                    transition: 0.2s;
                  }

                  &:hover {
                    color: ${theme.colors.primary};
                  }
                `}
                onClick={() => setCurrent(i())}
              >
                {label}
              </div>
            )}
          </For>
        </div>
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
      </div>
    </TabContext.Provider>
  )
}
