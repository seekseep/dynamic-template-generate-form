/**
 * 動的エクスポーター管理クラス
 */
class DynamicExporter {
  /**
   * エクスポーターインスタンスを作成
   * @returns {DynamicExporter}
   */
  static create() {
    return new DynamicExporter();
  }

  /**
   * フォーム値をJSONファイルとしてダウンロード
   * @param {Object} values - エクスポートするフォーム値
   */
  exportValues(values) {
    this._downloadJSON('form-values', values);
  }

  /**
   * 設定をJSONファイルとしてダウンロード
   * @param {Object} config - エクスポートする設定
   */
  exportConfiguration(config) {
    this._downloadJSON('config', config);
  }

  /**
   * JSONファイルをダウンロード
   * @private
   * @param {string} filename - ファイル名（拡張子なし）
   * @param {Object} data - ダウンロードするデータ
   */
  _downloadJSON(filename, data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
