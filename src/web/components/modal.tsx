import { css, useTheme } from 'decorock'
import { Dialog, DialogPanel, Transition, TransitionChild } from 'solid-headless'
import type { Component, JSX } from 'solid-js'

export const Modal: Component<{
  children: JSX.Element
  isOpen: boolean
  onClose: () => void
}> = (props) => {
  const theme = useTheme()
  return (
    <Transition appear show={props.isOpen}>
      <Dialog
        class={css`
          position: fixed;
          z-index: 100;
          top: 0;
          left: 0;
          width: 100%;
          pointer-events: ${props.isOpen ? 'all' : 'none'};
        `}
        isOpen
        onClose={props.onClose}
      >
        <TransitionChild
          class={css`
            width: 100%;
            background-color: rgba(0, 0, 0, 0.25);
          `}
          enter={css`
            transition-duration: 0.2s;
            transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
          `}
          enterFrom={css`
            opacity: 0;
          `}
          enterTo={css`
            opacity: 1;
          `}
          leave={css`
            transition-duration: 0.2s;
            transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
          `}
          leaveFrom={css`
            opacity: 1;
          `}
          leaveTo={css`
            opacity: 0;
          `}
        >
          <TransitionChild
            class={css`
              display: flex;
              width: 100%;
              min-height: 100vh;
              align-items: center;
              justify-content: center;
              padding: 0 1rem;
            `}
            enter={css`
              transition-duration: 0.2s;
              transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
            `}
            enterFrom={css`
              transform: scale(0.95, 0.95);
            `}
            enterTo={css`
              transform: scale(1, 1);
            `}
            leave={css`
              transition-duration: 0.2s;
              transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
            `}
            leaveFrom={css`
              transform: scale(1, 1);
            `}
            leaveTo={css`
              transform: scale(0.95, 0.95);
            `}
          >
            <DialogPanel
              class={css`
                overflow: hidden;
                width: 80%;
                max-height: 50%;
                padding: 1.5rem;
                border-radius: 1rem;
                margin: 2rem 0;
                background-color: ${theme.colors.secondary};
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                transition-property: all;
              `}
            >
              {props.children}
            </DialogPanel>
          </TransitionChild>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}
