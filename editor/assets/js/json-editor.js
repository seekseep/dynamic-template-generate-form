// CodeMirrorインスタンス
let jsonEditor;

/**
 * CodeMirrorを初期化
 */
function initializeCodeMirror() {
  const textarea = document.getElementById('jsonTextarea');

  if (!textarea) {
    console.error('jsonTextarea element not found');
    return;
  }

  try {
    jsonEditor = CodeMirror.fromTextArea(textarea, {
      lineNumbers: true,
      mode: 'application/json',
      theme: 'default',
      indentUnit: 2,
      lineWrapping: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      tabSize: 2,
      indentWithTabs: false,
      styleActiveLine: true,
      highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
      viewportMargin: Infinity
    });

    // 初期化確認
    console.log('CodeMirror initialized successfully');

    // JSONエディター変更時
    jsonEditor.on('change', () => {
      markAsDirty();
      validateAndUpdateJSON();
    });

    // サイズ調整
    setTimeout(() => {
      jsonEditor.refresh();
    }, 100);

    window.addEventListener('resize', () => {
      if (jsonEditor) {
        jsonEditor.refresh();
      }
    });
  } catch (error) {
    console.error('CodeMirror initialization failed:', error);
    alert('CodeMirror initialization failed: ' + error.message);
  }
}

/**
 * JSONを検証して更新
 */
function validateAndUpdateJSON() {
  try {
    const text = jsonEditor.getValue();
    const data = JSON.parse(text);

    // JSONの構造をバリデーション
    if (!validateJSON(data)) {
      showJSONError('Invalid JSON structure: form and template sections are required');
      return;
    }

    updateCurrentData(data);
    updatePreview(data);

    // エラー表示をクリア
    clearJSONErrors();
  } catch (error) {
    showJSONError('JSON Parse Error: ' + error.message);
  }
}

/**
 * JSONエディターを更新
 */
function updateJSONEditor(data) {
  try {
    const json = JSON.stringify(data, null, 2);
    jsonEditor.setValue(json);
  } catch (error) {
    console.error('Error updating JSON editor:', error);
  }
}

/**
 * JSONエラーを表示
 */
function showJSONError(message) {
  console.error('JSON Error:', message);
  // TODO: UIにエラー表示を追加
}

/**
 * JSONエラーをクリア
 */
function clearJSONErrors() {
  // TODO: UIのエラー表示をクリア
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');

  // CodeMirrorが読み込まれているか確認
  if (typeof CodeMirror === 'undefined') {
    console.error('CodeMirror is not loaded. Check CDN links.');
    alert('CodeMirror failed to load. Please check your internet connection and reload the page.');
    return;
  }

  // 少し遅延させて初期化（他のスクリプトの初期化を待つ）
  setTimeout(() => {
    console.log('Initializing CodeMirror...');
    initializeCodeMirror();
  }, 100);
});
