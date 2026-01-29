/**
 * @typedef {import('./types').DynamicFormConfig} DynamicFormConfig
 * @typedef {import('./types').DynamicFormSection} DynamicFormSection
 * @typedef {import('./types').DynamicFormField} DynamicFormField
 * @typedef {import('./types').DynamicFormCondition} DynamicFormCondition
 * @typedef {import('./types').FormState} FormState
 */

/**
 * 条件式を評価
 * @param {DynamicFormCondition | null} condition
 * @param {Object} formData
 * @returns {boolean}
 */
function evaluateCondition(condition, formData) {
  if (!condition) return true;
  if (condition.and) return condition.and.every(expr => formData[expr.field] === expr.value);
  if (condition.or) return condition.or.some(expr => formData[expr.field] === expr.value);
  return true;
}

/**
 * フォーム状態を生成
 * @param {DynamicFormConfig} formConfig
 * @param {Object} formData
 * @returns {FormState}
 */
function generateFormState(formConfig, formData) {
  const state = {};

  formConfig.sections.forEach(section => {
    const sectionVisible = evaluateCondition(section.condition, formData);
    state[section.name] = { type: 'section', visibility: sectionVisible ? 'visible' : 'invisible' };

    section.fields.forEach(fieldOrArray => {
      const fieldsToProcess = Array.isArray(fieldOrArray) ? fieldOrArray : [fieldOrArray];
      fieldsToProcess.forEach(field => {
        let fieldVisible = sectionVisible ? evaluateCondition(field.condition, formData) : false;
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
 * フォーム状態を適用
 * @param {FormState} formState
 */
function applyFormState(formState) {
  Object.entries(formState).forEach(([elementName, state]) => {
    const elementId = state.type === 'section' ? `section-${elementName}` : `field-${elementName}`;
    const element = document.getElementById(elementId);
    if (!element) return;

    element.style.display = state.visibility === 'visible' ? '' : 'none';

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
 * フォームデータを取得
 * @param {HTMLFormElement} form
 * @returns {Object}
 */
function getFormData(form) {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      if (!Array.isArray(data[key])) data[key] = [data[key]];
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
 * @param {Object} data
 */
function setFormData(form, data) {
  if (!data || typeof data !== 'object') return;

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const name = input.name;
    if (!name || !(name in data)) return;

    const value = data[name];

    if (input.type === 'checkbox' || input.type === 'radio') {
      const isArray = Array.isArray(value);
      const values = isArray ? value : [value];
      input.checked = values.includes(input.value);
    } else if (input.tagName === 'SELECT') {
      input.value = value;
    } else {
      input.value = value;
    }
  });

  const formData = getFormData(form);
  const formState = generateFormState(form._dynamicFormConfig, formData);
  applyFormState(formState);
}

/**
 * フィールドラベルを作成
 * @param {DynamicFormField} field
 * @param {boolean} isBlock
 * @returns {HTMLLabelElement}
 */
function createFieldLabel(field, isBlock = false) {
  const $label = $('<label>')
    .addClass(isBlock ? 'form-label d-block' : 'form-label')
    .text(field.label);

  if (!isBlock) $label.attr('for', field.name);

  if (field.required) {
    $label.append($('<span>').addClass('text-danger').text('*'));
  }

  return $label[0];
}

/**
 * フィールド作成ヘルパー
 * @param {HTMLElement | HTMLSelectElement | HTMLTextAreaElement} element
 * @param {DynamicFormField} field
 */
function setFieldRequired(element, field) {
  if (field.required) element.required = true;
}

/**
 * 単一入力フィールドを作成
 * @param {DynamicFormField} field
 * @returns {DocumentFragment}
 */
function createInputField(field) {
  const $input = $('<input>')
    .attr('type', field.type || 'text')
    .addClass('form-control')
    .attr('id', field.name)
    .attr('name', field.name);

  if (field.required) $input.attr('required', 'required');

  return $('<div>').append(createFieldLabel(field), $input)[0].childNodes;
}

/**
 * テキストエリアフィールドを作成
 * @param {DynamicFormField} field
 * @returns {DocumentFragment}
 */
function createTextareaField(field) {
  const $textarea = $('<textarea>')
    .addClass('form-control')
    .attr('id', field.name)
    .attr('name', field.name)
    .attr('rows', '4');

  if (field.required) $textarea.attr('required', 'required');

  return $('<div>').append(createFieldLabel(field), $textarea)[0].childNodes;
}

/**
 * セレクトフィールドを作成
 * @param {DynamicFormField} field
 * @returns {DocumentFragment}
 */
function createSelectField(field) {
  const $select = $('<select>')
    .addClass('form-select')
    .attr('id', field.name)
    .attr('name', field.name);

  if (field.required) $select.attr('required', 'required');

  if (field.options && field.options.length > 0) {
    field.options.forEach(option => {
      $select.append($('<option>')
        .attr('value', option.value || option)
        .text(option.label || option)
      );
    });
  }

  return $('<div>').append(createFieldLabel(field), $select)[0].childNodes;
}

/**
 * ラジオボタンフィールドを作成
 * @param {DynamicFormField} field
 * @returns {DocumentFragment}
 */
function createRadioField(field) {
  const $container = $('<div>').append(createFieldLabel(field, true));

  if (field.options && field.options.length > 0) {
    const $buttonGroup = $('<div>').addClass('btn-group').attr('role', 'group');

    field.options.forEach(option => {
      const optionId = `${field.name}_${option.value || option}`;
      const $input = $('<input>')
        .attr('type', 'radio')
        .addClass('btn-check')
        .attr('id', optionId)
        .attr('name', field.name)
        .attr('value', option.value || option);

      if (field.required) $input.attr('required', 'required');

      const $optionLabel = $('<label>')
        .addClass('btn btn-outline-primary')
        .attr('for', optionId)
        .text(option.label || option);

      $buttonGroup.append($input, $optionLabel);
    });

    $container.append($buttonGroup);
  }

  return $container[0].childNodes;
}

/**
 * チェックボックスフィールドを作成
 * @param {DynamicFormField} field
 * @returns {DocumentFragment}
 */
function createCheckboxField(field) {
  const $container = $('<div>').append(createFieldLabel(field, true));

  if (field.options && field.options.length > 0) {
    const $buttonGroup = $('<div>').addClass('btn-group').attr('role', 'group');

    field.options.forEach(option => {
      const optionId = `${field.name}_${option.value || option}`;
      const $input = $('<input>')
        .attr('type', 'checkbox')
        .addClass('btn-check')
        .attr('id', optionId)
        .attr('name', field.name)
        .attr('value', option.value || option);

      if (field.required) $input.attr('required', 'required');

      const $optionLabel = $('<label>')
        .addClass('btn btn-outline-primary')
        .attr('for', optionId)
        .text(option.label || option);

      $buttonGroup.append($input, $optionLabel);
    });

    $container.append($buttonGroup);
  }

  return $container[0].childNodes;
}

/**
 * フィールドを作成
 * @param {DynamicFormField} field
 * @returns {HTMLDivElement}
 */
function createField(field) {
  const $fieldGroup = $('<div>')
    .addClass('mb-3')
    .attr('id', `field-${field.name}`);

  switch (field.type) {
    case 'text':
    case 'email':
    case 'date':
    case 'tel':
      $fieldGroup.append(createInputField(field));
      break;
    case 'textarea':
      $fieldGroup.append(createTextareaField(field));
      break;
    case 'select':
      $fieldGroup.append(createSelectField(field));
      break;
    case 'radio':
      $fieldGroup.append(createRadioField(field));
      break;
    case 'checkbox':
      $fieldGroup.append(createCheckboxField(field));
      break;
    default:
      $fieldGroup.append(createInputField(field));
  }

  return $fieldGroup[0];
}

/**
 * フォームセクションを作成
 * @param {DynamicFormSection} section
 * @returns {HTMLDivElement}
 */
function createFormSection(section) {
  const $sectionDiv = $('<div>')
    .addClass('mb-4')
    .attr('id', `section-${section.name}`);

  const $sectionTitle = $('<h5>')
    .addClass('mb-3 mt-3')
    .text(section.label);

  $sectionDiv.append($sectionTitle);

  section.fields.forEach(fieldOrArray => {
    if (Array.isArray(fieldOrArray)) {
      const $fieldsContainer = $('<div>').addClass('row');
      fieldOrArray.forEach(field => {
        const $fieldWrapper = $('<div>').addClass('col').append(createField(field));
        $fieldsContainer.append($fieldWrapper);
      });
      $sectionDiv.append($fieldsContainer);
    } else {
      $sectionDiv.append(createField(fieldOrArray));
    }
  });

  return $sectionDiv[0];
}

/**
 * 動的フォームクラス
 */
class DynamicForm {
  /**
   * フォームインスタンスを作成
   * @param {DynamicFormConfig} formConfig
   * @returns {DynamicForm}
   */
  static create(formConfig) {
    return new DynamicForm(formConfig);
  }

  constructor(formConfig) {
    this.config = formConfig;
    this.element = this._createFormElement();
    this._eventListeners = {};
  }

  /**
   * フォーム要素を作成
   * @private
   * @returns {HTMLFormElement}
   */
  _createFormElement() {
    const $form = $('<form>')
      .attr('id', 'dynamicForm')
      .addClass('needs-validation');

    this.config.sections.forEach(section => {
      $form.append(createFormSection(section));
    });

    const $submitButtonDiv = $('<div>').addClass('form-group mt-4');
    const $submitButton = $('<button>')
      .attr('type', 'submit')
      .addClass('btn btn-primary w-100')
      .text('テキストを生成する');

    $submitButtonDiv.append($submitButton);
    $form.append($submitButtonDiv);

    const form = $form[0];
    form._dynamicFormConfig = this.config;

    const initialData = getFormData(form);
    const initialFormState = generateFormState(this.config, initialData);
    applyFormState(initialFormState);

    $form.on('change', 'input, select, textarea', () => {
      const formData = getFormData(form);
      const formState = generateFormState(this.config, formData);
      applyFormState(formState);
      this._emit('change', formData);
    });

    return form;
  }

  /**
   * フォーム値を取得
   * @returns {Object}
   */
  getValues() {
    return getFormData(this.element);
  }

  /**
   * フォーム値を設定
   * @param {Object} values
   */
  setValues(values) {
    setFormData(this.element, values);
    this._emit('change', values);
  }

  /**
   * フォーム値をリセット
   */
  resetValues() {
    const inputs = this.element.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });

    const formData = getFormData(this.element);
    const formState = generateFormState(this.config, formData);
    applyFormState(formState);
    this._emit('change', formData);
  }

  /**
   * フォーム設定を更新
   * @param {DynamicFormConfig} config
   */
  setConfiguration(config) {
    this.config = config;
    const $element = $(this.element).empty().attr('id', 'dynamicForm').addClass('needs-validation');

    config.sections.forEach(section => {
      $element.append(createFormSection(section));
    });

    const $submitButtonDiv = $('<div>').addClass('form-group mt-4');
    const $submitButton = $('<button>')
      .attr('type', 'submit')
      .addClass('btn btn-primary w-100')
      .text('テキストを生成する');

    $submitButtonDiv.append($submitButton);
    $element.append($submitButtonDiv);

    this.element._dynamicFormConfig = config;

    const initialData = getFormData(this.element);
    const initialFormState = generateFormState(config, initialData);
    applyFormState(initialFormState);

    $element.off('change').on('change', 'input, select, textarea', () => {
      const formData = getFormData(this.element);
      const formState = generateFormState(config, formData);
      applyFormState(formState);
      this._emit('change', formData);
    });
  }

  /**
   * イベントリスナーを登録
   * @param {string} eventType
   * @param {Function} callback
   */
  addEventListener(eventType, callback) {
    if (!this._eventListeners[eventType]) {
      this._eventListeners[eventType] = [];
    }
    this._eventListeners[eventType].push(callback);
  }

  /**
   * イベントを発火
   * @private
   * @param {string} eventType
   * @param {*} data
   */
  _emit(eventType, data) {
    if (this._eventListeners[eventType]) {
      this._eventListeners[eventType].forEach(callback => callback(data));
    }
  }
}

// 後方互換性のための関数ラッパー
function setupForm(formConfig) {
  return DynamicForm.create(formConfig).element;
}
