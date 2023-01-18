import { en } from './en'
import { ja } from './ja'
import type { LangConfig } from './types'

export const dict: Record<'ja' | 'en', LangConfig> = {
    ja,
    en,
}
