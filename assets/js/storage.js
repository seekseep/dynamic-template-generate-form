/**
 * localStorage キー定義
 */
const STORAGE_KEYS = {
  CONFIG: 'talk-to-doc-config'
};

/**
 * 設定全体を localStorage から読み込む
 * @returns {Object} config - { form: {...}, templates: [...] }
 */
function loadConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load config:', e);
  }
  return window.config;
}

/**
 * 設定全体を localStorage に保存
 * @param {Object} config - { form: {...}, templates: [...] }
 */
function saveConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config:', e);
  }
}

/**
 * 設定をリセット（localStorage から削除）
 * @returns {Object} デフォルトの config
 */
function resetConfig() {
  localStorage.removeItem(STORAGE_KEYS.CONFIG);
  return window.config;
}

/**
 * 設定を JSON ファイルとしてダウンロード
 * @param {Object} config - 出力する設定オブジェクト
 */
function exportConfig(config) {
  const jsonString = JSON.stringify(config, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `config-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * JSON ファイルから設定をインポート
 * @param {File} file - インポートするファイル
 * @returns {Promise<Object>} パースされた設定 { form: {...}, templates: [...] }
 */
function importConfig(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        // form と templates の両方を持つか確認（後方互換性: template も認可）
        if (config.form && (config.templates || config.template)) {
          // 旧フォーマットの template を templates に変換
          if (config.template && !config.templates) {
            config.templates = [config.template];
            delete config.template;
          }
          saveConfig(config);
          resolve(config);
        } else {
          reject(new Error('Invalid config format: missing form or templates'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
