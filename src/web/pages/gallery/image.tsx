import { useI18n } from '@solid-primitives/i18n'
import dayjs from 'dayjs'
import { css, useTheme } from 'decorock'
import { Component, createSignal, Show } from 'solid-js'

import type { ImageData } from '~/features/gallery/types'
import send_to_webui from '~/scripts/webui/send_to_webui.js?raw'
import { Modal } from '~/web/components/modal'
import { Button } from '~/web/components/ui/button'
import { IconButton } from '~/web/components/ui/icon-button'
import { HStack } from '~/web/components/ui/stack'
import { ipc } from '~/web/lib/ipc'
import { shell } from '~/web/lib/node/electron'
import IconClose from '~icons/material-symbols/close'
import IconFavorite from '~icons/material-symbols/favorite'
import IconFavoriteOutline from '~icons/material-symbols/favorite-outline'

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

export const Image: Component<
  ImageData & {
    dir: string
    zoom: number
  }
> = (props) => {
  const [t] = useI18n()
  const theme = useTheme()
  const [isOpen, setIsOpen] = createSignal(false)
  const [fav, setFav] = createSignal<boolean | null>(null)

  const toggleFav = () => {
    if (fav() ?? props.favorite) {
      ipc.galley.invoke('favorite/remove', props.dir, props.filepath)
      setFav(false)
    } else {
      ipc.galley.invoke('favorite/add', props.dir, props.filepath)
      setFav(true)
    }
  }

  return (
    <>
      <div
        class={css`
          display: grid;
          width: auto;
          height: ${Math.ceil(400 * props.zoom)}px;
          aspect-ratio: 3/5;
          background-color: ${theme.colors.primary.fade(0.95)};
          grid-template-columns: 100%;
          grid-template-rows: 1.5fr 1fr;
        `}
      >
        <img
          class={css`
            overflow: hidden;
            min-width: 100%;
            min-height: 100%;
            aspect-ratio: 1/1;
            cursor: pointer;
            object-fit: cover;
            user-select: none;
          `}
          src={props.filepath}
          onClick={() => setIsOpen(true)}
        />
        <div
          class={css`
            display: flex;
            overflow: hidden;
            flex-direction: column;
            justify-content: space-between;
            padding: 0.5rem;
            font-family: 'Roboto Mono';

            p {
              margin-bottom: 0.5rem;
              font-size: 0.8rem;
            }

            & > div {
              margin-bottom: 0.5rem;
              font-size: 0.9rem;
            }
          `}
        >
          <div>
            <p>{props.info.prompt?.slice(0, Math.ceil(50 * (props.zoom * props.zoom)))}...</p>
          </div>
          <div>
            <Show when={props.info.model} keyed>
              {(model) => <div>Model: {model}</div>}
            </Show>
            <div>{dayjs(props.created_at).format('YYYY-MM/DD HH:mm')}</div>
            <IconButton onClick={toggleFav}>
              <Show when={fav() ?? props.favorite} fallback={<IconFavoriteOutline />}>
                <IconFavorite />
              </Show>
            </IconButton>
          </div>
        </div>
      </div>
      <div
        class={css`
          position: fixed;
          z-index: 100;
        `}
      >
        <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)} closable>
          <IconButton onClick={() => setIsOpen(false)}>
            <IconClose />
          </IconButton>
          <div
            class={css`
              display: grid;
              height: 70vh;
              font-family: 'Roboto Mono';
              gap: 1rem;
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
                & > div {
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
              <Info label="File path" value={props.filepath} />
              <br />
              <div>{dayjs(props.created_at).format('YYYY-MM/DD HH:mm')}</div>
              <br />
              <HStack>
                <Button
                  onClick={() => {
                    shell.showItemInFolder(props.filepath)
                  }}
                >
                  {t('gallery/open-folder/button')}
                </Button>
                <Button
                  onClick={() => {
                    ipc.system.local.emit('main-tab/change', 'WebUI')
                    ipc.webui.local.emit('tab/change', 'UI')
                    ipc.webui.local.emit(
                      'webui/eval',
                      send_to_webui
                        .replace('__PNG_PATH__', `"${props.filepath.replace(/\\/g, '\\\\')}"`)
                        .replace('__PNG_BASENAME__', '"0.png"'),
                    )
                  }}
                >
                  {t('gallery/send-to-webui/button')}
                </Button>
                <IconButton onClick={toggleFav}>
                  <Show when={fav() ?? props.favorite} fallback={<IconFavoriteOutline />}>
                    <IconFavorite />
                  </Show>
                </IconButton>
              </HStack>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
