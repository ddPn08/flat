import { css, useTheme } from 'decorock'
import { Component, createEffect, createSignal, on } from 'solid-js'

import IconMenu from '~icons/material-symbols/menu'

export const MenuButton: Component<{ onChange: (open: boolean) => void }> = (props) => {
  const theme = useTheme()
  const [hover, setHover] = createSignal(false)
  const [isOpen, setIsOpen] = createSignal(true)

  createEffect(on(isOpen, (open) => props.onChange(open)))

  return (
    <div
      class={css`
        position: fixed;
        z-index: 10;
        bottom: -75px;
        left: -75px;
        width: 150px;
        height: 150px;
      `}
      onMouseOver={setHover.bind({}, true)}
      onMouseOut={setHover.bind({}, false)}
    >
      <div
        class={css`
          position: relative;
          width: 100%;
          height: 100%;
        `}
      >
        <div
          class={css`
            position: absolute;
            top: ${hover() || isOpen() ? '0' : '30%'};
            right: ${hover() || isOpen() ? '0' : '30%'};
            display: inline-block;
            padding: 1rem;
            border-radius: 50%;
            aspect-ratio: 1/1;
            background-color: ${theme.colors.primary.fade(0.15)};
            color: ${theme.colors.secondary};
            cursor: pointer;
            font-size: 1.25rem;
            transition: 0.2s;

            svg {
              display: block;
            }

            &:hover {
              background-color: ${theme.colors.primary.fade(0.1)};
            }

            &:active {
              background-color: ${theme.colors.primary};
            }
          `}
          onClick={() => setIsOpen(!isOpen())}
        >
          <IconMenu />
        </div>
      </div>
    </div>
  )
}
