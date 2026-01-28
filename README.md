# Dynamic Template Generate Form

JSONで定義されたフォーム設定から、動的にHTMLフォームを生成し、ユーザー入力に基づいてテンプレートテキストを自動生成するWebアプリケーションです。

## 特徴

- **動的フォーム生成**: JSONフォーム設定から自動的にHTMLフォームを生成
- **テンプレート出力**: ユーザー入力をテンプレートに代入して出力
- **設定の保存/読込**: ブラウザのlocalStorageに自動保存、JSONファイルでのインポート/エクスポート対応
- **条件付き表示**: AND/ORロジックでセクション・フィールドを条件付きで表示
- **複数のフォームタイプ**: text、email、date、textarea、select、radio、checkboxに対応

## プロジェクト構成

```
dynamic-template-generate-form/
├── index.html              # メインHTMLファイル
├── README.md              # このファイル
└── assets/
    ├── js/
    │   ├── main.js        # メイン処理（イベントリスナー設定）
    │   ├── config.js      # 設定管理（デフォルト設定、読込/保存）
    │   ├── factory.js     # フォーム/テンプレート生成（ファクトリーパターン）
    │   ├── form.js        # フォーム関連処理（DOM操作、バリデーション）
    │   ├── template.js    # テンプレート処理（変数置換、条件判定）
    │   ├── storage.js     # localStorage管理（データの永続化）
    │   └── types.ts       # TypeScript型定義
    └── data/
        ├── contact.json   # お問い合わせフォームの例
        ├── order.json     # 注文フォームの例
        └── support.json   # サポートフォームの例
```

## 使い方

### 1. ブラウザで開く

```bash
open index.html
```

または、ローカルサーバーで実行：

```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000 にアクセス
```

### 2. フォーム設定をカスタマイズ

ブラウザの**「インポート」ボタン**からJSONファイルをアップロードするか、デベロッパーコンソールで設定を編集してください。

フォーム設定の例（contact.json）：

```json
{
  "form": {
    "sections": [
      {
        "label": "基本情報",
        "condition": null,
        "fields": [
          {
            "name": "name",
            "label": "お名前",
            "type": "text",
            "required": true
          },
          {
            "name": "email",
            "label": "メールアドレス",
            "type": "email",
            "required": true
          }
        ]
      }
    ]
  },
  "template": {
    "sections": [
      {
        "label": "基本情報",
        "condition": null,
        "content": "【基本情報】\nお名前: {{name}}\nメールアドレス: {{email}}\n"
      }
    ]
  }
}
```

### 3. フォームに入力して出力を生成

1. 左側のフォームに入力します
2. フォームの下の「生成」ボタン（またはフォーム送信）をクリックします
3. 右側にテンプレートが出力されます
4. 「クリップボードにコピー」で結果をコピーできます

## JSON設定フォーマット

### フォーム設定（form）

```typescript
{
  "form": {
    "sections": [
      {
        "label": string;              // セクション表示名
        "name": string;               // セクション識別子（オプション）
        "condition": DynamicFormCondition | null;  // 表示条件
        "fields": [
          {
            "name": string;           // フィールド識別子
            "label": string;          // フィールド表示名
            "type": "text" | "email" | "date" | "textarea" | "select" | "radio" | "checkbox";
            "required": boolean;      // 必須フィールド
            "options": string[] | Array<{value: string, label: string}>; // selectやradio用
            "condition": DynamicFormCondition | null;  // 表示条件
          }
        ]
      }
    ]
  }
}
```

### テンプレート設定（template）

```typescript
{
  "template": {
    "sections": [
      {
        "label": string;              // セクション表示名
        "name": string;               // セクション識別子（オプション）
        "condition": DynamicFormCondition | null;  // 表示条件
        "content": string;            // テンプレートコンテンツ（{{fieldName}}で置換）
      }
    ]
  }
}
```

### 条件指定形式（condition）

```typescript
// AND条件の例
{
  "and": [
    { "field": "category", "value": "技術サポート" },
    { "field": "priority", "value": "high" }
  ]
}

// OR条件の例
{
  "or": [
    { "field": "category", "value": "一般的な質問" },
    { "field": "category", "value": "その他" }
  ]
}
```

## 機能説明

### インポート
JSONファイルをアップロードして、フォームとテンプレート設定を読み込みます。

### エクスポート
現在の設定をJSON形式でダウンロードします。

### リセット
設定をデフォルト状態に戻します。

### クリップボードにコピー
生成されたテンプレート出力をクリップボードにコピーします。

## 技術スタック

- **フロントエンド**: HTML5、CSS3（Bootstrap 5.3.0）
- **スクリプト**: JavaScript（ES6+）、jQuery
- **型定義**: TypeScript
- **状態管理**: ブラウザのlocalStorage

## サンプルフォーム

このプロジェクトには3つのサンプルフォーム設定が含まれています：

- **contact.json**: お問い合わせフォーム
- **order.json**: 注文フォーム
- **support.json**: サポートフォーム

これらのファイルは`assets/data/`ディレクトリに配置されており、インポート機能で読み込めます。

## カスタマイズ例

### カスタムフォーム設定の作成

以下のような構造で新しいJSON設定ファイルを作成できます：

```json
{
  "form": {
    "sections": [
      {
        "label": "ユーザー情報",
        "fields": [
          {
            "name": "username",
            "label": "ユーザー名",
            "type": "text",
            "required": true
          },
          {
            "name": "role",
            "label": "ロール",
            "type": "select",
            "required": true,
            "options": [
              { "value": "admin", "label": "管理者" },
              { "value": "user", "label": "一般ユーザー" },
              { "value": "guest", "label": "ゲスト" }
            ]
          }
        ]
      }
    ]
  },
  "template": {
    "sections": [
      {
        "label": "出力",
        "content": "ユーザー名: {{username}}\nロール: {{role}}"
      }
    ]
  }
}
```

## ブラウザ互換性

- Chrome/Edge（最新版）
- Firefox（最新版）
- Safari（最新版）

localStorage対応ブラウザが必須です。

## ライセンス

MITライセンス