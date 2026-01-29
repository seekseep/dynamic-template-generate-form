function evaluateCondition(condition, formData) {
  if (!condition) return true;
  if (condition.and) return condition.and.every(expr => formData[expr.field] === expr.value);
  if (condition.or) return condition.or.some(expr => formData[expr.field] === expr.value);
  return true;
}

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

function setFieldRequired(element, field) {
  if (field.required) element.required = true;
}

function createInputField(field) {
  const $input = $('<input>')
    .attr('type', field.type || 'text')
    .addClass('form-control')
    .attr('id', field.name)
    .attr('name', field.name);

  if (field.required) $input.attr('required', 'required');

  return $('<div>').append(createFieldLabel(field), $input)[0].childNodes;
}

function createTextareaField(field) {
  const $textarea = $('<textarea>')
    .addClass('form-control')
    .attr('id', field.name)
    .attr('name', field.name)
    .attr('rows', '4');

  if (field.required) $textarea.attr('required', 'required');

  return $('<div>').append(createFieldLabel(field), $textarea)[0].childNodes;
}

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

class DynamicForm {

  constructor(formConfig) {
    this.config = formConfig;
    this.eventListeners = {};
    this.element = this.buildForm();
  }

  buildForm() {
    const $element = this.element ? $(this.element).empty() : $('<form>');
    $element.attr('id', 'dynamicForm').addClass('needs-validation');

    this.config.sections.forEach(section => {
      $element.append(createFormSection(section));
    });

    const $submitButtonDiv = $('<div>').addClass('form-group mt-4');
    const $submitButton = $('<button>')
      .attr('type', 'submit')
      .addClass('btn btn-primary w-100')
      .text('テキストを生成する');

    $submitButtonDiv.append($submitButton);
    $element.append($submitButtonDiv);

    const form = $element[0];
    form._dynamicFormConfig = this.config;

    const initialData = getFormData(form);
    const initialFormState = generateFormState(this.config, initialData);
    applyFormState(initialFormState);

    $element.off('change input').on('change', 'input, select, textarea', () => {
      const formData = getFormData(form);
      const formState = generateFormState(this.config, formData);
      applyFormState(formState);
      this.emit('change', formData);
    });

    $element.off('submit').on('submit', (e) => {
      e.preventDefault();
      const formData = getFormData(form);
      this.emit('submit', formData);
    });

    return form;
  }

  getValues() {
    return getFormData(this.element);
  }

  setValues(values) {
    setFormData(this.element, values);
    this.emit('change', values);
  }

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
    this.emit('change', formData);
  }

  setConfiguration(config) {
    this.config = config;
    this.buildForm();
  }

  addEventListener(eventType, callback) {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(callback);
  }

  emit(eventType, data) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].forEach(callback => callback(data));
    }
  }
}
