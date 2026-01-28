# データ構造

## 設定ファイル

```ts
type Configuration {
  form: FormConfiguration;
  templates: TemplateConfiguration[];
}

type FormConfiguration {
  sections: FormSection[]
}

type FormSection {
  label: string;
  condition: Condition | null;
  fields: (FormField | FormField[])[];
}

type FormField {
  label: string;
  type: FieldType;
  name?: string;
  required: boolean;
  options?: (string | FieldOption)[];
}

type FieldOption {
  value: string;
  label: string;
}

type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select' | 'radio' | 'checkbox';

type Condition = {
  and?: ConditionExpression[];
} | {
  or?: ConditionExpression[];
} | null;

type ConditionExpression {
  field: string;
  value: string | boolean | number;
}

type TemplateConfiguration {
  label: string;
  sections: TemplateSection[]
}

type TemplateSection {
  label: string;
  condition: Condition | null;
  content: string;
}
```

## JSON ファイル例

### contact.json

```json
{
  "form": {
    "sections": [
      {
        "label": "基本情報",
        "condition": null,
        "fields": [
          {
            "label": "お名前",
            "type": "text",
            "required": true
          },
          {
            "label": "メールアドレス",
            "type": "email",
            "required": true
          },
          {
            "label": "電話番号",
            "type": "tel",
            "required": false
          }
        ]
      },
      {
        "label": "お問い合わせ内容",
        "condition": null,
        "fields": [
          {
            "label": "カテゴリー",
            "type": "select",
            "required": true,
            "options": [
              "-- 選択してください --",
              "一般的な質問",
              "技術サポート",
              "営業に関する質問",
              "その他"
            ]
          },
          {
            "label": "件名",
            "type": "text",
            "required": true
          },
          {
            "label": "メッセージ",
            "type": "textarea",
            "required": true
          }
        ]
      },
      {
        "label": "希望する連絡方法",
        "condition": null,
        "fields": [
          {
            "label": "ご希望の連絡方法",
            "type": "radio",
            "required": true,
            "options": [
              "メール",
              "電話",
              "SMS"
            ]
          }
        ]
      }
    ]
  },
  "templates": [
    {
      "label": "標準テンプレート",
      "sections": [
        {
          "label": "基本情報",
          "condition": null,
          "content": "【基本情報】\nお名前: {{name}}\nメールアドレス: {{email}}\n電話番号: {{phone}}\n"
        },
        {
          "label": "お問い合わせ内容",
          "condition": null,
          "content": "【お問い合わせ内容】\nカテゴリー: {{category}}\n件名: {{subject}}\nメッセージ:\n{{message}}\n"
        },
        {
          "label": "希望する連絡方法",
          "condition": null,
          "content": "【希望する連絡方法】\nご希望の連絡方法: {{contact_method}}\n"
        }
      ]
    },
    {
      "label": "シンプル版",
      "sections": [
        {
          "label": "基本情報",
          "condition": null,
          "content": "名前: {{name}}\nメール: {{email}}\n"
        },
        {
          "label": "お問い合わせ内容",
          "condition": null,
          "content": "件名: {{subject}}\n内容: {{message}}\n"
        }
      ]
    }
  ]
}
```

## 使用法

### 1. フォーム定義 (Form)

フォームは複数の **セクション** で構成されます。各セクションは複数の **フィールド** を含みます。

**セクション特性:**
- `label`: セクションタイトル
- `condition`: 条件付き表示（null = 常に表示）
- `fields`: フィールドの配列

**フィールド特性:**
- `label`: フィールドラベル
- `type`: 入力タイプ（text, email, select など）
- `required`: 必須フラグ
- `name`: フィールド名（省略可 - ラベルから自動生成）
- `options`: 選択肢（select, radio, checkbox の場合のみ）

**フィールド配列レイアウト:**
複数フィールドを配列で括ると、横並びレイアウトになります：

```json
"fields": [
  {
    "label": "名前",
    "type": "text",
    "required": true
  },
  {
    "label": "メール",
    "type": "email",
    "required": true
  }
]
```

### 2. テンプレート定義 (Templates)

複数のテンプレートを配列で定義できます。各テンプレートは異なるフォーマットやレイアウトで同じフォームデータを出力できます。

**テンプレート特性:**
- `label`: テンプレート名（タブ表示に使用）
- `sections`: セクションの配列

**セクション特性:**
- `label`: セクションタイトル
- `condition`: 条件付き表示（null = 常に表示）
- `content`: テンプレートコンテンツ（{{変数名}} で置換）

**複数テンプレートの例:**
```json
"templates": [
  {
    "label": "標準テンプレート",
    "sections": [...]
  },
  {
    "label": "シンプル版",
    "sections": [...]
  },
  {
    "label": "詳細版",
    "sections": [...]
  }
]
```

生成ボタンを押すと、複数のテンプレートが異なるタブに表示されます。タブを切り替えることで各テンプレートの出力を確認・コピーできます。

### 3. 条件式 (Condition)

フォームやテンプレートセクションの表示を条件付けできます。

**AND 条件:**
```json
"condition": {
  "and": [
    { "field": "category", "value": "技術サポート" },
    { "field": "status", "value": "active" }
  ]
}
```

**OR 条件:**
```json
"condition": {
  "or": [
    { "field": "category", "value": "技術サポート" },
    { "field": "category", "value": "緊急" }
  ]
}
```

## UI 構成

### 左パネル：入力フォーム
- フォーム設定に基づいて動的に生成
- 条件付きフィールド表示に対応
- セクションごとに整理された入力エリア
- 設定ボタン（インポート、データ読込、リセット）

### 右パネル：テンプレート出力
- **テンプレートタブ**: 複数のテンプレートをタブで表示
  - 各テンプレートに個別のタブを作成
  - タブラベルは `TemplateConfiguration.label` から自動生成
  - アクティブなタブのみコンテンツを表示

- **コピーボタン**: アクティブなテンプレートの出力をクリップボードにコピー

### 生成フロー
1. フォームに入力・選択を行う
2. 「生成」ボタンをクリック
3. すべてのテンプレートが同時に処理される
4. 各テンプレートの出力がそれぞれのタブに表示
5. タブを切り替えて異なるフォーマットの出力を確認
6. 「クリップボードにコピー」で必要なテンプレートをコピー

## エクスポート

**Export JSON** ボタンで、現在の設定を JSON ファイルとしてダウンロードできます。

ファイル名: `{filename}.json` (contact, order, support など)

## サポートされているフィールドタイプ

| タイプ | 説明 | 入力例 |
|--------|------|--------|
| text | テキスト入力 | 名前、住所など |
| email | メールアドレス入力 | user@example.com |
| tel | 電話番号入力 | 090-1234-5678 |
| number | 数字入力 | 価格、数量など |
| date | 日付入力 | 2024-01-28 |
| textarea | 複数行テキスト | コメント、メッセージなど |
| select | ドロップダウン選択 | カテゴリー選択 |
| radio | ラジオボタン | 単一選択 |
| checkbox | チェックボックス | 複数選択 |
