class DynamicForm extends EventTarget {
  constructor(configuration) {
    super();
    this.configuration = configuration;
    this.element = this.buildUI();
  }

  getItemStateByName() {
    const values = this.getValues();

    return this.configuration.sections.reduce((state, section) => {
      const sectionVisible = section.condition.match(values);
      state[section.name] = {
        type: 'section',
        visible: sectionVisible
      };

      section.fields.forEach(fieldOrArray => {
        const fieldsToProcess = Array.isArray(fieldOrArray) ? fieldOrArray : [fieldOrArray];
        fieldsToProcess.forEach(field => {
          const fieldVisible = sectionVisible ? field.condition.match(values) : false;
          state[field.name] = {
            type: 'field',
            visible: fieldVisible,
            required: fieldVisible && field.required
          };
        });
      });

      return state;
    }, {});
  }

  applyFormItemState(itemStateByName) {
    Object.entries(itemStateByName).forEach(([name, state]) => {
      switch (state.type) {
        case 'section': {
          $(`[data-item='section-${name}']`).toggle(state.visible);
          break;
        }
        case 'field': {
          $(`[data-item='field-${name}']`).toggle(state.visible);
          $(`[data-item='input-${name}']`).attr('required', state.required ? 'required' : null);
          break;
        }
      }
    });
  }

  createFieldLabel(field, isBlock = false) {
    const $label = $('<label>')
      .addClass(isBlock ? 'form-label d-block' : 'form-label')
      .text(field.label);

    if (!isBlock) $label.attr('for', field.name);

    if (field.required) {
      $label.append($('<span>').addClass('text-danger').text('*'));
    }

    return $label;
  }

  createFieldContainer(field) {
    const $container = $('<div>').attr('data-item', `field-${field.name}`);
    $container.append(this.createFieldLabel(field));
    return $container;
  }

  createInputField(field) {
    const $container = this.createFieldContainer(field);
    const $input = $('<input>')
      .attr('type', field.type || 'text')
      .addClass('form-control')
      .attr('id', field.name)
      .attr('name', field.name)
      .attr('data-item', `input-${field.name}`);

    if (field.required) $input.attr('required', 'required');

    $container.append($input);
    return $container;
  }

  createTextareaField(field) {
    const $container = this.createFieldContainer(field);
    const $textarea = $('<textarea>')
      .addClass('form-control')
      .attr('id', field.name)
      .attr('name', field.name)
      .attr('rows', '4')
      .attr('data-item', `input-${field.name}`);

    if (field.required) $textarea.attr('required', 'required');

    $container.append($textarea);
    return $container;
  }

  createSelectField(field) {
    const $container = this.createFieldContainer(field);
    const $select = $('<select>')
      .addClass('form-select')
      .attr('id', field.name)
      .attr('name', field.name)
      .attr('data-item', `input-${field.name}`);

    if (field.required) $select.attr('required', 'required');

    if (field.options && field.options.length > 0) {
      field.options.forEach(option => {
        $select.append($('<option>')
          .attr('value', option.value || option)
          .text(option.label || option)
        );
      });
    }

    $container.append($select);
    return $container;
  }

  createRadioField(field) {
    const $container = $('<div>').attr('data-item', `field-${field.name}`);
    $container.append(this.createFieldLabel(field, true));

    const $buttonGroup = $('<div>').addClass('btn-group').attr('role', 'group');

    field.options.forEach(option => {
      const optionId = `${field.name}_${option.value || option}`;
      const $input = $('<input>')
        .attr('type', 'radio')
        .addClass('btn-check')
        .attr('id', optionId)
        .attr('name', field.name)
        .attr('value', option.value || option)
        .attr('data-item', `input-${field.name}`);

      if (field.required) $input.attr('required', 'required');

      const $optionLabel = $('<label>')
        .addClass('btn btn-outline-primary')
        .attr('for', optionId)
        .text(option.label || option);

      $buttonGroup.append($input, $optionLabel);
    });

    $container.append($buttonGroup);

    return $container
  }

  createCheckboxField(field) {
    const $container = $('<div>').attr('data-item', `field-${field.name}`);
    $container.append(this.createFieldLabel(field, true));

    const $buttonGroup = $('<div>').addClass('btn-group').attr('role', 'group');

    field.options.forEach(option => {
      const optionId = `${field.name}_${option.value || option}`;
      const $input = $('<input>')
        .attr('type', 'checkbox')
        .addClass('btn-check')
        .attr('id', optionId)
        .attr('name', field.name)
        .attr('value', option.value || option)
        .attr('data-item', `input-${field.name}`);

      if (field.required) $input.attr('required', 'required');

      const $optionLabel = $('<label>')
        .addClass('btn btn-outline-primary')
        .attr('for', optionId)
        .text(option.label || option);

      $buttonGroup.append($input, $optionLabel);
    });

    $container.append($buttonGroup);

    return $container
  }

  createField(field) {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'date':
      case 'tel':
        return this.createInputField(field)
        break;
      case 'textarea':
        return this.createTextareaField(field)
        break;
      case 'select':
        return this.createSelectField(field)
        break;
      case 'radio':
        return this.createRadioField(field)
        break;
      case 'checkbox':
        return this.createCheckboxField(field)
        break;
      default:
        return this.createInputField(field)
    }
  }

  createFormSection(section) {
    const $sectionDiv = $('<div>')
      .addClass('mb-4')
      .attr('id', `section-${section.name}`)
      .attr('data-item', `section-${section.name}`);

    const $sectionTitle = $('<h5>')
      .addClass('mb-3 mt-3')
      .text(section.label);

    $sectionDiv.append($sectionTitle);

    section.fields.forEach(fieldOrArray => {
      if (Array.isArray(fieldOrArray)) {
        const $fieldsContainer = $('<div>').addClass('row');
        fieldOrArray.forEach(field => {
          const $fieldWrapper = $('<div>').addClass('col').append(this.createField(field));
          $fieldsContainer.append($fieldWrapper);
        });
        $sectionDiv.append($fieldsContainer);
      } else {
        $sectionDiv.append(this.createField(fieldOrArray));
      }
    });

    return $sectionDiv[0];
  }

  buildUI() {
    const $element = this.element ? $(this.element).empty() : $('<form>');

    $element
      .attr('class', 'pt-2 px-4 pb-4')
      .attr('id', 'dynamicForm').addClass('needs-validation');

    this.configuration.sections.forEach(section => {
      $element.append(this.createFormSection(section));
    });

    const $submitButtonDiv = $('<div>').addClass('form-group mt-4');
    const $submitButton = $('<button>')
      .attr('type', 'submit')
      .addClass('btn btn-primary w-100')
      .text('テキストを生成する');

    $submitButtonDiv.append($submitButton);
    $element.append($submitButtonDiv);

    const form = $element[0];
    form._dynamicFormConfig = this.configuration;

    const initialFormItemState = this.getItemStateByName();
    this.applyFormItemState(initialFormItemState);

    $element.off('change input').on('change', 'input, select, textarea', () => {
      const formData = this.getValues();
      const formState = this.getItemStateByName();
      this.applyFormItemState(formState);
      this.dispatchEvent(new CustomEvent('change', { detail: formData }));
    });

    $element.off('submit').on('submit', (e) => {
      e.preventDefault();
      const formData = this.getValues();
      this.dispatchEvent(new CustomEvent('submit', { detail: formData }));
    });

    return form;
  }

  getValues() {
    const formData = new FormData(this.element);
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

  setValues(values = {}) {
    const inputs = $(this.element).find('input, select, textarea');
    inputs.each((_, input) => {
      const name = input.name;
      if (!name) return;

      const value = values[name];

      // 値が指定されていない場合はリセット
      if (value === undefined) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = false;
        } else {
          input.value = '';
        }
        return;
      }

      if (input.type === 'checkbox' || input.type === 'radio') {
        const isArray = Array.isArray(value);
        const valueList = isArray ? value : [value];
        input.checked = valueList.includes(input.value);
      } else if (input.tagName === 'SELECT') {
        input.value = value;
      } else {
        input.value = value;
      }
    });

    const formState = this.getItemStateByName();
    this.applyFormItemState(formState);

    this.dispatchEvent(new CustomEvent('change', { detail: values }));
  }

  resetValues() {
    this.setValues({});
  }

  setConfiguration(configuration) {
    this.configuration = DynamicFormConfiguration.create(configuration);
    this.buildUI();
  }
}
