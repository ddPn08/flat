import { css, styled } from 'decorock'
import { Component, createSignal, JSX, onCleanup, onMount } from 'solid-js'

const Background = styled.div`
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.5);
`

const Container = styled.div`
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
`
const Panel = styled.div`
  overflow: hidden;
  width: 80%;
  max-height: 50%;
  padding: 1.5rem;
  border-radius: 1rem;
  margin: 2rem 0;
  background-color: ${(p) => p.theme.colors.secondary};
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  transition-property: all;
`

export const Modal: Component<{
  children: JSX.Element
  isOpen: boolean
  onClose: () => void
  transition?: string
  closable?: boolean
}> = (props) => {
  const [ref, setRef] = createSignal<HTMLDivElement>()

  const listener = (e: MouseEvent) => {
    const el = ref()!
    const isThis = el === e.target || el.contains(e.target as Node)
    if (props.closable && props.isOpen && isThis) props.onClose()
  }
  onMount(() => {
    window.addEventListener('click', listener)
  })
  onCleanup(() => {
    window.removeEventListener('click', listener)
  })

  return (
    <>
      <Background
        class={css`
          opacity: ${props.isOpen ? '1' : '0'};
          pointer-events: ${props.isOpen ? 'auto' : 'none'};
          transition: ${props.transition || '0.2s'};
        `}
      />
      <Container
        ref={setRef}
        class={css`
          opacity: ${props.isOpen ? '1' : '0'};
          pointer-events: ${props.isOpen ? 'auto' : 'none'};
          transform: scale(${props.isOpen ? 1 : 0.9});
          transition: ${props.transition || '0.2s'};
        `}
      >
        <Panel>
          <div>{props.children}</div>
        </Panel>
      </Container>
    </>
  )
}
