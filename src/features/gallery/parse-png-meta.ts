import type { ImageInformation } from "./types"

const parseAutomatic1111Meta = (parameters: string) => {
    const result: ImageInformation = {}
    const prompt = parameters.split(/\nNegative prompt:/)[0]
    const negative_prompt = parameters.split(/\nNegative prompt:/)[1]?.split(/Steps: \d+/)[0]
    const others = parameters.split(/\n/g).slice(-1)[0]
    result.prompt = prompt || ''
    result.negative_prompt = (negative_prompt || '').replace(/\n$/, '')
    if (others) {
        for (const prop of others.split(/, /g)) {
            const [key, value] = prop.split(': ')
            switch (key) {
                case 'Steps':
                    result.steps = parseInt(value || '0')
                    break
                case 'Sampler':
                    result.sampler = value || ''
                    break
                case 'CFG scale':
                    result.cfg_scale = parseInt(value || '0')
                    break
                case 'Seed':
                    result.seed = value || ''
                    break
                case 'Model':
                    result.model = value || ''
                    break
                case 'Model hash':
                    result.model_hash = value || ''
                    break
                case 'Clip skip':
                    result.clip_skip = value || ''
                    break
            }
        }
    }
    return result
}

const parseNovelAIMeta = (meta: Record<string, any>) => {
    const comment = JSON.parse(meta['Comment'])
    const prompt = meta['Description']
    const result: ImageInformation = {
        prompt,
        negative_prompt: comment['uc'],
        steps: parseInt(comment['steps']),
        sampler: `${comment['sampler']}`,
        cfg_scale: parseInt(comment['scale']),
        seed: `${comment['seed']}`,
        model: `${meta['Software']}`,
    }
    return result
}

export const parseMetadata = (meta: any) => {
    if (meta?.['parameters']) return parseAutomatic1111Meta(meta['parameters'] as string)
    else if (meta?.['Software'] === 'NovelAI') return parseNovelAIMeta(meta)
}
