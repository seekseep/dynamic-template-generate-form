async function main () {
  // localStorage から設定を読み込む（失敗時は config.js がデフォルト）
  const configData = loadConfig() ?? defaultConfig;

  const dynamicForm = createDynamicForm(configData.form)
  const dynamicTemplates = createDynamicTemplates(configData.templates)
  const form = setupForm(dynamicForm)

  // フォームを DOM に追加
  const container = document.getElementById('inputFormContainer');
  if (!container) {
    console.error('Container with id "inputFormContainer" not found');
    return;
  }
  container.appendChild(form);

  // テンプレートタブのセットアップ
  const templateTabs = document.getElementById('templateTabs');
  const templateTabContent = document.getElementById('templateTabContent');
  if (!templateTabs || !templateTabContent) {
    console.error('Template tab elements not found');
    return;
  }

  // タブを作成
  dynamicTemplates.forEach((template, index) => {
    const tabId = `template-tab-${index}`;
    const contentId = `template-content-${index}`;

    // タブボタン
    const tabItem = document.createElement('li');
    tabItem.className = 'nav-item';
    tabItem.setAttribute('role', 'presentation');

    const tabButton = document.createElement('button');
    tabButton.className = `nav-link ${index === 0 ? 'active' : ''}`;
    tabButton.id = tabId;
    tabButton.setAttribute('data-bs-toggle', 'tab');
    tabButton.setAttribute('data-bs-target', `#${contentId}`);
    tabButton.setAttribute('type', 'button');
    tabButton.setAttribute('role', 'tab');
    tabButton.textContent = template.label;

    tabItem.appendChild(tabButton);
    templateTabs.appendChild(tabItem);

    // タブコンテンツ
    const tabPane = document.createElement('div');
    tabPane.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
    tabPane.id = contentId;
    tabPane.setAttribute('role', 'tabpanel');
    tabPane.style.overflow = 'auto';
    tabPane.style.flex = '1';

    const pre = document.createElement('pre');
    pre.style.cssText = 'white-space: pre-wrap; word-wrap: break-word; min-height: 400px; margin: 0;';
    pre.className = 'template-output';
    pre.setAttribute('data-template-index', index);

    tabPane.appendChild(pre);
    templateTabContent.appendChild(tabPane);
  });

  // フォーム送信時（生成ボタン）
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // テンプレートを生成
    const formData = getFormData(form);
    const outputs = renderTemplates(dynamicForm, dynamicTemplates, formData);

    // 各テンプレートの出力をタブに反映
    dynamicTemplates.forEach((template, index) => {
      const pre = document.querySelector(`pre[data-template-index="${index}"]`);
      if (pre) {
        pre.textContent = outputs[template.label];
      }
    });
  });

  // コピーボタン
  const copyButton = document.getElementById('copyButton');
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      // アクティブなタブのテキストをコピー
      const activePane = templateTabContent.querySelector('.tab-pane.active');
      if (!activePane) {
        alert('コピーするテンプレートがありません');
        return;
      }
      const text = activePane.querySelector('pre').textContent;
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

  // データ読込ボタン
  const loadDataBtn = document.getElementById('loadDataBtn');
  if (loadDataBtn) {
    loadDataBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        try {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);
              setFormData(form, data);
            } catch (error) {
              alert('JSONの解析に失敗しました: ' + error.message);
            }
          };
          reader.onerror = () => {
            alert('ファイルの読み込みに失敗しました');
          };
          reader.readAsText(file);
        } catch (error) {
          alert('データの読み込みに失敗しました: ' + error.message);
        }
      };
      input.click();
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
