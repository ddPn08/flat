import { css, styled } from 'decorock'
import { Component, createEffect, createSignal, For } from 'solid-js'

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
`

export const Log: Component<{
  children: string[]
  class?: string | undefined
  height?: number | string
  autoScroll?: boolean
}> = (props) => {
  const [ref, setRef] = createSignal<HTMLDivElement>()
  createEffect(() => {
    if (typeof props.autoScroll !== 'undefined' && !props.autoScroll) return
    props.children
    setTimeout(() => {
      const el = ref()!
      el.scrollTop = el.scrollHeight
    })
  })

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
    >
      <For each={props.children}>{(log) => <p>{log}</p>}</For>
    </Container>
  )
}
