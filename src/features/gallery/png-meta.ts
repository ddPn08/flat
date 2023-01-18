const PNG_MAGIC_BYTES = '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a'
const LENGTH_SIZE = 4
const TYPE_SIZE = 4
const CRC_SIZE = 4

type Segment = {
    name: string
    type: string
    offset: number
    length: number
    start: number
    size: number
    marker: number
}

export const loadMeta = async (buf: ArrayBuffer) => {
    const dv = new DataView(buf)
    const ba = new Uint8Array(buf)

    const chunks: Segment[] = []
    const textDecoder = new TextDecoder('utf-8')
    let offset = PNG_MAGIC_BYTES.length

    while (offset < ba.length) {
        const size = dv.getUint32(offset)
        const marker = dv.getUint32(offset + LENGTH_SIZE)
        const name = textDecoder.decode(ba.slice(offset + LENGTH_SIZE, offset + LENGTH_SIZE + 4))
        const type = name.toLowerCase()
        const start = offset + LENGTH_SIZE + TYPE_SIZE
        const length = size + LENGTH_SIZE + TYPE_SIZE + CRC_SIZE
        const seg = { type, offset, length, start, name, size, marker }
        chunks.push(seg)
        offset += length
    }

    const result: Record<string, any> = {}

    for (const chunk of chunks) {
        if (chunk.type === 'idat') continue
        const b = ba.slice(chunk.start, chunk.start + chunk.size)
        if (['itxt', 'text'].includes(chunk.type)) {
            const text = textDecoder.decode(b)
            const [key, ...val] = text.split('\0')
            result[key!] = val.join('')
        }
    }

    return result
}
