import { styled } from 'decorock'

import { Config } from './config'
import { Images } from './images'

import { Tabs } from '~/web/components/ui/tabs'

const Container = styled.div`
  display: grid;
  overflow: hidden;
  height: 100vh;
  margin: 0;
  grid-template-columns: 100%;
  grid-template-rows: 50px 1fr;
`

const TABS = {
  Images,
  Config,
}

export const Gallery = () => {
  return (
    <>
      <Container>
        <Tabs tabs={TABS} />
      </Container>
    </>
  )
}
