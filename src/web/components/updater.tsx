import { useI18n } from '@solid-primitives/i18n'
import { Component, onMount } from 'solid-js'

import { useToast } from './ui/toast'
import { ipc } from '../lib/ipc'

export const Updater: Component = () => {
  const [t] = useI18n()
  const toast = useToast()
  onMount(() => {
    ipc.system.invoke('update/check').then((available) => {
      if (!available) return
      toast({
        title: t('system/update-available/title'),
        description: t('system/update-available/description'),
        status: 'info',
        isClosable: true,
        duration: -1,
      })
    })
  })
  return <></>
}
