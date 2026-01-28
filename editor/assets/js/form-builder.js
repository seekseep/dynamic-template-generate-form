/**
 * フォームビジュアルエディター
 */

/**
 * フォームビルダーを初期化
 * @param {Object} formData - フォーム定義データ
 * @param {Function} onUpdate - データ更新時のコールバック
 */
function initializeFormBuilder(formData, onUpdate) {
  const container = document.getElementById('formBuilder');
  if (!container) return;

  container.innerHTML = '';
  container.className = 'form-builder';

  const sectionsContainer = document.createElement('div');
  sectionsContainer.className = 'form-builder-sections';

  // セクションをレンダリング
  if (formData.sections && Array.isArray(formData.sections)) {
    formData.sections.forEach((section, sectionIndex) => {
      const sectionElement = createFormBuilderSection(section, sectionIndex, formData, onUpdate);
      sectionsContainer.appendChild(sectionElement);
    });
  }

  // セクション追加ボタン
  const addSectionBtn = document.createElement('button');
  addSectionBtn.type = 'button';
  addSectionBtn.className = 'btn btn-outline-primary mt-3';
  addSectionBtn.textContent = '+ セクションを追加';
  addSectionBtn.addEventListener('click', () => {
    const newSection = createDefaultSection();
    newSection.name = `section_${Date.now()}`;
    formData.sections.push(newSection);
    initializeFormBuilder(formData, onUpdate);
    onUpdate();
  });

  container.appendChild(sectionsContainer);
  container.appendChild(addSectionBtn);
}

/**
 * フォームビルダーのセクション要素を作成
 */
function createFormBuilderSection(section, sectionIndex, formData, onUpdate) {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = 'form-builder-section card mb-3';

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
    formData.sections.splice(sectionIndex, 1);
    initializeFormBuilder(formData, onUpdate);
    onUpdate();
  });

  headerDiv.appendChild(titleInput);
  headerDiv.appendChild(deleteBtn);

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'card-body';

  // フィールドコンテナ
  const fieldsContainer = document.createElement('div');
  fieldsContainer.className = 'form-builder-fields';

  if (section.fields && Array.isArray(section.fields)) {
    section.fields.forEach((fieldOrArray, fieldIndex) => {
      const fieldsToProcess = Array.isArray(fieldOrArray) ? fieldOrArray : [fieldOrArray];
      const isArray = Array.isArray(fieldOrArray);

      const fieldGroupDiv = document.createElement('div');
      fieldGroupDiv.className = `form-builder-field-group mb-3 p-3 bg-light rounded ${isArray ? 'row' : ''}`;

      fieldsToProcess.forEach((field, fieldInnerIndex) => {
        const fieldDiv = isArray ? document.createElement('div') : fieldGroupDiv;
        if (isArray) {
          fieldDiv.className = 'col form-builder-field-item';
        } else {
          fieldDiv.className = 'form-builder-field-item';
        }

        // フィールドタイプセレクター
        const fieldTypeContainer = document.createElement('div');
        fieldTypeContainer.className = 'mb-2';

        const fieldTypeLabel = document.createElement('label');
        fieldTypeLabel.className = 'form-label small';
        fieldTypeLabel.textContent = 'Type:';

        const fieldTypeSelect = document.createElement('select');
        fieldTypeSelect.className = 'form-select form-select-sm';
        fieldTypeSelect.value = field.type || 'text';
        FIELD_TYPES.forEach(type => {
          const option = document.createElement('option');
          option.value = type;
          option.textContent = type;
          fieldTypeSelect.appendChild(option);
        });
        fieldTypeSelect.addEventListener('change', () => {
          field.type = fieldTypeSelect.value;
          // optionsをクリア（select, radio, checkboxの場合は保持）
          if (!['select', 'radio', 'checkbox'].includes(field.type) && field.options) {
            delete field.options;
          }
          initializeFormBuilder(formData, onUpdate);
          onUpdate();
        });

        fieldTypeContainer.appendChild(fieldTypeLabel);
        fieldTypeContainer.appendChild(fieldTypeSelect);

        // フィールドラベル
        const labelContainer = document.createElement('div');
        labelContainer.className = 'mb-2';

        const labelLabel = document.createElement('label');
        labelLabel.className = 'form-label small';
        labelLabel.textContent = 'Label:';

        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.className = 'form-control form-control-sm';
        labelInput.value = field.label || '';
        labelInput.addEventListener('change', () => {
          field.label = labelInput.value;
          onUpdate();
        });

        labelContainer.appendChild(labelLabel);
        labelContainer.appendChild(labelInput);

        // フィールド名 (name)
        const nameContainer = document.createElement('div');
        nameContainer.className = 'mb-2';

        const nameLabel = document.createElement('label');
        nameLabel.className = 'form-label small';
        nameLabel.textContent = 'Name:';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-control form-control-sm';
        nameInput.value = field.name || '';
        nameInput.placeholder = 'auto-generated if empty';
        nameInput.addEventListener('change', () => {
          if (nameInput.value) {
            field.name = nameInput.value;
          } else {
            delete field.name;
          }
          onUpdate();
        });

        nameContainer.appendChild(nameLabel);
        nameContainer.appendChild(nameInput);

        // Required チェックボックス
        const requiredContainer = document.createElement('div');
        requiredContainer.className = 'form-check mb-2';

        const requiredCheckbox = document.createElement('input');
        requiredCheckbox.type = 'checkbox';
        requiredCheckbox.className = 'form-check-input';
        requiredCheckbox.id = `required_${sectionIndex}_${fieldIndex}_${fieldInnerIndex}`;
        requiredCheckbox.checked = field.required || false;
        requiredCheckbox.addEventListener('change', () => {
          field.required = requiredCheckbox.checked;
          onUpdate();
        });

        const requiredLabel = document.createElement('label');
        requiredLabel.className = 'form-check-label small';
        requiredLabel.htmlFor = `required_${sectionIndex}_${fieldIndex}_${fieldInnerIndex}`;
        requiredLabel.textContent = 'Required';

        requiredContainer.appendChild(requiredCheckbox);
        requiredContainer.appendChild(requiredLabel);

        // オプション（select, radio, checkboxの場合）
        let optionsContainer = null;
        if (['select', 'radio', 'checkbox'].includes(field.type)) {
          optionsContainer = document.createElement('div');
          optionsContainer.className = 'mb-2';

          const optionsLabel = document.createElement('label');
          optionsLabel.className = 'form-label small';
          optionsLabel.textContent = 'Options (comma separated):';

          const optionsInput = document.createElement('textarea');
          optionsInput.className = 'form-control form-control-sm';
          optionsInput.rows = 3;
          if (field.options && Array.isArray(field.options)) {
            optionsInput.value = field.options.map(o => (typeof o === 'string' ? o : o.label || o.value || '')).join('\n');
          }
          optionsInput.addEventListener('change', () => {
            const lines = optionsInput.value.split('\n').filter(l => l.trim());
            field.options = lines.map(line => ({
              value: line.trim(),
              label: line.trim()
            }));
            onUpdate();
          });

          optionsContainer.appendChild(optionsLabel);
          optionsContainer.appendChild(optionsInput);
        }

        // フィールド削除ボタン
        const deleteFieldBtn = document.createElement('button');
        deleteFieldBtn.type = 'button';
        deleteFieldBtn.className = 'btn btn-danger btn-sm w-100';
        deleteFieldBtn.textContent = 'フィールド削除';
        deleteFieldBtn.addEventListener('click', () => {
          if (isArray) {
            // 配列内のフィールドを削除
            fieldOrArray.splice(fieldInnerIndex, 1);
            // 配列が空になったら、フィールドリストから削除
            if (fieldOrArray.length === 0) {
              section.fields.splice(fieldIndex, 1);
            }
          } else {
            section.fields.splice(fieldIndex, 1);
          }
          initializeFormBuilder(formData, onUpdate);
          onUpdate();
        });

        fieldDiv.appendChild(fieldTypeContainer);
        fieldDiv.appendChild(labelContainer);
        fieldDiv.appendChild(nameContainer);
        fieldDiv.appendChild(requiredContainer);
        if (optionsContainer) {
          fieldDiv.appendChild(optionsContainer);
        }
        fieldDiv.appendChild(deleteFieldBtn);

        if (isArray) {
          fieldGroupDiv.appendChild(fieldDiv);
        }
      });

      if (!isArray) {
        fieldsContainer.appendChild(fieldGroupDiv);
      } else {
        fieldsContainer.appendChild(fieldGroupDiv);
      }
    });
  }

  // フィールド追加ボタン
  const addFieldBtn = document.createElement('button');
  addFieldBtn.type = 'button';
  addFieldBtn.className = 'btn btn-outline-success btn-sm w-100';
  addFieldBtn.textContent = '+ フィールドを追加';
  addFieldBtn.addEventListener('click', () => {
    const newField = createDefaultField();
    newField.name = `field_${Date.now()}`;
    section.fields.push(newField);
    initializeFormBuilder(formData, onUpdate);
    onUpdate();
  });

  bodyDiv.appendChild(fieldsContainer);
  bodyDiv.appendChild(addFieldBtn);

  sectionDiv.appendChild(headerDiv);
  sectionDiv.appendChild(bodyDiv);

  return sectionDiv;
}
