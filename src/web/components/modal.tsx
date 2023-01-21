import { css, styled } from 'decorock'
import { Component, createEffect, createSignal, JSX, on } from 'solid-js'

import { useFloating } from '../hooks/use-floating'

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
  z-index: 100;
`
export const ModalPanel = styled.div`
  overflow: hidden;
  width: 80%;
  max-height: 100%;
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
  // eslint-disable-next-line solid/reactivity
  const [isOpen, setIsOpen] = useFloating(ref as any, !props.closable)

  createEffect(
    on(
      () => props.isOpen,
      (isOpen) => {
        setIsOpen(isOpen)
      },
    ),
  )
  createEffect(
    on(isOpen, (isOpen) => {
      if (!isOpen) props.onClose()
    }),
  )

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
        class={css`
          opacity: ${props.isOpen ? '1' : '0'};
          pointer-events: ${props.isOpen ? 'auto' : 'none'};
          transform: scale(${props.isOpen ? 1 : 0.9});
          transition: ${props.transition || '0.2s'};
        `}
      >
        <ModalPanel ref={setRef}>{props.children}</ModalPanel>
      </Container>
    </>
  )
}
