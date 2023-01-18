import { css } from 'decorock'
import { Component, ComponentProps, splitProps } from 'solid-js'

import { Button } from './button'

import { classnames } from '~/web/lib/classnames'

export const IconButton: Component<ComponentProps<typeof Button>> = (props) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <Button
      {...others}
      _padding
      class={classnames(
        local.class,
        css`
          padding: 0.5rem;
          border-radius: 0.5rem;
          aspect-ratio: 1/1;

          svg {
            display: block;
          }
        `,
      )}
    />
  )
}
