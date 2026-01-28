/**
 * フィールドタイプ一覧
 */
const FIELD_TYPES = [
  'text',
  'email',
  'tel',
  'number',
  'date',
  'textarea',
  'select',
  'radio',
  'checkbox'
];

/**
 * JSONをバリデーション
 */
function validateJSON(data) {
  // データがオブジェクトかチェック
  if (typeof data !== 'object' || data === null) {
    console.error('Data is not an object');
    return false;
  }

  // formプロパティが存在するかチェック
  if (!data.form || typeof data.form !== 'object') {
    console.error('Missing or invalid form property');
    return false;
  }

  // templateプロパティが存在するかチェック
  if (!data.template || typeof data.template !== 'object') {
    console.error('Missing or invalid template property');
    return false;
  }

  // form.sectionsが配列かチェック
  if (!Array.isArray(data.form.sections)) {
    console.error('form.sections is not an array');
    return false;
  }

  // template.sectionsが配列かチェック
  if (!Array.isArray(data.template.sections)) {
    console.error('template.sections is not an array');
    return false;
  }

  return true;
}

/**
 * ディープコピー
 */
function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Deep clone error:', error);
    return null;
  }
}

/**
 * フォームセクションからフィールド名の候補リストを生成
 */
function generateFieldOptions(formSections) {
  const options = [];
  const seen = new Set();

  if (!Array.isArray(formSections)) {
    return options;
  }

  formSections.forEach((section) => {
    if (!section.fields || !Array.isArray(section.fields)) {
      return;
    }

    section.fields.forEach((field) => {
      // フィールドが配列（複数フィールド横並び）の場合
      if (Array.isArray(field)) {
        field.forEach((f) => {
          const fieldName = f.name || f.label || '';
          if (fieldName && !seen.has(fieldName)) {
            options.push({ value: fieldName, label: f.label || fieldName });
            seen.add(fieldName);
          }
        });
      } else {
        // 単一フィールドの場合
        const fieldName = field.name || field.label || '';
        if (fieldName && !seen.has(fieldName)) {
          options.push({ value: fieldName, label: field.label || fieldName });
          seen.add(fieldName);
        }
      }
    });
  });

  return options;
}

/**
 * セクションをコピー
 */
function cloneSection(section) {
  return deepClone(section);
}

/**
 * フィールドをコピー
 */
function cloneField(field) {
  return deepClone(field);
}

/**
 * デフォルトフィールドオブジェクトを作成
 */
function createDefaultField() {
  return {
    label: 'New Field',
    type: 'text',
    required: false,
    options: []
  };
}

/**
 * デフォルトセクションオブジェクトを作成
 */
function createDefaultSection() {
  return {
    label: 'New Section',
    condition: null,
    fields: [createDefaultField()]
  };
}

/**
 * デフォルトテンプレートセクションオブジェクトを作成
 */
function createDefaultTemplateSection() {
  return {
    label: 'New Section',
    condition: null,
    content: '【New Section】\nContent here...\n'
  };
}

/**
 * オプション文字列を配列に変換
 */
function parseOptionsString(optionsStr) {
  if (!optionsStr) {
    return [];
  }

  return optionsStr
    .split(',')
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0)
    .map(opt => ({
      value: opt,
      label: opt
    }));
}

/**
 * オプション配列を文字列に変換
 */
function optionsToString(options) {
  if (!Array.isArray(options)) {
    return '';
  }

  return options
    .map(opt => (typeof opt === 'string' ? opt : opt.label || opt.value || ''))
    .join(', ');
}

/**
 * JSONファイル名を検証
 */
function validateFilename(filename) {
  const validNames = ['contact', 'order', 'support'];
  return validNames.includes(filename);
}

/**
 * セクション内の全フィールド名を取得
 */
function getAllFieldNamesFromSection(section) {
  const names = [];

  if (!section.fields || !Array.isArray(section.fields)) {
    return names;
  }

  section.fields.forEach((field) => {
    if (Array.isArray(field)) {
      field.forEach((f) => {
        const name = f.name || f.label || '';
        if (name) names.push(name);
      });
    } else {
      const name = field.name || field.label || '';
      if (name) names.push(name);
    }
  });

  return names;
}

/**
 * セクション内の全フィールド名を取得（重複なし）
 */
function getUniqueFieldNames(formSections) {
  const names = new Set();

  if (!Array.isArray(formSections)) {
    return Array.from(names);
  }

  formSections.forEach((section) => {
    getAllFieldNamesFromSection(section).forEach((name) => {
      names.add(name);
    });
  });

  return Array.from(names);
}
