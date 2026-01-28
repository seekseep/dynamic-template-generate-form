// エディター状態管理
const editorState = {
  currentFile: 'contact',
  isDirty: false,
  currentData: { form: {}, template: {} },
  undoStack: [],
  redoStack: []
};

// ファイル定義
const FILES = {
  'contact': '../assets/data/contact.json',
  'order': '../assets/data/order.json',
  'support': '../assets/data/support.json'
};

/**
 * 初期化
 */
async function main() {
  console.log('Editor main.js initialized');

  // ファイルタブの初期化
  setupFileTabs();

  // イベントリスナー設定
  setupEventListeners();

  // CodeMirrorの初期化を待つ
  await new Promise(resolve => {
    let timeoutId;
    const checkInterval = setInterval(() => {
      if (typeof jsonEditor !== 'undefined' && jsonEditor) {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        console.log('CodeMirror is ready');
        resolve();
      }
    }, 100);

    // 2秒後にタイムアウト
    timeoutId = setTimeout(() => {
      clearInterval(checkInterval);
      console.warn('CodeMirror initialization timeout');
      resolve();
    }, 2000);
  });

  // 初期ファイル読み込み
  await loadFile('contact');

  // contactTabをアクティブにする
  document.getElementById('contactTab').classList.add('active');
}

/**
 * ファイルタブのセットアップ
 */
function setupFileTabs() {
  document.getElementById('contactTab').addEventListener('click', (e) => {
    e.preventDefault();
    loadFile('contact');
    updateFileTabUI('contact');
  });

  document.getElementById('orderTab').addEventListener('click', (e) => {
    e.preventDefault();
    loadFile('order');
    updateFileTabUI('order');
  });

  document.getElementById('supportTab').addEventListener('click', (e) => {
    e.preventDefault();
    loadFile('support');
    updateFileTabUI('support');
  });
}

/**
 * ファイルタブUIを更新
 */
function updateFileTabUI(filename) {
  document.getElementById('contactTab').classList.remove('active');
  document.getElementById('orderTab').classList.remove('active');
  document.getElementById('supportTab').classList.remove('active');
  document.getElementById(filename + 'Tab').classList.add('active');
}

/**
 * イベントリスナーセットアップ
 */
function setupEventListeners() {
  document.getElementById('exportBtn').addEventListener('click', exportJSON);
  document.getElementById('formatBtn').addEventListener('click', formatJSON);
  document.getElementById('resetBtn').addEventListener('click', resetFile);

  // JSONエディター変更イベント（json-editor.jsで設定）
  // ここでは、json-editor.jsがjsonEditorの変更イベントをリスンする

  // Visual Editor タブ切り替えイベント
  const visualEditorTab = document.getElementById('visualEditorTab');
  if (visualEditorTab) {
    visualEditorTab.addEventListener('click', () => {
      setTimeout(() => {
        initializeVisualEditors(editorState.currentData);
      }, 50);
    });
  }
}

/**
 * ファイルを読み込む
 */
async function loadFile(filename) {
  if (editorState.isDirty) {
    if (!confirm('編集内容は保存されません。続行しますか？')) {
      return;
    }
  }

  editorState.currentFile = filename;
  const data = await loadJSONFile(FILES[filename]);
  editorState.currentData = data;
  editorState.isDirty = false;
  editorState.undoStack = [];
  editorState.redoStack = [];

  // UIを更新
  if (typeof updateJSONEditor === 'function') {
    updateJSONEditor(data);
  }
  if (typeof updatePreview === 'function') {
    updatePreview(data);
  }
}

/**
 * JSONをエクスポート
 */
function exportJSON() {
  downloadJSON(editorState.currentData, editorState.currentFile);
}

/**
 * JSONをフォーマット
 */
function formatJSON() {
  if (typeof validateAndUpdateJSON === 'function') {
    validateAndUpdateJSON();
  }
}

/**
 * ファイルをリセット
 */
function resetFile() {
  if (confirm('この操作は取り消せません。リセットしますか？')) {
    location.reload();
  }
}

/**
 * エディターが汚れた状態を設定
 */
function markAsDirty() {
  editorState.isDirty = true;
}

/**
 * 現在のJSONデータを取得
 */
function getCurrentData() {
  return editorState.currentData;
}

/**
 * JSONデータを更新
 */
function updateCurrentData(data) {
  editorState.currentData = data;
  editorState.isDirty = true;
}

/**
 * ビジュアルエディターを初期化
 */
function initializeVisualEditors(data) {
  // Form Builder を初期化
  if (typeof initializeFormBuilder === 'function') {
    initializeFormBuilder(data.form, onVisualEditorUpdate);
    document.getElementById('formBuilder').style.display = 'block';
  }

  // Template Builder を初期化
  if (typeof initializeTemplateBuilder === 'function') {
    initializeTemplateBuilder(data.template, onVisualEditorUpdate);
    document.getElementById('templateBuilder').style.display = 'block';
  }
}

/**
 * ビジュアルエディターの更新コールバック
 */
function onVisualEditorUpdate() {
  // JSON エディターを更新
  if (typeof updateJSONEditor === 'function') {
    updateJSONEditor(editorState.currentData);
  }

  // プレビューを更新
  if (typeof updatePreview === 'function') {
    updatePreview(editorState.currentData);
  }

  markAsDirty();
}

// ページロード時に実行
document.addEventListener('DOMContentLoaded', main);
