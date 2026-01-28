/**
 * JSONファイルを読み込む
 */
async function loadJSONFile(filepath) {
  try {
    const response = await fetch(filepath);
    if (!response.ok) {
      throw new Error(`Failed to load: ${filepath}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Load error:', error);
    alert(`ファイルの読込に失敗しました: ${filepath}\n${error.message}`);
    return { form: { sections: [] }, template: { sections: [] } };
  }
}

/**
 * JSONをダウンロード
 */
function downloadJSON(data, filename) {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    alert('ダウンロードに失敗しました');
  }
}

/**
 * ドラフトをlocalStorageに保存
 */
function saveDraftToStorage(key, data) {
  try {
    localStorage.setItem(`editor-draft-${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Storage save error:', error);
  }
}

/**
 * ドラフトをlocalStorageから読み込む
 */
function loadDraftFromStorage(key) {
  try {
    const stored = localStorage.getItem(`editor-draft-${key}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Storage load error:', error);
    return null;
  }
}

/**
 * ドラフトをlocalStorageから削除
 */
function removeDraftFromStorage(key) {
  try {
    localStorage.removeItem(`editor-draft-${key}`);
  } catch (error) {
    console.error('Storage remove error:', error);
  }
}
