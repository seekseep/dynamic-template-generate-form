class DynamicRenderer {
  static COPY_FEEDBACK_DURATION = 2000;

  constructor(templates) {
    this.templates = templates;
    const $root = $('<div>')
      .addClass('root p-4 h-100 overflow-hidden');
    const $card = $('<div>')
      .addClass('card overflow-hidden h-100 d-flex flex-column');
    $root.append($card);
    this.element = $root[0];
    this.cardElement = $card;
    this.buildUI();
  }

  replaceVariables(content, formValues) {
    console.log('replaceVariables called with:', { content, formValues });
    let result = content;
    result = result.replace(/\{\{(.+?)\}\}/g, (_, key) => {
      const trimmedKey = key.trim();
      const value = formValues[trimmedKey];
      console.log(`Replacing {{${key}}} -> trimmedKey: "${trimmedKey}", value:`, value);
      if (Array.isArray(value)) return value.join(', ');
      return value || '';
    });
    console.log('replaceVariables result:', result);
    return result;
  }

  renderTemplate(template, formValues) {
    let output = '';
    template.sections.forEach(section => {
      const isVisible = section.condition.match(formValues);
      if (!isVisible) return
      const content = this.replaceVariables(section.content, formValues);
      output += content;
    });

    return output;
  }

  buildUI() {
    const $element = $(this.cardElement).empty();

    const $tabNav = $('<ul>').addClass('nav nav-tabs').attr('role', 'tablist');
    const $tabContent = $('<div>').addClass('tab-content flex-grow-1 overflow-hidden d-flex flex-column');

    this.templates.forEach((template, index) => {
      const tabId = `renderer-tab-${index}`;
      const contentId = `renderer-content-${index}`;

      const $tabButton = $('<button>')
        .addClass(`nav-link ${index === 0 ? 'active' : ''}`)
        .attr('id', tabId)
        .attr('data-bs-toggle', 'tab')
        .attr('data-bs-target', `#${contentId}`)
        .attr('type', 'button')
        .attr('role', 'tab')
        .text(template.label);

      const $tabItem = $('<li>').addClass('nav-item').attr('role', 'presentation').append($tabButton);
      $tabNav.append($tabItem);

      const $textarea = $('<textarea>')
        .addClass('flex-grow-1 m-0 renderer-output border-0 p-3')
        .attr('data-template-index', index)
        .css({ 'white-space': 'pre-wrap', 'word-wrap': 'break-word', 'min-height': '400px', 'resize': 'none' });

      const $copyButton = $('<button>')
        .addClass('btn btn-primary btn-sm mt-2 mb-2 mx-2')
        .attr('type', 'button')
        .text('コピー')
        .on('click', function() {
          const $button = $(this);
          const $tabPane = $button.closest('.tab-pane');
          const $pre = $tabPane.find('.renderer-output');

          if ($pre.length) {
            const text = $pre.val();
            navigator.clipboard.writeText(text).then(() => {
              const originalText = $button.text();
              $button.text('コピーしました！');
              setTimeout(() => {
                $button.text(originalText);
              }, DynamicRenderer.COPY_FEEDBACK_DURATION);
            });
          }
        });

      const $tabPane = $('<div>')
        .addClass(`tab-pane bg-white overflow-auto d-flex flex-column flex-grow-1 ${index === 0 ? 'show active' : 'd-none'}`)
        .attr('id', contentId)
        .attr('role', 'tabpanel')
        .append($textarea, $copyButton);

      $tabContent.append($tabPane);
    });

    $element.append($tabNav, $tabContent);

    // タブ切替時に表示/非表示を管理
    $(this.element).on('shown.bs.tab', (e) => {
      $tabContent.find('.tab-pane').addClass('d-none').removeClass('d-flex');
      $(e.target.getAttribute('data-bs-target')).removeClass('d-none').addClass('d-flex');
    });
  }

  setConfiguration(templates) {
    this.templates = templates.map(template => DynamicTemplateConfiguration.create(template));
    this.buildUI();
  }

  render(formValues) {
    console.log('render called with formValues:', formValues);
    this.templates.forEach((template, index) => {
      console.log(`Processing template ${index}:`, template);
      const renderedContent = this.renderTemplate(template, formValues);
      console.log(`Rendered content for template ${index}:`, renderedContent);
      $(this.cardElement)
        .find(`textarea[data-template-index="${index}"]`)
        .val(renderedContent);
    });
  }
}
