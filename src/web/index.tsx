/* @refresh reload */
import { render } from 'solid-js/web'

import { App } from './app'
import { shell } from './lib/electron'

window.addEventListener('click', (e) => {
  const el = e.target as HTMLAnchorElement
  if (el.tagName && el.tagName === 'A') {
    e.preventDefault()
    shell.openExternal(el.href)
  }
})

render(() => <App />, document.getElementById('root') as HTMLElement)
