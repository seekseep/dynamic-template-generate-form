/**
 * 動的レンダラークラス
 * @property {Array<DynamicTemplate>} templates - テンプレート設定一覧
 * @property {HTMLDivElement} element - レンダラーコンテナ要素
 */
class DynamicRenderer {
  constructor(templates) {
    this.templates = templates;
    this.element = $('<div>').addClass('card d-flex flex-column h-100 overflow-hidden')[0];
    this._buildTabUI();
  }

  /**
   * テンプレートコンテンツの {{変数}} を置換
   * @private
   * @param {string} content - テンプレートコンテンツ
   * @param {Object} formData - フォームデータ
   * @returns {string} 置換後のコンテンツ
   */
  _replaceVariables(content, formData) {
    let result = content;
    result = result.replace(/\{\{(.+?)\}\}/g, (_, key) => {
      const value = formData[key];
      if (Array.isArray(value)) return value.join(', ');
      return value || '';
    });
    return result;
  }

  /**
   * テンプレートをレンダリング
   * @private
   * @param {Object} template - テンプレート
   * @param {Object} formData - フォームデータ
   * @returns {string} レンダリング結果
   */
  _renderTemplate(template, formData) {
    let output = '';
    template.sections.forEach(section => {
      const isVisible = evaluateCondition(section.condition, formData);
      if (isVisible) {
        const content = this._replaceVariables(section.content, formData);
        output += content;
      }
    });

    return output;
  }

  /**
   * 複数のテンプレートをレンダリング
   * @private
   * @param {Array<Object>} templates - テンプレート一覧
   * @param {Object} formData - フォームデータ
   * @returns {Object} レンダリング結果
   */
  _renderTemplates(templates, formData) {
    const results = {};
    templates.forEach(template => {
      results[template.label] = this._renderTemplate(template, formData);
    });
    return results;
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

      const $copyButton = $('<button>')
        .addClass('btn btn-primary btn-sm')
        .attr('type', 'button')
        .text('コピー')
        .css({ 'margin-top': '8px', 'margin-bottom': '8px' });

      const $tabPane = $('<div>')
        .addClass(`tab-pane bg-white fade ${index === 0 ? 'show active' : ''}`)
        .attr('id', contentId)
        .attr('role', 'tabpanel')
        .css({ 'overflow': 'auto', 'flex': '1', 'display': 'flex', 'flex-direction': 'column' })
        .append($pre, $copyButton);

      $tabContent.append($tabPane);
    });

    $element.append($tabNav, $tabContent);

    // コピーボタンのイベントハンドラを設定
    $(this.element).on('click', '.btn.btn-primary.btn-sm', function() {
      const $button = $(this);
      const $tabPane = $button.closest('.tab-pane');
      const $pre = $tabPane.find('.renderer-output');

      if ($pre.length) {
        const text = $pre.text();
        navigator.clipboard.writeText(text).then(() => {
          const originalText = $button.text();
          $button.text('コピーしました！');
          setTimeout(() => {
            $button.text(originalText);
          }, 2000);
        });
      }
    });
  }

  /**
   * テンプレート設定を更新
   * @param {Array<DynamicTemplate>} templates
   */
  setConfiguration(templates) {
    this.templates = templates;
    this._buildTabUI();
  }

  /**
   * テンプレートをレンダリングして表示
   * @param {Object} formValues - フォーム値
   */
  render(formValues) {
    const outputs = this._renderTemplates(this.templates, formValues);

    this.templates.forEach((template, index) => {
      const $pre = $(this.element).find(`pre[data-template-index="${index}"]`);
      if ($pre.length) {
        $pre.text(outputs[template.label]);
      }
    });
  }

}
