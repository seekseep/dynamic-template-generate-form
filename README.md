# Dynamic Template Generate Form

JSON設定から動的にフォームを生成し、入力値をテンプレートに反映して出力するクライアントサイドアプリケーションです。

## 機能

- JSON設定ファイルからフォームを動的に生成
- 条件付きフィールド表示（AND/OR条件対応）
- 複数テンプレートへの同時出力（タブ切り替え）
- 設定・入力値のインポート/エクスポート
- ローカルストレージによる設定の永続化

## ディレクトリ構造

```
dynamic-template-generate-form/
├── app/                    # アプリケーション本体（実行に必要）
│   ├── index.html
│   └── js/
│       ├── main.js
│       ├── configuration.js
│       ├── defaultConfiguration.js
│       ├── storage.js
│       ├── form.js
│       ├── renderer.js
│       ├── actions.js
│       └── exporter.js
├── samples/                # サンプルデータ（実行に不要）
│   ├── contact/
│   ├── order/
│   └── support/
├── docs/                   # ドキュメント（実行に不要）
│   ├── AGENTS.md           # AI アシスタント向けエントリーポイント
│   ├── CONFIGURATION.md    # 設定ファイルの書き方
│   ├── VALUES.md           # 値ファイルの書き方
│   └── CODE.md             # コード変更ガイド
├── .github/                # GitHub Actions設定（実行に不要）
└── README.md               # このファイル（実行に不要）
```

## ドキュメント

[docs/AGENTS.md](docs/AGENTS.md) に設定ファイルの書き方、値ファイルの書き方、コード変更ガイドをまとめています。

### AI アシスタントを使う場合

Copilot や ChatGPT にこのプロジェクトについて質問する場合は、[docs/AGENTS.md](docs/AGENTS.md) を渡してください。

## 実行に必要なファイル

`app/` ディレクトリ配下のファイルのみが実行に必要です:

- `app/index.html` - エントリーポイント
- `app/js/*.js` - JavaScript ファイル（8ファイル）

外部ライブラリ（jQuery, Bootstrap）は CDN から読み込むため、追加のインストールは不要です。

## 実行に不要なファイル

| ファイル/ディレクトリ | 用途 |
|---------------------|------|
| `README.md` | プロジェクト説明 |
| `docs/` | ドキュメント |
| `samples/` | サンプル設定・値ファイル |
| `.github/` | GitHub Actions 設定 |

## 使い方

### 起動

`app/index.html` をブラウザで開くか、静的ファイルサーバーで配信します。

```bash
# 例: Python の簡易サーバー
cd app
python -m http.server 8000
```

### 設定のカスタマイズ

1. `samples/` 内のサンプルを参考に configuration.json を作成
2. アプリの「設定」→「読み込み」から JSON をインポート

### 入力値のインポート/エクスポート

- 「入力内容」→「書き出す」で現在の値を JSON として保存
- 「入力内容」→「読み込み」で保存した JSON を復元
