import type { LangConfig } from './types'

export const en: LangConfig = {
    'system/settings/lang': 'Language',
    'system/settings/theme': 'Theme',
    'system/update-available/title': 'Update is available.',
    'system/update-available/description': 'The update will be installed on the next boot.',
    'system/git-install/title': 'Git is not installed.',
    'system/git-install/description':
        'Git must be installed to use this app. Would you like to install it?',
    'system/git-install/button': 'Install Git',
    'system/git-install-finish/title': 'Git is installed.',
    'system/git-install-finish/description': 'You have to restart the app once.',
    'system/git-install-error/title': 'An error occurred while installing Git.',
    'system/git-install-error/description':
        'Please restart the app and try again. \nIf the problem persists, please contact the developer.',

    'general/app/description':
        'flat is (will be) an all-in-one toolkit for image generation AI.\nAUTOMATIC1111 StableDiffusionWebUI and a gallery function that shows generated images in a list are provided.',
    'general/app/repository': 'Github repository',
    'general/app/report': 'Report bug',

    'galley/config/paths': 'Directory to search for images',
    'galley/config/apply': 'Apply',
    'galley/open-folder/button': 'Open folder',
    'galley/search/title': 'Search',
    'galley/search/prompt': 'Prompt',
    'galley/search/model': 'ModelName',
    'galley/search/button': 'Search',

    'webui/launcher/install-success/title': 'Installation was successful.',
    'webui/launcher/install-success/description': 'WebUI can be started.',
    'webui/launcher/launched/title': 'WebUI started.',
    'webui/launcher/not-installed/title': 'WebUI is not installed.',
    'webui/launcher/not-installed/description':
        'Do you want to install WebUI? (This may take several minutes.)',
    'webui/launcher/not-installed/button': 'Install',
    'webui/launcher/not-running/title': 'WebUI is not running.',
    'webui/launcher/uninstall-env/button': 'UnInstall Environment',
    'webui/launcher/uninstall-env/title': 'Uninstall your Python environment',
    'webui/launcher/uninstall-env/description':
        'WebUI files such as output images are not deleted.',
    'webui/launcher/uninstall/button': 'Uninstall WebUI',
    'webui/launcher/open-folder/button': 'Open webui folder',

    'webui/launcher/config/commit': 'Commit hash (or Branch name)',
    'webui/launcher/config/update': 'Update WebUI',

    'webui/config/ckpt-dir': 'Checkpoints directory',
    'webui/config/vae-dir': 'VAE directory',
    'webui/config/hypernetwork-dir': 'Hypernetworks directory',
    'webui/config/embeddings-dir': 'Embeddings directory',
    'webui/config/xformers': 'Enable xformers',
    'webui/config/custom': 'Custom arguments',
}
