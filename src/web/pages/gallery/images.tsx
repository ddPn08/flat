import { useI18n } from '@solid-primitives/i18n'
import { css, styled } from 'decorock'
import { createSignal, For, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'

import { Image } from './image'

import type { ImageData, ImageSearchOptions } from '~/features/gallery/types'
import { IconButton } from '~/web/components/ui/icon-button'
import { Input } from '~/web/components/ui/input'
import { RectSpinner } from '~/web/components/ui/spinner'
import { HStack } from '~/web/components/ui/stack'
import { ipc } from '~/web/lib/ipc'
import { serialize } from '~/web/lib/store-serialize'
import IconSearch from '~icons/material-symbols/search'

const RangeInput = styled.input`
  width: 20%;
  height: 5px;
  border-radius: 6px;
  appearance: none;
  background-color: #fff;

  &:focus,
  &:active {
    outline: none;
  }

  &::-webkit-slider-thumb {
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    border: 2px solid rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    appearance: none;
    background-color: #fff;
    cursor: pointer;
  }
`

export const Images = () => {
  const [t] = useI18n()
  const [options, setOptions] = createStore<ImageSearchOptions>({
    limit: 50,
    latest: true,
    info: {},
  })
  const [images, setImages] = createSignal<ImageData[]>([])
  const [zoom, setZoom] = createSignal(1)
  const [fetching, setFetching] = createSignal(false)
  const [complete, setComplete] = createSignal(false)

  const fetch = async () => {
    if (fetching() || complete()) return
    setFetching(true)
    const v = await ipc.galley.invoke(
      'images/get',
      serialize({ since: images().length, ...options }),
    )
    if (v.length < 50) setComplete(true)
    setTimeout(() => {
      setFetching(false)
      setImages((prev) => [...prev, ...v])
    }, 500)
  }

  onMount(fetch)

  return (
    <div
      class={css`
        display: grid;
        height: calc(100vh - 50px);
        grid-template-columns: 100%;
        grid-template-rows: 75px 1fr;
      `}
    >
      <div
        class={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          gap: 0.5rem;
        `}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setComplete(false)
            setImages([])
            fetch()
          }
        }}
      >
        <HStack>
          <Input
            placeholder={t('galley/search/prompt')}
            value={options['info']?.['prompt'] || ''}
            onInput={(e) => setOptions('info', 'prompt', e.currentTarget.value)}
          />
          <Input
            placeholder={t('galley/search/model')}
            value={options['info']?.['model'] || ''}
            onInput={(e) => setOptions('info', 'model', e.currentTarget.value)}
          />
          <IconButton
            onClick={() => {
              setComplete(false)
              setImages([])
              fetch()
            }}
          >
            <IconSearch />
          </IconButton>
        </HStack>
        <RangeInput
          type="range"
          max={2}
          min={0.75}
          step={0.05}
          value={zoom()}
          onInput={(e) => {
            setZoom(parseFloat(e.currentTarget.value))
          }}
        />
      </div>
      <div
        class={css`
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          padding: 1rem;
          gap: 0.5rem;
          overflow-y: auto;
        `}
        onScroll={(e) => {
          if (
            e.currentTarget.scrollHeight > 1000 &&
            e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
              e.currentTarget.clientHeight
          ) {
            fetch()
          }
        }}
      >
        <For each={images()}>{(image) => <Image zoom={zoom()} {...image} />}</For>
        <Show when={fetching()}>
          <div
            class={css`
              width: 100%;
            `}
          >
            <RectSpinner />
          </div>
        </Show>
      </div>
    </div>
  )
}
