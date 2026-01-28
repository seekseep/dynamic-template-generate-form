/**
 * テンプレートビジュアルエディター
 */

/**
 * テンプレートビルダーを初期化
 * @param {Object} templateData - テンプレート定義データ
 * @param {Function} onUpdate - データ更新時のコールバック
 */
function initializeTemplateBuilder(templateData, onUpdate) {
  const container = document.getElementById('templateBuilder');
  if (!container) return;

  container.innerHTML = '';
  container.className = 'template-builder';

  const sectionsContainer = document.createElement('div');
  sectionsContainer.className = 'template-builder-sections';

  // セクションをレンダリング
  if (templateData.sections && Array.isArray(templateData.sections)) {
    templateData.sections.forEach((section, sectionIndex) => {
      const sectionElement = createTemplateBuilderSection(section, sectionIndex, templateData, onUpdate);
      sectionsContainer.appendChild(sectionElement);
    });
  }

  // セクション追加ボタン
  const addSectionBtn = document.createElement('button');
  addSectionBtn.type = 'button';
  addSectionBtn.className = 'btn btn-outline-primary mt-3';
  addSectionBtn.textContent = '+ セクションを追加';
  addSectionBtn.addEventListener('click', () => {
    const newSection = createDefaultTemplateSection();
    newSection.name = `section_${Date.now()}`;
    templateData.sections.push(newSection);
    initializeTemplateBuilder(templateData, onUpdate);
    onUpdate();
  });

  container.appendChild(sectionsContainer);
  container.appendChild(addSectionBtn);
}

/**
 * テンプレートビルダーのセクション要素を作成
 */
function createTemplateBuilderSection(section, sectionIndex, templateData, onUpdate) {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = 'template-builder-section card mb-3';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'card-header d-flex justify-content-between align-items-center';

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'form-control form-control-sm flex-grow-1';
  titleInput.value = section.label || '';
  titleInput.placeholder = 'Section Label';
  titleInput.addEventListener('change', () => {
    section.label = titleInput.value;
    onUpdate();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn btn-danger btn-sm ms-2';
  deleteBtn.textContent = '削除';
  deleteBtn.addEventListener('click', () => {
    templateData.sections.splice(sectionIndex, 1);
    initializeTemplateBuilder(templateData, onUpdate);
    onUpdate();
  });

  headerDiv.appendChild(titleInput);
  headerDiv.appendChild(deleteBtn);

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'card-body';

  // コンテンツエディター
  const contentContainer = document.createElement('div');
  contentContainer.className = 'mb-3';

  const contentLabel = document.createElement('label');
  contentLabel.className = 'form-label';
  contentLabel.htmlFor = `template_content_${sectionIndex}`;
  contentLabel.textContent = 'Template Content:';

  const contentTextarea = document.createElement('textarea');
  contentTextarea.id = `template_content_${sectionIndex}`;
  contentTextarea.className = 'form-control';
  contentTextarea.rows = 6;
  contentTextarea.value = section.content || '';
  contentTextarea.placeholder = 'Enter template content here...\nUse {{fieldName}} for variable substitution';
  contentTextarea.addEventListener('change', () => {
    section.content = contentTextarea.value;
    onUpdate();
  });

  contentContainer.appendChild(contentLabel);
  contentContainer.appendChild(contentTextarea);

  // ヘルプテキスト
  const helpDiv = document.createElement('div');
  helpDiv.className = 'alert alert-info small mt-2';
  helpDiv.innerHTML = '<strong>Hint:</strong> Use {{fieldName}} syntax to insert form field values. For example: {{name}}, {{email}}, etc.';

  bodyDiv.appendChild(contentContainer);
  bodyDiv.appendChild(helpDiv);

  sectionDiv.appendChild(headerDiv);
  sectionDiv.appendChild(bodyDiv);

  return sectionDiv;
}
