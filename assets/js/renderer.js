function replaceVariables(content, formData, labelToNameMap) {
  let result = content;
  result = result.replace(/\{\{(.+?)\}\}/g, (_, key) => {
    const fieldName = labelToNameMap[key] || key;
    const value = formData[fieldName];
    if (Array.isArray(value)) return value.join(', ');
    return value || '';
  });
  return result;
}

function renderTemplate(formConfig, template, formData) {
  const labelToNameMap = {};
  formConfig.sections.forEach(section => {
    section.fields.forEach(fieldOrArray => {
      const fieldsToProcess = Array.isArray(fieldOrArray) ? fieldOrArray : [fieldOrArray];
      fieldsToProcess.forEach(field => {
        labelToNameMap[field.label] = field.name;
      });
    });
  });

  let output = '';
  template.sections.forEach(section => {
    const isVisible = evaluateCondition(section.condition, formData);
    if (isVisible) {
      const content = replaceVariables(section.content, formData, labelToNameMap);
      output += content;
    }
  });

  return output;
}

function renderTemplates(formConfig, templates, formData) {
  const results = {};
  templates.forEach(template => {
    results[template.label] = renderTemplate(formConfig, template, formData);
  });
  return results;
}

class DynamicRenderer {
  constructor(templates) {
    this.templates = templates;
    this.element = $('<div>').addClass('card d-flex flex-column h-100 overflow-hidden')[0];
    this._buildTabUI();
  }

  /**
   * タブUI を構築
   * @private
   */
  _buildTabUI() {
    const $element = $(this.element).empty();

    const $tabNav = $('<ul>').addClass('nav nav-tabs').attr('role', 'tablist');
    const $tabContent = $('<div>').addClass('tab-content flex-grow-1 overflow-hidden d-flex flex-column').css('flexDirection', 'column');

    this.templates.forEach((template, index) => {
      const tabId = `renderer-tab-${index}`;
      const contentId = `renderer-content-${index}`;

      const $tabButton = $('<button>')
        .addClass(`nav-link ${index === 0 ? 'active' : ''}`)
        .id(tabId)
        .attr('data-bs-toggle', 'tab')
        .attr('data-bs-target', `#${contentId}`)
        .attr('type', 'button')
        .attr('role', 'tab')
        .text(template.label);

      const $tabItem = $('<li>').addClass('nav-item').attr('role', 'presentation').append($tabButton);
      $tabNav.append($tabItem);

      const $pre = $('<pre>')
        .addClass('renderer-output')
        .attr('data-template-index', index)
        .css({ 'white-space': 'pre-wrap', 'word-wrap': 'break-word', 'min-height': '400px', 'margin': '0' });

      const $tabPane = $('<div>')
        .addClass(`tab-pane bg-white fade ${index === 0 ? 'show active' : ''}`)
        .attr('id', contentId)
        .attr('role', 'tabpanel')
        .css({ 'overflow': 'auto', 'flex': '1' })
        .append($pre);

      $tabContent.append($tabPane);
    });

    const $copyButton = $('<button>')
      .attr('id', 'copyButton')
      .addClass('btn btn-primary d-block m-2')
      .text('クリップボードにコピー')
      .prop('disabled', true);

    $element.append($tabNav, $tabContent, $copyButton);
  }

  /**
   * テンプレート設定を更新
   * @param {Array<DynamicTemplate>} templates
   */
  setConfiguration(templates) {
    this.templates = templates;
    this._buildTabUI();
  }

  render(formConfig, formValues) {
    const outputs = renderTemplates(formConfig, this.templates, formValues);

    this.templates.forEach((template, index) => {
      const pre = this.element.querySelector(`pre[data-template-index="${index}"]`);
      if (pre) {
        pre.textContent = outputs[template.label];
      }
    });

    const copyButton = this.element.querySelector('#copyButton');
    if (copyButton) {
      copyButton.disabled = false;
    }
  }

}
