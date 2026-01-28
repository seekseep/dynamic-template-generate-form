async function main () {
  // localStorage から設定を読み込む（失敗時は config.js がデフォルト）
  const configData = loadConfig() ?? defaultConfig;

  const dynamicForm = createDynamicForm(configData.form)
  const dynamicTemplate = createDynamicTemplate(configData.template)
  const form = setupForm(dynamicForm)

  // フォームを DOM に追加
  const container = document.getElementById('inputFormContainer');
  if (!container) {
    console.error('Container with id "inputFormContainer" not found');
    return;
  }
  container.appendChild(form);

  // テンプレート出力エリア
  const templateOutput = document.getElementById('templateOutput');
  if (!templateOutput) {
    console.error('Element with id "templateOutput" not found');
    return;
  }

  // フォーム送信時（生成ボタン）
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // テンプレートを生成
    const formData = getFormData(form);
    const output = renderTemplate(dynamicForm, dynamicTemplate, formData);
    templateOutput.textContent = output;
  });

  // コピーボタン
  const copyButton = document.getElementById('copyButton');
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      const text = templateOutput.textContent;
      navigator.clipboard.writeText(text).then(() => {
        // フィードバック表示（オプション）
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

  // インポートボタン
  const importFormBtn = document.getElementById('importFormBtn');
  if (importFormBtn) {
    importFormBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        try {
          await importConfig(e.target.files[0]);
          // 設定再構築
          location.reload();
        } catch (error) {
          alert('インポートに失敗しました: ' + error.message);
        }
      };
      input.click();
    });
  }

  // エクスポートボタン
  const exportFormBtn = document.getElementById('exportFormBtn');
  if (exportFormBtn) {
    exportFormBtn.addEventListener('click', () => {
      exportConfig(configData);
    });
  }

  // リセットボタン
  const resetFormBtn = document.getElementById('resetFormBtn');
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      if (confirm('設定をデフォルトにリセットしますか？')) {
        resetConfig();
        location.reload();
      }
    });
  }

  // テンプレート インポートボタン
  const importTemplateBtn = document.getElementById('importTemplateBtn');
  if (importTemplateBtn) {
    importTemplateBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        try {
          await importConfig(e.target.files[0]);
          // 設定再構築
          location.reload();
        } catch (error) {
          alert('インポートに失敗しました: ' + error.message);
        }
      };
      input.click();
    });
  }

  // テンプレート エクスポートボタン
  const exportTemplateBtn = document.getElementById('exportTemplateBtn');
  if (exportTemplateBtn) {
    exportTemplateBtn.addEventListener('click', () => {
      exportConfig(configData);
    });
  }

  // テンプレート リセットボタン
  const resetTemplateBtn = document.getElementById('resetTemplateBtn');
  if (resetTemplateBtn) {
    resetTemplateBtn.addEventListener('click', () => {
      if (confirm('設定をデフォルトにリセットしますか？')) {
        resetConfig();
        location.reload();
      }
    });
  }
}

main()
