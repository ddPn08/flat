const LangKeys = [
    'system/settings/lang',
    'system/settings/theme',
    'system/update-available/title',
    'system/update-available/description',
    'system/git-install/title',
    'system/git-install/description',
    'system/git-install/button',
    'system/git-install-finish/title',
    'system/git-install-finish/description',
    'system/git-install-error/title',
    'system/git-install-error/description',

    'galley/config/paths',
    'galley/config/apply',

    'webui/launcher/install-success/title',
    'webui/launcher/install-success/description',
    'webui/launcher/launched/title',
    'webui/launcher/not-installed/title',
    'webui/launcher/not-installed/description',
    'webui/launcher/not-installed/button',
    'webui/launcher/not-running/title',
    'webui/launcher/uninstall-env/button',
    'webui/launcher/uninstall-env/title',
    'webui/launcher/uninstall-env/description',
    'webui/launcher/uninstall/button',

    'webui/launcher/config/commit',
    'webui/launcher/config/update',

    'webui/config/ckpt-dir',
    'webui/config/vae-path',
    'webui/config/embeddings-dir',
    'webui/config/hypernetwork-dir',
    'webui/config/xformers',
    'webui/config/custom',
] as const
export type LangKeys = (typeof LangKeys)[number]
export type LangConfig = Record<LangKeys, string>
