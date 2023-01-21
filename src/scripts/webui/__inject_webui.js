/* eslint-disable */
// @ts-nocheck

if (typeof window['__flat_registered'] === 'undefined') {
    const { ipcRenderer } = require('electron')
    window['__flat_registered'] = true
    gradioApp().addEventListener('click', (e) => {
        const el = e.target
        if (el.tagName && el.tagName === 'A') ipcRenderer.sendToHost('click_anchor', el.href)
    })
}

function ask_for_style_name(_, prompt_text, negative_prompt_text) {
    const { ipcRenderer } = require('electron')
    return new Promise((resolve, reject) => {
        ipcRenderer.sendToHost('ask_for_style_name', 'Style Name')
        ipcRenderer.once('ask_for_style_name', (e, name) => {
            resolve([name, prompt_text, negative_prompt_text])
        })
    })
}
