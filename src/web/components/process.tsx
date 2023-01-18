import { styled } from 'decorock'
import type { Component } from 'solid-js'

const Container = styled.div``

export const Process: Component<{
  progress: number
  message: string
}> = (props) => {
  return (
    <Container>
      <h1>{props.message}</h1>
      <progress max="1" value={props.progress} />
    </Container>
  )
}
