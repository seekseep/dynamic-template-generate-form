# Configuration 設定ファイルの書き方

## フォーム構造

```
form.sections[] → section
  ├── label（セクション名）
  ├── condition（表示条件、省略可）
  └── fields[] → field
        ├── label（フィールド名）
        ├── name（識別子、省略時はlabelを使用）
        ├── type（入力タイプ）
        ├── required（必須かどうか）
        ├── options（選択肢、select/radio/checkboxで使用）
        └── condition（表示条件、省略可）
```

## テンプレート構造

```
templates[] → template
  ├── label（テンプレート名、タブに表示）
  └── sections[] → section
        ├── label（セクション名）
        ├── condition（表示条件、省略可）
        └── content（テンプレート内容、{{変数名}}で値を埋め込み）
```

## フィールドタイプ一覧

| タイプ | 説明 | options | 値の形式 |
|--------|------|---------|---------|
| text | 1行テキスト | 不要 | 文字列 |
| email | メールアドレス | 不要 | 文字列 |
| tel | 電話番号 | 不要 | 文字列 |
| date | 日付 | 不要 | YYYY-MM-DD |
| number | 数値 | 不要 | 文字列 |
| textarea | 複数行テキスト | 不要 | 文字列 |
| select | ドロップダウン | 必須 | 選択した値 |
| radio | ラジオボタン | 必須 | 選択した値 |
| checkbox | チェックボックス | 必須 | 配列 |

---

## 具体例

**例1: シンプルなお問い合わせフォーム**
```json
{"form":{"sections":[{"label":"お客様情報","fields":[{"label":"お名前","type":"text","required":true},{"label":"メールアドレス","type":"email","required":true}]},{"label":"お問い合わせ","fields":[{"label":"内容","type":"textarea","required":true}]}]},"templates":[{"label":"メール形式","sections":[{"label":"本文","content":"{{お名前}} 様\n\nお問い合わせありがとうございます。\n\n【お問い合わせ内容】\n{{内容}}\n\n担当者より折り返しご連絡いたします。"}]}]}
```

**例2: 選択肢のあるフォーム**
```json
{"form":{"sections":[{"label":"基本情報","fields":[{"label":"お名前","type":"text","required":true},{"label":"お問い合わせ種別","type":"select","required":true,"options":["-- 選択してください --","商品について","配送について","返品について","その他"]},{"label":"優先度","type":"radio","required":true,"options":["高","中","低"]},{"label":"希望する連絡方法","type":"checkbox","options":["メール","電話","LINE"]}]}]},"templates":[{"label":"報告書","sections":[{"label":"内容","content":"【お問い合わせ報告】\n\nお名前: {{お名前}}\n種別: {{お問い合わせ種別}}\n優先度: {{優先度}}\n連絡方法: {{希望する連絡方法}}"}]}]}
```

**例3: 条件付き表示**
```json
{"form":{"sections":[{"label":"連絡先","fields":[{"label":"連絡方法","type":"radio","required":true,"options":["メール","電話"]},{"label":"メールアドレス","type":"email","condition":[{"field":"連絡方法","value":"メール"}]},{"label":"電話番号","type":"tel","condition":[{"field":"連絡方法","value":"電話"}]}]}]},"templates":[{"label":"連絡先情報","sections":[{"label":"メール連絡","condition":[{"field":"連絡方法","value":"メール"}],"content":"メールアドレス: {{メールアドレス}}"},{"label":"電話連絡","condition":[{"field":"連絡方法","value":"電話"}],"content":"電話番号: {{電話番号}}"}]}]}
```

**例4: 横並びフィールド**（フィールドを配列で囲む）
```json
{"form":{"sections":[{"label":"お名前","fields":[[{"label":"姓","type":"text","required":true},{"label":"名","type":"text","required":true}]]}]},"templates":[{"label":"表示","sections":[{"label":"名前","content":"お名前: {{姓}} {{名}}"}]}]}
```

**例5: 複数テンプレート**
```json
{"form":{"sections":[{"label":"注文情報","fields":[{"label":"商品名","type":"text","required":true},{"label":"数量","type":"number","required":true},{"label":"お届け先","type":"textarea","required":true}]}]},"templates":[{"label":"お客様控え","sections":[{"label":"本文","content":"【ご注文確認】\n\n商品: {{商品名}}\n数量: {{数量}}個\n\nお届け先:\n{{お届け先}}"}]},{"label":"倉庫向け","sections":[{"label":"本文","content":"出荷指示\n商品: {{商品名}}\n数量: {{数量}}\n送付先: {{お届け先}}"}]},{"label":"CSV形式","sections":[{"label":"データ","content":"\"{{商品名}}\",\"{{数量}}\",\"{{お届け先}}\""}]}]}
```

---

## よくあるパターン

**パターン1: 必須/任意フィールド**
`{"label":"お名前","type":"text","required":true}` / `{"label":"備考","type":"textarea","required":false}`
`required` を省略すると `false`（任意）

**パターン2: 選択肢の value と label を分ける**
`{"label":"都道府県","type":"select","options":[{"value":"","label":"-- 選択してください --"},{"value":"tokyo","label":"東京都"},{"value":"osaka","label":"大阪府"}]}`
値ファイルには `value` が保存される: `{"都道府県":"tokyo"}`

**パターン3: OR 条件（いずれかに一致）**
`{"label":"詳細説明","type":"textarea","condition":{"or":[{"field":"カテゴリー","value":"技術サポート"},{"field":"カテゴリー","value":"障害報告"}]}}`

**パターン4: AND 条件（すべてに一致）**
`{"label":"緊急連絡先","type":"tel","condition":{"and":[{"field":"優先度","value":"高"},{"field":"連絡方法","value":"電話"}]}}`
配列形式でも同じ: `"condition":[{"field":"優先度","value":"高"},{"field":"連絡方法","value":"電話"}]`

**パターン5: セクション全体の条件付き表示**
`{"label":"法人情報","condition":[{"field":"お客様種別","value":"法人"}],"fields":[{"label":"会社名","type":"text","required":true},{"label":"部署名","type":"text"},{"label":"担当者名","type":"text","required":true}]}`

**パターン6: name を明示的に指定**
`{"name":"customer_name","label":"お客様のお名前","type":"text"}`
テンプレートでは `{{customer_name}}` で参照。`name` を省略すると `label` がそのまま使われる。

---

## 型定義（TypeScript）

```typescript
interface GeneratorConfiguration { form: DynamicFormConfiguration; templates: DynamicTemplateConfiguration[]; }
interface DynamicFormConfiguration { sections: DynamicFormSectionConfiguration[]; }
interface DynamicFormSectionConfiguration { name?: string; label: string; condition?: ConditionConfiguration | null; fields: (DynamicFormFieldConfiguration | DynamicFormFieldConfiguration[])[]; }
interface DynamicFormFieldConfiguration { name?: string; label: string; type: FieldType; required?: boolean; options?: OptionConfiguration[]; condition?: ConditionConfiguration | null; }
type FieldType = "text" | "email" | "tel" | "date" | "number" | "textarea" | "select" | "radio" | "checkbox";
type OptionConfiguration = string | { value: string; label: string };
interface DynamicTemplateConfiguration { label: string; sections: DynamicTemplateSectionConfiguration[]; }
interface DynamicTemplateSectionConfiguration { name?: string; label: string; condition?: ConditionConfiguration | null; content: string; }
type ConditionConfiguration = ConditionExpressionConfiguration[] | { and?: ConditionExpressionConfiguration[]; or?: ConditionExpressionConfiguration[]; };
interface ConditionExpressionConfiguration { field: string; value: string; }
```

---

## トラブルシューティング

**JSON の文法エラー**: 最後のカンマ（`{"label":"お名前","type":"text",}` はNG）、シングルクォート（`{'label':'お名前'}` はNG）

**テンプレートに値が反映されない**: フィールドの `name`/`label` と `{{変数名}}` が一致しているか確認

**条件が機能しない**: `field` に指定する値は、対象フィールドの `name`（または `label`）
