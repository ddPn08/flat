import dayjs from 'dayjs'
import { css, useTheme } from 'decorock'
import { Component, createSignal, For, onMount, Show } from 'solid-js'

import type { ImageData } from '~/features/gallery/types'
import { Modal } from '~/web/components/modal'
import { IconButton } from '~/web/components/ui/icon-button'
import { RectSpinner } from '~/web/components/ui/spinner'
import { ipc } from '~/web/lib/ipc'
import IconClose from '~icons/material-symbols/close'

const Info: Component<{ label: string; value?: string | number | undefined }> = (props) => (
  <Show when={props.value} keyed>
    {(v) => (
      <>
        <div>
          <span>{props.label}</span>: {v}
        </div>
      </>
    )}
  </Show>
)

const Image: Component<ImageData> = (props) => {
  const theme = useTheme()
  const [isOpen, setIsOpen] = createSignal(false)
  return (
    <>
      <div
        class={css`
          width: 300px;
          height: 400px;
          background-color: ${theme.colors.primary.fade(0.95)};
          cursor: pointer;
          user-select: none;
        `}
        onClick={() => setIsOpen(true)}
      >
        <img
          class={css`
            overflow: hidden;
            width: 100%;
            height: auto;
            aspect-ratio: 1/1;
            object-fit: cover;
          `}
          src={props.filepath}
          alt=""
        />
        <div
          class={css`
            padding: 0.25rem;
            font-family: 'Roboto Mono';

            p {
              margin-bottom: 0.5rem;
              font-size: 0.8rem;
            }

            div {
              margin-bottom: 0.5rem;
              font-size: 0.9rem;
            }
          `}
        >
          <p>{props.info.prompt?.slice(0, 100)}...</p>
          <Show when={props.info.model} keyed>
            {(model) => <div>Model: {model}</div>}
          </Show>
        </div>
      </div>
      <div
        class={css`
          position: fixed;
          z-index: 100;
        `}
      >
        <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
          <IconButton onClick={() => setIsOpen(false)}>
            <IconClose />
          </IconButton>
          <div
            class={css`
              display: grid;
              height: 70vh;
              font-family: 'Roboto Mono';
              grid-template-columns: 1fr 1fr;
              grid-template-rows: 100%;

              img {
                display: inline-block;
                width: 100%;
                height: 100%;
                object-fit: contain;
              }
            `}
          >
            <div>
              <img src={props.filepath} alt="" />
            </div>
            <div
              class={css`
                div {
                  margin-bottom: 1rem;
                  font-size: 1rem;
                }

                span {
                  font-weight: bold;
                }

                height: 100%;
                overflow-y: auto;
              `}
            >
              <Info label="Prompt" value={props.info.prompt} />
              <Info label="Negative Prompt" value={props.info.negative_prompt} />
              <Info label="Model" value={props.info.model} />
              <Info label="Model Hash" value={props.info.model_hash} />
              <Info label="Steps" value={props.info.steps} />
              <Info label="Sampler" value={props.info.sampler} />
              <Info label="CFG Scale" value={props.info.cfg_scale} />
              <Info label="Seed" value={props.info.seed} />
              <Info label="Clip Skip" value={props.info.clip_skip} />
              <br />
              <div>{dayjs(props.created_at).format('YYYY-DD-MM')}</div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

export const Images = () => {
  const [images, setImages] = createSignal<ImageData[]>([])
  const [fetching, setFetching] = createSignal(false)
  const [complete, setComplete] = createSignal(false)

  onMount(() => {
    ipc.galley.invoke('images/get', { limit: 50 }).then((v) => {
      setImages(v)
      if (v.length < 50) setComplete(true)
    })
  })

  const fetch = () => {
    if (fetching() || complete()) return
    setFetching(true)
    ipc.galley.invoke('images/get', { since: images().length, limit: 50 }).then((v) => {
      if (v.length < 50) setComplete(true)
      setTimeout(() => {
        setFetching(false)
        setImages((prev) => [...prev, ...v])
      }, 500)
    })
  }

  return (
    <div
      class={css`
        display: flex;
        height: calc(100vh - 50px);
        flex-wrap: wrap;
        align-items: center;
        padding: 1rem;
        gap: 0.5rem;
        overflow-y: auto;
      `}
      onScroll={(e) => {
        if (
          e.currentTarget.scrollHeight > 1000 &&
          e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight
        ) {
          fetch()
        }
      }}
    >
      <For each={images()}>{(image) => <Image {...image} />}</For>
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
  )
}
