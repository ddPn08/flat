import Color from 'color'
import { css, styled } from 'decorock'
import { on, Component, createEffect, createSignal, For, Show } from 'solid-js'

import { classnames } from '~/web/lib/classnames'

const Container = styled.div`
  overflow: auto;
  padding: 0.5rem 1rem;
  background-color: ${(p) => p.theme.colors.primary.fade(0.85)};

  p {
    font-family: 'Roboto Mono', 'Noto Sans JP', monospace;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  a {
    color: ${(p) =>
      p.theme.name === 'light'
        ? Color('rgb(0, 255, 255)').darken(0.25)
        : Color('rgb(0, 255, 255)')};
    text-underline-offset: 2px;
    &:hover {
      text-decoration: underline;
    }
  }
`

export const Log: Component<{
  children: string[]
  class?: string | undefined
  height?: number | string
  autoScroll?: boolean
}> = (props) => {
  const [ref, setRef] = createSignal<HTMLDivElement>()
  const [onBottom, setOnBottom] = createSignal(true)

  createEffect(
    on(
      () => props.children,
      () => {
        const el = ref()!
        if (typeof props.autoScroll !== 'undefined' && !props.autoScroll) return
        if (onBottom()) el.scrollTop = el.scrollHeight
      },
    ),
  )

  return (
    <Container
      ref={setRef}
      class={classnames(
        props.class,
        css`
          max-height: ${typeof props.height === 'number'
            ? props.height + 'px'
            : typeof props.height === 'string'
            ? props.height
            : '70vh'};
          overflow-y: auto;
        `,
      )}
      onScroll={(e) => {
        setOnBottom(
          e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight,
        )
      }}
    >
      <For each={props.children}>
        {(log) => {
          const logs = log.split(/(http:\/\/[^\s]+)/g)
          return (
            <p>
              <For each={logs}>
                {(t) => (
                  <Show when={t.match(/(http:\/\/[^\s]+)/)} fallback={t}>
                    <a href={t}>{t}</a>
                  </Show>
                )}
              </For>
            </p>
          )
        }}
      </For>
    </Container>
  )
}
