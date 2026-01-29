/**
 * メイン初期化関数
 */
async function main() {
  // 1. 設定を読み込む
  const storage = DynamicStorage.create();
  const savedConfig = storage.loadConfiguration();
  const configData = savedConfig || DynamicDefaultConfig.get();
  const dynamicConfiguration = DynamicConfiguration.create(configData);

  // 2. ファクトリーでフォーム設定とテンプレート設定を解析
  const formConfig = DynamicFormFactory.create(dynamicConfiguration.form);
  const templateConfigs = DynamicTemplatesFactory.create(dynamicConfiguration.templates);

  // 3. フォームとレンダラーを作成
  const dynamicForm = DynamicForm.create(formConfig);
  const dynamicRenderer = DynamicRenderer.create(templateConfigs);

  // 4. メニューアクションを作成
  const dynamicFormActions = DynamicFormActions.create();

  // 5. エクスポーターを作成
  const dynamicExporter = DynamicExporter.create();

  // 6. 要素をDOMに挿入
  const formContainer = document.getElementById('formContainer');
  const rendererContainer = document.getElementById('rendererContainer');

  if (!formContainer || !rendererContainer) {
    console.error('Required DOM containers not found');
    return;
  }

  formContainer.appendChild(dynamicForm.element);
  rendererContainer.appendChild(dynamicRenderer.element);

  // 7. ナビゲーションを挿入
  const nav = document.querySelector('nav.navbar');
  if (nav) {
    nav.replaceWith(dynamicFormActions.element);
  }

  // 8. フォーム送信時のハンドラー
  dynamicForm.element.addEventListener('submit', (event) => {
    event.preventDefault();
    const formValues = dynamicForm.getValues();
    dynamicRenderer.render(formConfig, formValues);
  });

  // 9. コピーボタンのハンドラー
  const copyButton = dynamicRenderer.getCopyButton();
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      const activePane = dynamicRenderer.element.querySelector('.tab-pane.active');
      if (!activePane) {
        alert('コピーするテンプレートがありません');
        return;
      }
      const text = activePane.querySelector('pre').textContent;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = copyButton.textContent;
        copyButton.textContent = 'コピーしました!';
        setTimeout(() => {
          copyButton.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error('クリップボードへのコピーに失敗:', err);
      });
    });
  }

  // 10. アクション: フォーム値をインポート
  dynamicFormActions.addEventListener('import-values', (values) => {
    dynamicForm.setValues(values);
  });

  // 11. アクション: フォーム値をエクスポート
  dynamicFormActions.addEventListener('export-values', () => {
    const values = dynamicForm.getValues();
    dynamicExporter.exportValues(values);
  });

  // 12. アクション: フォーム値をリセット
  dynamicFormActions.addEventListener('reset-values', () => {
    dynamicForm.resetValues();
  });

  // 13. アクション: 設定をインポート
  dynamicFormActions.addEventListener('import-configuration', (config) => {
    try {
      // バリデーション
      if (!config.form || !config.templates) {
        throw new Error('Invalid configuration format');
      }

      // 設定を更新
      const newFormConfig = DynamicFormFactory.create(config.form);
      const newTemplateConfigs = DynamicTemplatesFactory.create(config.templates);

      dynamicForm.setConfiguration(newFormConfig);
      dynamicRenderer.setConfiguration(newTemplateConfigs);
      storage.saveConfiguration(config);

      // ローカルストレージも更新
      saveConfig(config);

      alert('設定をインポートしました');
    } catch (error) {
      alert('設定のインポートに失敗しました: ' + error.message);
    }
  });

  // 14. アクション: 設定をリセット
  dynamicFormActions.addEventListener('reset-configuration', () => {
    storage.clearConfiguration();
    location.reload();
  });
}

// ページ読み込み完了後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
