import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { isServer } from 'solid-js/web'

export const useFloating = (ref: () => HTMLElement) => {
  const [open, setOpen] = createSignal(false)
  const [cool, setCool] = createSignal(false)

  createEffect(() => {
    if (open()) {
      setCool(true)
      setTimeout(() => setCool(false), 50)
    }
  })

  const listener = (e: MouseEvent) => {
    if (cool()) return
    const isThis = ref() === e.target || ref().contains(e.target as Node)
    if (open() && !isThis) setOpen(false)
  }
  onMount(() => {
    if (!isServer) window.addEventListener('click', listener)
  })
  onCleanup(() => {
    if (!isServer) window.removeEventListener('click', listener)
  })

  return [open, setOpen] as const
}
