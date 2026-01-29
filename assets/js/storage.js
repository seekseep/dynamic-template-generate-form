/**
 * 動的ストレージ管理クラス
 */
class DynamicStorage {
  static STORAGE_KEYS = {
    CONFIG: 'talk-to-doc-config'
  };

  /**
   * ストレージインスタンスを作成
   * @returns {DynamicStorage}
   */
  static create() {
    return new DynamicStorage();
  }

  /**
   * 設定全体を localStorage から読み込む
   * @returns {Object|null} config - { form: {...}, templates: [...] }
   */
  loadConfiguration() {
    try {
      const stored = localStorage.getItem(DynamicStorage.STORAGE_KEYS.CONFIG);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load config:', e);
    }
    return null;
  }

  /**
   * 設定全体を localStorage に保存
   * @param {Object} config - { form: {...}, templates: [...] }
   */
  saveConfiguration(config) {
    try {
      localStorage.setItem(DynamicStorage.STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  }

  /**
   * 設定をリセット（localStorage から削除）
   */
  clearConfiguration() {
    localStorage.removeItem(DynamicStorage.STORAGE_KEYS.CONFIG);
  }

  /**
   * JSON ファイルから設定をインポート
   * @param {File} file - インポートするファイル
   * @returns {Promise<Object>} パースされた設定 { form: {...}, templates: [...] }
   */
  importConfiguration(file) {
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
            this.saveConfiguration(config);
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
}

// 後方互換性のための関数ラッパー
function loadConfig() {
  const storage = DynamicStorage.create();
  return storage.loadConfiguration() || DynamicDefaultConfig.get();
}

function saveConfig(config) {
  const storage = DynamicStorage.create();
  storage.saveConfiguration(config);
}

function resetConfig() {
  const storage = DynamicStorage.create();
  storage.clearConfiguration();
}

function importConfig(file) {
  const storage = DynamicStorage.create();
  return storage.importConfiguration(file);
}
