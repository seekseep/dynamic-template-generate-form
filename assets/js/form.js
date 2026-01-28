/**
 * @typedef {import('./types').DynamicForm} DynamicForm
 * @typedef {import('./types').DynamicFormSection} DynamicFormSection
 * @typedef {import('./types').DynamicFormField} DynamicFormField
 * @typedef {import('./types').DynamicFormCondition} DynamicFormCondition
 * @typedef {import('./types').FormState} FormState
 */

/**
 * フォームデータを取得
 * @param {HTMLFormElement} form
 * @returns {Object}
 */
function getFormData(form) {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]];
      }
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }

  return data;
}

/**
 * フォームにデータを設定
 * @param {HTMLFormElement} form
 * @param {Object} data - フォームに設定するデータ
 */
function setFormData(form, data) {
  if (!data || typeof data !== 'object') {
    return;
  }

  // すべての入力要素を取得
  const inputs = form.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    const name = input.name;
    if (!name || !(name in data)) {
      return;
    }

    const value = data[name];

    if (input.type === 'checkbox' || input.type === 'radio') {
      // チェックボックスとラジオボタンの場合
      const isArray = Array.isArray(value);
      const values = isArray ? value : [value];

      if (values.includes(input.value)) {
        input.checked = true;
      } else {
        input.checked = false;
      }
    } else if (input.tagName === 'SELECT') {
      // セレクトボックスの場合
      input.value = value;
    } else {
      // テキスト入力やテキストエリアの場合
      input.value = value;
    }
  });

  // フォーム状態を更新（条件付き表示の更新）
  const formData = getFormData(form);
  const formState = generateFormState(form.dynamicForm, formData);
  applyFormState(formState);
}

/**
 * 条件式を評価
 * @param {DynamicFormCondition | null} condition
 * @param {Object} formData
 * @returns {boolean}
 */
function evaluateCondition(condition, formData) {
  if (!condition) {
    return true;
  }

  if (condition.and) {
    return condition.and.every(expr => {
      const fieldValue = formData[expr.field];
      return fieldValue === expr.value;
    });
  }

  if (condition.or) {
    return condition.or.some(expr => {
      const fieldValue = formData[expr.field];
      return fieldValue === expr.value;
    });
  }

  return true;
}

/**
 * dynamicForm と formData から統一されたフォーム状態を生成
 * @param {DynamicForm} dynamicForm
 * @param {Object} formData
 * @returns {FormState}
 */
function generateFormState(dynamicForm, formData) {
  const state = {};

  dynamicForm.sections.forEach(section => {
    // セクション条件を評価
    const sectionVisible = evaluateCondition(section.condition, formData);

    // セクション状態を記録
    state[section.name] = {
      type: 'section',
      visibility: sectionVisible ? 'visible' : 'invisible'
    };

    // セクション内のフィールド可視性と必須を決定
    section.fields.forEach(fieldOrArray => {
      // フィールドが配列（ネストされたフィールド）の場合
      const fieldsToProcess = Array.isArray(fieldOrArray) ? fieldOrArray : [fieldOrArray];

      fieldsToProcess.forEach(field => {
        let fieldVisible;
        if (!sectionVisible) {
          // セクションが非表示ならフィールドも非表示
          fieldVisible = false;
        } else {
          // セクションが表示なら、フィールド条件を評価
          fieldVisible = evaluateCondition(field.condition, formData);
        }

        // フィールド状態を記録
        state[field.name] = {
          type: 'field',
          visibility: fieldVisible ? 'visible' : 'invisible',
          required: fieldVisible && field.required
        };
      });
    });
  });

  return state;
}

/**
 * フォーム要素の表示/非表示と required 属性を更新
 * @param {FormState} formState
 */
function applyFormState(formState) {
  Object.entries(formState).forEach(([elementName, state]) => {
    const elementId = state.type === 'section' ? `section-${elementName}` : `field-${elementName}`;
    const element = document.getElementById(elementId);
    if (!element) return;

    // 表示/非表示を設定
    element.style.display = state.visibility === 'visible' ? '' : 'none';

    // フィールドの required 属性を設定/削除
    if (state.type === 'field') {
      const inputs = element.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (state.required) {
          input.required = true;
        } else {
          input.removeAttribute('required');
        }
      });
    }
  });
}

/**
 * @param {DynamicForm} dynamicForm
 * @returns {HTMLFormElement}
 */
function setupForm(dynamicForm) {
  const form = document.createElement('form');
  form.id = 'dynamicForm';
  form.className = 'needs-validation';
  form.dynamicForm = dynamicForm; // dynamicForm をフォーム要素に保存

  // セクションを追加
  dynamicForm.sections.forEach(section => {
    const sectionElement = createFormSection(section);
    form.appendChild(sectionElement);
  });

  // 生成ボタンを追加
  const submitButtonDiv = document.createElement('div');
  submitButtonDiv.className = 'form-group mt-4';
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'btn btn-primary';
  submitButton.textContent = '生成';
  submitButtonDiv.appendChild(submitButton);
  form.appendChild(submitButtonDiv);

  // フォーム作成直後に初期表示を設定
  const initialData = getFormData(form);
  const initialFormState = generateFormState(dynamicForm, initialData);
  applyFormState(initialFormState);

  // フォーム内のすべての入力要素に change イベントリスナーを登録
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      const formData = getFormData(form);
      const formState = generateFormState(dynamicForm, formData);
      applyFormState(formState);
    });
  });

  return form;
}

/**
 * @param {DynamicFormSection} section
 */
function createFormSection(section) {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = 'mb-4';
  sectionDiv.id = `section-${section.name}`;

  // セクションタイトル
  const sectionTitle = document.createElement('h5');
  sectionTitle.className = 'mb-3 mt-3';
  sectionTitle.textContent = section.label;
  sectionDiv.appendChild(sectionTitle);

  // フィールドを追加
  section.fields.forEach(fieldOrArray => {
    // フィールドが配列（ネストされたフィールド）の場合
    if (Array.isArray(fieldOrArray)) {
      const fieldsContainer = document.createElement('div');
      fieldsContainer.className = 'row';
      fieldOrArray.forEach(field => {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.className = 'col';
        const fieldElement = createField(field);
        fieldWrapper.appendChild(fieldElement);
        fieldsContainer.appendChild(fieldWrapper);
      });
      sectionDiv.appendChild(fieldsContainer);
    } else {
      // 単一フィールドの場合
      const fieldElement = createField(fieldOrArray);
      sectionDiv.appendChild(fieldElement);
    }
  });

  return sectionDiv;
}

/**
 * @param {DynamicFormField} field
 */
function createField(field) {
  const fieldGroup = document.createElement('div');
  fieldGroup.className = 'mb-3';
  fieldGroup.id = `field-${field.name}`;

  switch (field.type) {
    case 'text':
    case 'email':
    case 'date':
      fieldGroup.appendChild(createInputField(field));
      break;
    case 'textarea':
      fieldGroup.appendChild(createTextareaField(field));
      break;
    case 'select':
      fieldGroup.appendChild(createSelectField(field));
      break;
    case 'radio':
      fieldGroup.appendChild(createRadioField(field));
      break;
    case 'checkbox':
      fieldGroup.appendChild(createCheckboxField(field));
      break;
    default:
      fieldGroup.appendChild(createInputField(field));
  }

  return fieldGroup;
}

/**
 * フィールドラベルを作成
 * @param {DynamicFormField} field
 * @param {boolean} isBlock - d-block クラスを付与するか
 * @returns {HTMLLabelElement}
 */
function createFieldLabel(field, isBlock = false) {
  const label = document.createElement('label');
  label.className = isBlock ? 'form-label d-block' : 'form-label';

  if (!isBlock) {
    label.htmlFor = field.name;
  }

  label.textContent = field.label;

  if (field.required) {
    const requiredSpan = document.createElement('span');
    requiredSpan.className = 'text-danger';
    requiredSpan.textContent = '*';
    label.appendChild(requiredSpan);
  }

  return label;
}

/**
 * 入力要素に required 属性を設定
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} element
 * @param {DynamicFormField} field
 */
function setFieldRequired(element, field) {
  if (field.required) {
    element.required = true;
  }
}

/**
 * @param {DynamicFormField} field
 */
function createInputField(field) {
  const container = document.createDocumentFragment();
  container.appendChild(createFieldLabel(field));

  const input = document.createElement('input');
  input.type = field.type || 'text';
  input.className = 'form-control';
  input.id = field.name;
  input.name = field.name;
  setFieldRequired(input, field);
  container.appendChild(input);

  return container;
}

/**
 * @param {DynamicFormField} field
 */
function createTextareaField(field) {
  const container = document.createDocumentFragment();
  container.appendChild(createFieldLabel(field));

  const textarea = document.createElement('textarea');
  textarea.className = 'form-control';
  textarea.id = field.name;
  textarea.name = field.name;
  textarea.rows = 4;
  setFieldRequired(textarea, field);
  container.appendChild(textarea);

  return container;
}

/**
 * @param {DynamicFormField} field
 */
function createSelectField(field) {
  const container = document.createDocumentFragment();
  container.appendChild(createFieldLabel(field));

  const select = document.createElement('select');
  select.className = 'form-select';
  select.id = field.name;
  select.name = field.name;
  setFieldRequired(select, field);

  // オプションを追加
  if (field.options && field.options.length > 0) {
    field.options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      select.appendChild(optionElement);
    });
  }

  container.appendChild(select);
  return container;
}

/**
 * @param {DynamicFormField} field
 */
function createRadioField(field) {
  const container = document.createDocumentFragment();
  container.appendChild(createFieldLabel(field, true));

  // オプションを追加
  if (field.options && field.options.length > 0) {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'btn-group';
    buttonGroup.setAttribute('role', 'group');

    field.options.forEach(option => {
      const input = document.createElement('input');
      input.type = 'radio';
      input.className = 'btn-check';
      input.id = `${field.name}_${option.value}`;
      input.name = field.name;
      input.value = option.value;
      setFieldRequired(input, field);

      const optionLabel = document.createElement('label');
      optionLabel.className = 'btn btn-outline-primary';
      optionLabel.htmlFor = `${field.name}_${option.value}`;
      optionLabel.textContent = option.label;

      buttonGroup.appendChild(input);
      buttonGroup.appendChild(optionLabel);
    });

    container.appendChild(buttonGroup);
  }

  return container;
}

/**
 * @param {DynamicFormField} field
 */
function createCheckboxField(field) {
  const container = document.createDocumentFragment();
  container.appendChild(createFieldLabel(field, true));

  // オプションを追加
  if (field.options && field.options.length > 0) {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'btn-group';
    buttonGroup.setAttribute('role', 'group');

    field.options.forEach(option => {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'btn-check';
      input.id = `${field.name}_${option.value}`;
      input.name = field.name;
      input.value = option.value;
      setFieldRequired(input, field);

      const optionLabel = document.createElement('label');
      optionLabel.className = 'btn btn-outline-primary';
      optionLabel.htmlFor = `${field.name}_${option.value}`;
      optionLabel.textContent = option.label;

      buttonGroup.appendChild(input);
      buttonGroup.appendChild(optionLabel);
    });

    container.appendChild(buttonGroup);
  }

  return container;
}
