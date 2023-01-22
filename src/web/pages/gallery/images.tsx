import { useI18n } from '@solid-primitives/i18n'
import { css, styled } from 'decorock'
import { createEffect, createSignal, For, on, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'

import { Image } from './image'

import type { ImageData, ImageSearchOptions } from '~/features/gallery/types'
import { IconButton } from '~/web/components/ui/icon-button'
import { Input } from '~/web/components/ui/input'
import { Select } from '~/web/components/ui/select'
import { RectSpinner } from '~/web/components/ui/spinner'
import { HStack } from '~/web/components/ui/stack'
import { Tab, TabGroup, TabList } from '~/web/components/ui/tabs'
import { config } from '~/web/lib/config'
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
  const [dir, setDir] = createSignal(
    config['gallery/dirs'].length > 0 ? config['gallery/dirs'][0]! : '',
  )
  const [options, setOptions] = createStore<ImageSearchOptions>({
    limit: 50,
    latest: true,
    info: {},
  })
  const [images, setImages] = createSignal<ImageData[]>([])
  const [zoom, setZoom] = createSignal(1)
  const [fetching, setFetching] = createSignal(false)
  const [complete, setComplete] = createSignal(false)
  const [tab, setTab] = createSignal<'all' | 'favorites'>('all')

  const fetch = async (force?: boolean | undefined) => {
    if (!force && (fetching() || complete())) return
    setFetching(true)
    const v = await ipc.gallery.invoke(
      'images/get',
      dir(),
      serialize({ since: images().length, ...options }),
    )
    if (v.length < 50) setComplete(true)
    setFetching(false)
    setImages((prev) => [...prev, ...v])
  }

  const refetch = async () => {
    setImages([])
    setComplete(false)
    setFetching(true)
    await ipc.gallery.invoke('images/glob', dir())
    fetch(true)
  }

  createEffect(
    on(tab, (tab) => {
      if (tab === 'all') setOptions('favorite', undefined)
      else if (tab === 'favorites') setOptions('favorite', true)
      refetch()
    }),
  )

  onMount(refetch)

  return (
    <>
      <TabGroup>
        <TabList>
          <Tab selected={tab() === 'all'} onClick={() => setTab('all')}>
            {t('gallery/tabs/all')}
          </Tab>
          <Tab selected={tab() === 'favorites'} onClick={() => setTab('favorites')}>
            {t('gallery/tabs/favorites')}
          </Tab>
        </TabList>
        <div
          class={css`
            display: grid;
            height: calc(100vh - 100px);
            grid-template-columns: 100%;
            grid-template-rows: 120px 1fr;
          `}
        >
          <div
            class={css`
              padding: 1rem;
              user-select: none;
            `}
            onKeyDown={(e) => {
              if (e.key === 'Enter') refetch()
            }}
          >
            <HStack
              class={css`
                align-items: center;
                justify-content: space-between;
              `}
            >
              <HStack
                class={css`
                  align-items: center;
                  justify-content: center;
                `}
              >
                <Input
                  placeholder={t('gallery/search/prompt')}
                  value={options['info']?.['prompt'] || ''}
                  onInput={(e) => setOptions('info', 'prompt', e.currentTarget.value)}
                />
                <Input
                  placeholder={t('gallery/search/model')}
                  value={options['info']?.['model'] || ''}
                  onInput={(e) => setOptions('info', 'model', e.currentTarget.value)}
                />
                <IconButton onClick={() => refetch()}>
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
            </HStack>
            <Select
              options={config['gallery/dirs'].map((v) => ({ label: v, value: v }))}
              value={dir()}
              onChange={(v) => {
                setDir(v.value)
                refetch()
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
            <For each={images()}>{(image) => <Image dir={dir()} zoom={zoom()} {...image} />}</For>
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
      </TabGroup>
    </>
  )
}
