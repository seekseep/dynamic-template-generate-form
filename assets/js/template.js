/**
 * @typedef {import('./types').DynamicForm} DynamicForm
 * @typedef {import('./types').DynamicTemplate} DynamicTemplate
 */

/**
 * テンプレートコンテンツの {{変数}} を置換
 * @param {string} content
 * @param {Object} formData
 * @param {Object} labelToNameMap - { label: name } のマッピング
 * @returns {string}
 */
function replaceVariables(content, formData, labelToNameMap) {
  let result = content;

  // {{label}} の形式で変数を置換
  result = result.replace(/\{\{(.+?)\}\}/g, (_, key) => {
    // キーがラベル（日本語）の可能性があるので、name に変換
    const fieldName = labelToNameMap[key] || key;
    const value = formData[fieldName];

    // チェックボックスの配列値を処理
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value || '';
  });

  return result;
}

/**
 * テンプレートをレンダリング
 * @param {DynamicForm} dynamicForm
 * @param {DynamicTemplate} dynamicTemplate
 * @param {Object} formData
 * @returns {string}
 */
function renderTemplate(dynamicForm, dynamicTemplate, formData) {
  // label -> name のマッピングを作成
  const labelToNameMap = {};
  dynamicForm.sections.forEach(section => {
    section.fields.forEach(fieldOrArray => {
      // フィールドが配列（ネストされたフィールド）の場合
      const fieldsToProcess = Array.isArray(fieldOrArray) ? fieldOrArray : [fieldOrArray];

      fieldsToProcess.forEach(field => {
        labelToNameMap[field.label] = field.name;
      });
    });
  });

  let output = '';

  dynamicTemplate.sections.forEach(section => {
    // セクション条件を評価
    const isVisible = evaluateCondition(section.condition, formData);

    if (isVisible) {
      const content = replaceVariables(section.content, formData, labelToNameMap);
      output += content;
    }
  });

  return output;
}

/**
 * 複数のテンプレートをレンダリング
 * @param {DynamicForm} dynamicForm
 * @param {Array<DynamicTemplate>} dynamicTemplates
 * @param {Object} formData
 * @returns {Object} { [label]: output }
 */
function renderTemplates(dynamicForm, dynamicTemplates, formData) {
  const results = {};

  dynamicTemplates.forEach(template => {
    results[template.label] = renderTemplate(dynamicForm, template, formData);
  });

  return results;
}
