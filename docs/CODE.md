# Code コード詳細

## アーキテクチャ概要

クライアントサイドアプリケーション。サーバー不要、ブラウザのローカルストレージで設定を永続化、2カラムレイアウト。

**使用ライブラリ**: jQuery 3.6.0（DOM操作）、Bootstrap 5.3.0（UIコンポーネント）。CDN経由で読み込み。

---

## 各ファイルの役割

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

---

## イベント連携（main.js）

| イベント | 発火元 | 処理内容 |
|---------|--------|----------|
| submit | Form | Renderer でテンプレートを描画 |
| import-values | Actions | Form に値をセット |
| export-values | Actions | Exporter で値を書き出し |
| reset-values | Actions | Form の値をリセット |
| import-configuration | Actions | Form/Renderer の設定を更新 |
| reset-configuration | Actions | ストレージをクリア、リロード |

---

## データフロー

**フォーム入力 → テンプレート出力**: ユーザー入力 → 「生成」クリック → form.getValues() → 'submit' イベント発火 → main.js リスナー → renderer.render(values) → replaceVariables() で {{変数}} を置換 → 出力表示

**設定インポート**: 「設定」→「読み込み」 → ファイル選択 → readFileAsString() → JSON.parse → GeneratorConfiguration.create() → 'import-configuration' イベント → form/renderer.setConfiguration() + storage.saveConfiguration()

---

## コード変更ガイド

**変更1: 新しいフィールドタイプを追加する**（例: time タイプ）

1. form.js に生成メソッドを追加:
```javascript
createTimeField(field) { const $input = $('<input>').attr('type', 'time').attr('name', field.name).addClass('form-control'); if (field.required) { $input.attr('required', true); } return this.wrapField(field, $input); }
```

2. buildUI() のフィールドタイプ分岐に追加:
```javascript
case 'time': $fieldElement = this.createTimeField(field); break;
```

---

**変更2: テンプレートの変数置換ルールを変更する**（例: 配列の区切り文字を改行に）

renderer.js の replaceVariables() を編集:
```javascript
// 変更前: if (Array.isArray(value)) { value = value.join(','); }
// 変更後: if (Array.isArray(value)) { value = value.join('\n'); }
```

---

**変更3: 新しいテンプレート変数を追加する**（例: 現在の日付 {{TODAY}}）

renderer.js の replaceVariables() を編集:
```javascript
replaceVariables(template, values) { let result = template; const today = new Date().toISOString().split('T')[0]; result = result.replace(/\{\{TODAY\}\}/g, today); /* 既存の処理 */ return result; }
```

---

**変更4: UI のスタイルを変更する**（例: フォームの幅を変更）

index.html のスタイルを編集: 左側 `width: 50%` → `width: 60%`、右側 `width: 50%` → `width: 40%`

---

**変更5: 新しいメニュー項目を追加する**（例: 「コピー」ボタン）

actions.js: `const $copyButton = $('<button>').addClass('dropdown-item').text('コピー').on('click', () => { this.closeDropdown(); this.dispatchEvent('copy-values'); });`

main.js: `actions.addEventListener('copy-values', () => { const values = form.getValues(); navigator.clipboard.writeText(JSON.stringify(values, null, 2)); alert('コピーしました'); });`

---

## スクリプト読み込み順序

index.html での順序（依存関係を考慮）:
1. configuration.js → 2. defaultConfiguration.js → 3. storage.js → 4. exporter.js → 5. form.js → 6. renderer.js → 7. actions.js → 8. main.js

---

## トラブルシューティング

**変更が反映されない**: ブラウザのキャッシュをクリア（Ctrl+Shift+R）、開発者ツールでエラーを確認

**エラー "xxx is not defined"**: スクリプトの読み込み順序が正しくない。依存するクラスや関数が先に読み込まれているか確認

**イベントが発火しない**: `addEventListener` と `dispatchEvent` のイベント名が一致しているか確認
