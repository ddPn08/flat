export type ImageInformation = Partial<{
    prompt: string
    negative_prompt: string
    model: string
    model_hash: string
    steps: number
    cfg_scale: number
    sampler: string
    seed: string
    clip_skip: string
    embedding: string
    hypernetwork: string
    vae: string
}>

export type ImageData = {
    filepath: string
    created_at: Date
    info: ImageInformation
}

export type ImageSearchOptions = Partial<{
    since: number
    limit: number
    filename: string
    info: ImageInformation
}>
