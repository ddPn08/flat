import type { LangConfig } from './types'

export const ja: LangConfig = {
    'system/settings/lang': '言語',
    'system/settings/theme': 'テーマ',
    'system/update-available/title': 'アップデートの準備ができました。',
    'system/update-available/description': '次回の起動時にアップデートがインストールされます。',
    'system/git-install/title': 'Gitがインストールされていません。',
    'system/git-install/description':
        'このアプリを利用するにはGitをインストールする必要があります。インストールしますか？',
    'system/git-install/button': 'Gitをインストール',
    'system/git-install-finish/title': 'Gitがインストールされました。',
    'system/git-install-finish/description': 'アプリを一度再起動する必要があります。',
    'system/git-install-error/title': 'Gitのインストール中にエラーが発生しました。',
    'system/git-install-error/description':
        'アプリを再起動して、再度試してください。\n解決しない場合は開発者にお問い合わせください。',

    'webui/launcher/install-success/title': 'インストールに成功しました。',
    'webui/launcher/install-success/description': 'WebUIを起動できます。',
    'webui/launcher/launched/title': 'WebUIが起動しました。',
    'webui/launcher/not-installed/title': 'WebUIがインストールされていません。',
    'webui/launcher/not-installed/description':
        'WebUIをインストールしますか？(これには数分かかる場合があります。)',
    'webui/launcher/not-installed/button': 'インストールする',
    'webui/launcher/not-running/title': 'WebUIは起動していません。',
    'webui/launcher/uninstall-env/button': 'UnInstall Environment',
    'webui/launcher/uninstall-env/title': 'Python環境をアンインストールします',
    'webui/launcher/uninstall-env/description': '出力画像等の、WebUIのファイルは削除されません。',
    'webui/launcher/uninstall/button': 'Uninstall WebUI',

    'webui/launcher/config/commit': "Commit hash (またはブランチ名)",
    "webui/launcher/config/update": "WebUIを更新",

    'webui/config/ckpt-dir': 'モデルディレクトリ',
    'webui/config/vae-path': 'VAEディレクトリ',
    'webui/config/hypernetwork-dir': 'Hypernetworksディレクトリ',
    'webui/config/embeddings-dir': 'Embeddingsディレクトリ',
    'webui/config/xformers': 'xformersを有効にする',
    'webui/config/custom': 'コマンドライン引数',
}
