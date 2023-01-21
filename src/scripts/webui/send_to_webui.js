/* eslint-disable */
// @ts-nocheck

async function run() {
    /**
     * @type {string}
     */
    const path = __PNG_PATH__
    const basename = __PNG_BASENAME__

    /**
     * @type {Document}
     */
    const gradio = gradioApp()

    const res = await fetch(path)
    const file = new File([await res.blob()], basename)

    const png_info_input = gradio.getElementById('pnginfo_image').querySelector('input')
    const send_button = gradio.getElementById('txt2img_tab')
    const parameters = gradio.getElementById('tab_pnginfo').querySelectorAll('.output-html')[1]
    const dt = new DataTransfer()
    dt.items.add(file)

    png_info_input.files = dt.files
    png_info_input.dispatchEvent(new Event('change'))

    const png_info_tab = Array.from(
        gradio.getElementById('tabs').querySelectorAll(':scope > div:first-child button'),
    ).find((v) => v.innerText === 'PNG Info')
    png_info_tab.click()
}
run()
delete run
