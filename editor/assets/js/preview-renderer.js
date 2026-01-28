/**
 * プレビューを更新
 */
function updatePreview(data) {
  const preview = document.getElementById('preview');

  if (!preview) {
    console.error('preview element not found');
    return;
  }

  try {
    // Form定義のプレビュー
    const formHTML = renderFormPreview(data.form);

    // Template定義のプレビュー
    const templateHTML = renderTemplatePreview(data.template);

    preview.innerHTML = `
      <div class="preview-section">
        <h6 class="mb-3">Form Definition</h6>
        <div class="form-preview">
          ${formHTML}
        </div>
      </div>
      <hr class="my-4">
      <div class="preview-section">
        <h6 class="mb-3">Template Definition</h6>
        <div class="template-preview">
          ${templateHTML}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error updating preview:', error);
    preview.innerHTML = `<div class="alert alert-danger">プレビュー表示エラー: ${error.message}</div>`;
  }
}

/**
 * フォームプレビューをレンダリング
 */
function renderFormPreview(formData) {
  if (!formData || !formData.sections || !Array.isArray(formData.sections)) {
    return '<p class="text-muted">No form data</p>';
  }

  if (formData.sections.length === 0) {
    return '<p class="text-muted">No sections</p>';
  }

  return formData.sections.map((section, sectionIndex) => `
    <div class="preview-section mb-3 border-start ps-3">
      <h6 class="fw-bold mb-2">${escapeHtml(section.label || '')}</h6>
      ${section.condition ? `<small class="text-muted">Condition: ${JSON.stringify(section.condition)}</small>` : ''}
      <div class="fields-preview" style="margin-left: 15px;">
        ${renderFieldsPreview(section.fields || [])}
      </div>
    </div>
  `).join('');
}

/**
 * フィールドプレビューをレンダリング
 */
function renderFieldsPreview(fields) {
  if (!Array.isArray(fields) || fields.length === 0) {
    return '<p class="text-muted small">No fields</p>';
  }

  return fields.map((field, fieldIndex) => {
    // フィールドが配列（複数フィールド横並び）の場合
    if (Array.isArray(field)) {
      return `
        <div class="row row-cols-${Math.min(field.length, 3)} mb-2">
          ${field.map(f => `
            <div class="col">
              <div class="field-item small p-2 bg-light rounded">
                <strong>${escapeHtml(f.label || '')}</strong>
                <br>
                <span class="badge bg-secondary">${escapeHtml(f.type || 'text')}</span>
                ${f.required ? '<span class="badge bg-danger">Required</span>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 単一フィールドの場合
    return `
      <div class="field-item small p-2 mb-2 bg-light rounded">
        <strong>${escapeHtml(field.label || '')}</strong>
        <br>
        <span class="badge bg-secondary">${escapeHtml(field.type || 'text')}</span>
        ${field.required ? '<span class="badge bg-danger">Required</span>' : ''}
        ${field.options && field.options.length > 0 ? `<br><small class="text-muted">Options: ${field.options.length}</small>` : ''}
      </div>
    `;
  }).join('');
}

/**
 * テンプレートプレビューをレンダリング
 */
function renderTemplatePreview(templateData) {
  if (!templateData || !templateData.sections || !Array.isArray(templateData.sections)) {
    return '<p class="text-muted">No template data</p>';
  }

  if (templateData.sections.length === 0) {
    return '<p class="text-muted">No sections</p>';
  }

  return templateData.sections.map((section, sectionIndex) => `
    <div class="preview-section mb-3">
      <h6 class="fw-bold mb-2">${escapeHtml(section.label || '')}</h6>
      ${section.condition ? `<small class="text-muted">Condition: ${JSON.stringify(section.condition)}</small><br>` : ''}
      <pre class="bg-light p-2 rounded small" style="overflow-x: auto; max-height: 200px;">${escapeHtml(section.content || '')}</pre>
    </div>
  `).join('');
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
