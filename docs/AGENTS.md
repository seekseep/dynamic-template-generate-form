# Dynamic Template Generate Form - AI アシスタント向けドキュメント

このドキュメントは、AI チャットボット（Copilot、ChatGPT など）がこのプロジェクトについて質問に回答するためのエントリーポイントです。

---

## AI アシスタントへの指示

あなたは「Dynamic Template Generate Form」プロジェクトの専門家として振る舞ってください。

### 基本的な対応方針

1. **質問者はプログラミング初心者**です。専門用語を使う場合は必ず説明を添えてください。
2. **具体的な例を示す**ことを優先してください。抽象的な説明よりも、実際に使えるコードや設定を提供してください。
3. **段階的に説明**してください。一度に多くの情報を与えず、ステップバイステップで進めてください。

---

## プロジェクト概要

### このアプリケーションでできること

「Dynamic Template Generate Form」は、JSON 設定ファイルから動的にフォームを生成し、入力した内容をテンプレートに反映して出力するウェブアプリケーションです。

**主な用途**: お問い合わせフォームの入力内容を定型文で出力、注文情報の入力と帳票生成、サポートリクエストの受付と報告書作成

**特徴**: サーバー不要（ブラウザだけで動作）、設定ファイルを変更するだけでフォームをカスタマイズ可能、複数のテンプレート形式で同時に出力可能

### 動作の流れ

1. 設定ファイル（configuration.json）を読み込む → 2. 設定に基づいてフォームが自動生成される → 3. ユーザーがフォームに入力する → 4. 「生成」ボタンを押すと、テンプレートに値が埋め込まれて出力される

### 画面構成

左側50%がフォーム入力エリア、右側50%がテンプレート出力エリア（タブ切り替え）。上部に「設定」「入力内容」メニュー。

---

## ディレクトリ構造

```
app/                    # アプリケーション本体（実行に必要）
├── index.html          # メインページ
└── js/
    ├── main.js              # 初期化・イベント連携
    ├── configuration.js     # 設定クラス定義
    ├── defaultConfiguration.js  # デフォルト設定
    ├── storage.js           # ローカルストレージ管理
    ├── form.js              # フォーム生成・管理
    ├── renderer.js          # テンプレート描画
    ├── actions.js           # メニュー/アクション
    └── exporter.js          # JSON書き出し
samples/                # サンプルファイル（実行に不要）
docs/                   # ドキュメント（実行に不要）
```

---

## ユースケース 1: 設定ファイルを作りたい

### AI アシスタントへ: 設定ファイル作成時の対話フロー

設定ファイルの作成を依頼された場合は、以下の順序で対話を進めてください。

**ステップ 1: 入力項目の一覧を要求する**
「フォームで入力したい項目を教えてください。例: お名前、メールアドレス、お問い合わせ内容 など」

**ステップ 2: レイアウト案を提示する**
入力項目をもとに、セクション分けとフィールドタイプを提案。「【セクション1: お客様情報】お名前（テキスト、必須）、メールアドレス（メール、必須）...」

**ステップ 3: 条件付き表示の確認**
「特定の条件で表示/非表示にしたいフィールドはありますか？例: 『連絡方法』で『電話』を選んだときだけ『電話番号』を表示」

**ステップ 4: テンプレートの確認**
「出力するテンプレートの形式を教えてください。例: メール本文形式、報告書形式、CSV形式」

**ステップ 5: 設定ファイルを出力する**

---

### 設定ファイルの基本構造

```json
{"form":{"sections":[{"label":"セクション名","fields":[{"label":"フィールド名","type":"text","required":true}]}]},"templates":[{"label":"テンプレート名","sections":[{"label":"セクション名","content":"お名前: {{お名前}}"}]}]}
```

- `form` にはフォームの構造を定義
- `templates` には出力テンプレートを定義
- `{{フィールド名}}` で入力値を埋め込み

### フォーム構造

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

### テンプレート構造

```
templates[] → template
  ├── label（テンプレート名、タブに表示）
  └── sections[] → section
        ├── label（セクション名）
        ├── condition（表示条件、省略可）
        └── content（テンプレート内容、{{変数名}}で値を埋め込み）
```

### フィールドタイプ一覧

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

### 設定ファイル具体例

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
{"form":{"sections":[{"label":"注文情報","fields":[{"label":"商品名","type":"text","required":true},{"label":"数量","type":"number","required":true},{"label":"お届け先","type":"textarea","required":true}]}]},"templates":[{"label":"お客様控え","sections":[{"label":"本文","content":"【ご注文確認】\n\n商品: {{商品名}}\n数量: {{数量}}個\n\nお届け先:\n{{お届け先}}\n\nご注文ありがとうございます。"}]},{"label":"倉庫向け","sections":[{"label":"本文","content":"出荷指示\n商品: {{商品名}}\n数量: {{数量}}\n送付先: {{お届け先}}"}]},{"label":"CSV形式","sections":[{"label":"データ","content":"\"{{商品名}}\",\"{{数量}}\",\"{{お届け先}}\""}]}]}
```

---

### 設定ファイルのよくあるパターン

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

### 型定義（TypeScript）

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

## ユースケース 2: 値ファイルを作りたい

フォームに入力するサンプルデータや、テスト用のデータを保存するのが値ファイル（values.json）です。

### 値ファイルの基本構造

```json
{"お名前":"山田太郎","メールアドレス":"yamada@example.com","カテゴリー":"技術サポート","メッセージ":"ログイン時にエラーが発生します。"}
```

- キーはフィールドの `name`（または `label`）
- 値はフィールドタイプに応じた形式
- チェックボックスのみ配列形式

### フィールドタイプと値の形式

| フィールドタイプ | 値の型 | 例 |
|-----------------|--------|-----|
| text | 文字列 | `"山田太郎"` |
| email | 文字列 | `"yamada@example.com"` |
| tel | 文字列 | `"090-1234-5678"` |
| date | 文字列（YYYY-MM-DD） | `"2024-01-15"` |
| number | 文字列 | `"10"` |
| textarea | 文字列（改行は\n） | `"1行目\n2行目"` |
| select | 文字列（選択した値） | `"東京都"` |
| radio | 文字列（選択した値） | `"メール"` |
| checkbox | 文字列の配列 | `["メール","電話"]` |

### 値ファイル具体例

**例1: お問い合わせフォームの値**
```json
{"お名前":"山田太郎","メールアドレス":"yamada@example.com","電話番号":"090-1234-5678","カテゴリー":"技術","メッセージ":"ログイン時にエラーが発生します。\n\n症状：\n- エラーメッセージが表示される\n- 複数回試しても同じ現象"}
```

**例2: 注文フォームの値**
```json
{"商品名":"オーガニックコットンTシャツ","数量":"3","サイズ":"M","オプション":["ギフト包装","メッセージカード"],"お届け先住所":"〒100-0001\n東京都千代田区千代田1-1\n山田太郎 様","希望日":"2024-02-14"}
```

**例3: 条件付きフィールドがある場合**
```json
{"希望する連絡方法":"メール","メールアドレス":"yamada@example.com","電話番号":""}
```

**例4: value と label が異なる選択肢**
設定: `"options":[{"value":"tokyo","label":"東京都"}]` → 値ファイル: `{"都道府県":"tokyo"}`

### configuration.json から values.json を作成する手順

1. `form.sections` 内の全フィールドを確認
2. 各フィールドの `name`（なければ `label`）をキーとして使用
3. フィールドタイプに応じた初期値を設定: text/email/tel/date/number/textarea/select/radio → `""`、checkbox → `[]`

### 値の変換ルール（テンプレートでの表示）

values.json の値は、テンプレート内の `{{変数名}}` で置換されます。配列（チェックボックスの値）はカンマ区切りで結合されます。

値: `{"お名前":"山田太郎","趣味":["読書","映画","旅行"]}` → テンプレート: `お名前: {{お名前}}\n趣味: {{趣味}}` → 出力: `お名前: 山田太郎\n趣味: 読書,映画,旅行`

### アプリでの操作

**値ファイルの読み込み**: アプリ上部「入力内容」→「読み込み」→ values.json を選択
**値ファイルの書き出し**: フォームに入力後「入力内容」→「書き出す」→ `{設定名}-YYYY-MM-DD.json` 形式でダウンロード

### 型定義（TypeScript）

```typescript
type Values = { [fieldName: string]: string | string[]; };
```

---

## ユースケース 3: コードを変更したい

新しい機能を追加したり、表示を変更したい場合はコードの変更が必要です。

### アーキテクチャ概要

クライアントサイドアプリケーション。サーバー不要、ブラウザのローカルストレージで設定を永続化、2カラムレイアウト。

**使用ライブラリ**: jQuery 3.6.0（DOM操作）、Bootstrap 5.3.0（UIコンポーネント）。CDN経由で読み込み。

### 各ファイルの役割

| ファイル | 役割 |
|---------|------|
| main.js | アプリケーションの初期化とモジュール間のイベント連携 |
| configuration.js | 設定データの構造を定義するクラス群 |
| defaultConfiguration.js | アプリケーション起動時のデフォルト設定 |
| storage.js | ローカルストレージの読み書き（loadConfiguration, saveConfiguration, clearConfiguration） |
| form.js | 動的フォームの生成と管理（buildUI, getValues, setValues, resetValues, setConfiguration） |
| renderer.js | テンプレートの変数置換と描画（replaceVariables, renderTemplate, buildUI, render） |
| actions.js | ナビゲーションメニューの管理 |
| exporter.js | JSON形式でのデータ書き出し |

### イベント連携（main.js）

| イベント | 発火元 | 処理内容 |
|---------|--------|----------|
| submit | Form | Renderer でテンプレートを描画 |
| import-values | Actions | Form に値をセット |
| export-values | Actions | Exporter で値を書き出し |
| reset-values | Actions | Form の値をリセット |
| import-configuration | Actions | Form/Renderer の設定を更新 |
| reset-configuration | Actions | ストレージをクリア、リロード |

### データフロー

**フォーム入力 → テンプレート出力**: ユーザー入力 → 「生成」クリック → form.getValues() → 'submit' イベント発火 → main.js リスナー → renderer.render(values) → replaceVariables() で {{変数}} を置換 → 出力表示

**設定インポート**: 「設定」→「読み込み」 → ファイル選択 → readFileAsString() → JSON.parse → GeneratorConfiguration.create() → 'import-configuration' イベント → form/renderer.setConfiguration() + storage.saveConfiguration()

### コード変更ガイド

**変更1: 新しいフィールドタイプを追加する**（例: time タイプ）

1. form.js に生成メソッドを追加:
```javascript
createTimeField(field) { const $input = $('<input>').attr('type', 'time').attr('name', field.name).addClass('form-control'); if (field.required) { $input.attr('required', true); } return this.wrapField(field, $input); }
```

2. buildUI() のフィールドタイプ分岐に追加:
```javascript
case 'time': $fieldElement = this.createTimeField(field); break;
```

**変更2: テンプレートの変数置換ルールを変更する**（例: 配列の区切り文字を改行に）

renderer.js の replaceVariables() を編集:
```javascript
// 変更前: if (Array.isArray(value)) { value = value.join(','); }
// 変更後: if (Array.isArray(value)) { value = value.join('\n'); }
```

**変更3: 新しいテンプレート変数を追加する**（例: 現在の日付 {{TODAY}}）

renderer.js の replaceVariables() を編集:
```javascript
replaceVariables(template, values) { let result = template; const today = new Date().toISOString().split('T')[0]; result = result.replace(/\{\{TODAY\}\}/g, today); /* 既存の処理 */ return result; }
```

**変更4: UI のスタイルを変更する**（例: フォームの幅を変更）

index.html のスタイルを編集: 左側 `width: 50%` → `width: 60%`、右側 `width: 50%` → `width: 40%`

**変更5: 新しいメニュー項目を追加する**（例: 「コピー」ボタン）

actions.js: `const $copyButton = $('<button>').addClass('dropdown-item').text('コピー').on('click', () => { this.closeDropdown(); this.dispatchEvent('copy-values'); });`
main.js: `actions.addEventListener('copy-values', () => { const values = form.getValues(); navigator.clipboard.writeText(JSON.stringify(values, null, 2)); alert('コピーしました'); });`

### スクリプト読み込み順序

index.html での順序（依存関係を考慮）: 1. configuration.js → 2. defaultConfiguration.js → 3. storage.js → 4. exporter.js → 5. form.js → 6. renderer.js → 7. actions.js → 8. main.js

---

## よくある質問

**Q1: 条件によってフィールドを表示/非表示にしたい**
`condition` プロパティを使用: `{"label":"電話番号","type":"tel","condition":[{"field":"連絡方法","value":"電話"}]}`

**Q2: 複数のフィールドを横並びにしたい**
フィールドを配列で囲む: `"fields":[[{"label":"姓","type":"text"},{"label":"名","type":"text"}]]`

**Q3: セレクトボックスの選択肢を設定したい**
`options` プロパティを使用: `{"label":"都道府県","type":"select","options":["東京都","神奈川県","埼玉県"]}`
値とラベルを分ける場合: `"options":[{"value":"tokyo","label":"東京都"},{"value":"kanagawa","label":"神奈川県"}]`

**Q4: 設定ファイルをアプリに読み込むには？**
アプリ上部「設定」メニュー →「読み込み」→ JSON ファイルを選択

**Q5: 入力した値を保存したい**
アプリ上部「入力内容」メニュー →「書き出す」→ JSON ファイルとしてダウンロード

**Q6: チェックボックスで複数選択した値はどうなる？**
配列として保存され、テンプレートではカンマ区切りで出力: `{"興味のある分野":["技術","デザイン"]}` → `興味のある分野: 技術,デザイン`

---

## トラブルシューティング

**問題: フォームが表示されない**
原因: 設定ファイルの JSON 形式が正しくない
解決策: JSON の文法をチェック（カンマ、括弧の対応など）、ブラウザの開発者ツール（F12）でエラーを確認

**問題: テンプレートに値が反映されない**
原因: フィールド名とテンプレートの変数名が一致していない
解決策: フィールドの `name`（または `label`）と `{{変数名}}` が一致しているか確認

**問題: 条件付き表示が機能しない**
原因: 条件の `field` や `value` が正しくない
解決策: `field` に指定したフィールド名が存在するか確認、`value` に指定した値が選択肢に含まれているか確認

**問題: JSON の文法エラー**
よくある間違い: 最後のカンマ（`{"label":"お名前","type":"text",}` はNG）、シングルクォート（`{'label':'お名前'}` はNG、ダブルクォートを使う）

**問題: 変更が反映されない**
解決策: ブラウザのキャッシュをクリア（Ctrl+Shift+R）、開発者ツールでエラーを確認、スクリプトの読み込み順序を確認

**問題: エラー "xxx is not defined"**
原因: スクリプトの読み込み順序が正しくない
解決策: 依存するクラスや関数が先に読み込まれているか確認

---

## 用語集

| 用語 | 説明 |
|-----|------|
| configuration.json | フォームの構造とテンプレートを定義する設定ファイル |
| values.json | フォームに入力する値を保存したファイル |
| セクション | フォームやテンプレートの区切り（グループ） |
| フィールド | 入力欄（テキスト、セレクト、チェックボックスなど） |
| テンプレート | 出力形式を定義したひな形 |
| 変数 | `{{名前}}` 形式で入力値を埋め込む場所 |
| 条件 | フィールドの表示/非表示を制御するルール |
