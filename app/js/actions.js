class DynamicFormActions extends EventTarget {
  constructor() {
    super();
    this.element = this.createNavbar();
  }

  createContainer() {
    return $('<nav>').addClass('navbar sticky-top bg-light px-4 py-2 gap-2 justify-content-start');
  }

  async readFileAsString(input) {
    return new Promise((resolve, reject) => {
      const file = input.files[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsText(file);
    });
  }

  closeDropdown($dropdown) {
    $dropdown.find('.dropdown-menu').removeClass('show');
  }

  createConfigurationMenu() {
    const $dropdown = $('<div>').addClass('dropdown');
    const $button = $('<button>')
      .addClass('btn btn-outline-secondary btn-sm dropdown-toggle')
      .attr('type', 'button')
      .attr('data-bs-toggle', 'dropdown')
      .text('設定');

    const $menu = $('<ul>').addClass('dropdown-menu');

    // 読み込みボタンと隠しinput
    const $importLabel = $('<label>')
      .addClass('dropdown-item cursor-pointer')
      .attr('for', 'importConfigFile')
      .text('読み込む');
    const $importInput = $('<input>')
      .attr('type', 'file')
      .attr('id', 'importConfigFile')
      .attr('accept', '.json')
      .addClass('d-none')
      .on('change', async (e) => {
        try {
          const json = await this.readFileAsString(e.target);
          const data = JSON.parse(json);
          const configuration = GeneratorConfiguration.create(data);
          this.dispatchEvent(new CustomEvent('import-configuration', { detail: configuration }));
        } catch (error) {
          alert('設定ファイルの解析に失敗しました: ' + error.message);
        }
        this.closeDropdown($dropdown);
      });

    // 初期化ボタン
    const $resetButton = $('<button>')
      .addClass('dropdown-item text-danger')
      .attr('type', 'button')
      .attr('id', 'resetConfigurationButton')
      .text('初期化')
      .click(() => {
        if (confirm('設定をデフォルトにリセットしますか？')) {
          this.dispatchEvent(new CustomEvent('reset-configuration'));
        }
        this.closeDropdown($dropdown);
      });

    $menu.append($('<li>').append($importInput, $importLabel), $('<li>').append($resetButton));
    $dropdown.append($button, $menu);

    return $dropdown;
  }

  createValuesMenu() {
    const $dropdown = $('<div>').addClass('dropdown');
    const $button = $('<button>')
      .addClass('btn btn-outline-primary btn-sm dropdown-toggle')
      .attr('type', 'button')
      .attr('data-bs-toggle', 'dropdown')
      .text('入力内容');

    const $menu = $('<ul>').addClass('dropdown-menu');

    // 読み込みボタンと隠しinput
    const $importLabel = $('<label>')
      .addClass('dropdown-item cursor-pointer')
      .attr('for', 'importValuesFile')
      .text('読み込む');
    const $importInput = $('<input>')
      .attr('type', 'file')
      .attr('id', 'importValuesFile')
      .attr('accept', '.json')
      .addClass('d-none')
      .on('change', async (e) => {
        try {
          const content = await this.readFileAsString(e.target);
          const values = JSON.parse(content);
          console.log(values);
          if (typeof values !== 'object' || Array.isArray(values)) {
            throw new Error('Invalid values format');
          }
          this.dispatchEvent(new CustomEvent('import-values', { detail: values }));
        } catch (error) {
          alert('フォーム値の解析に失敗しました: ' + error.message);
        }
        this.closeDropdown($dropdown);
      });

    // 書き出しボタン
    const $exportButton = $('<button>')
      .addClass('dropdown-item')
      .attr('type', 'button')
      .attr('id', 'exportFormValuesButton')
      .text('書き出す')
      .click(() => {
        this.dispatchEvent(new CustomEvent('export-values'));
        this.closeDropdown($dropdown);
      });

    // リセットボタン
    const $resetButton = $('<button>')
      .addClass('dropdown-item text-danger')
      .attr('type', 'button')
      .attr('id', 'resetInputBtn')
      .text('リセットする')
      .click(() => {
        if (confirm('入力内容をリセットしますか？')) {
          this.dispatchEvent(new CustomEvent('reset-values'));
        }
        this.closeDropdown($dropdown);
      });

    $menu.append(
      $('<li>').append($importInput, $importLabel),
      $('<li>').append($exportButton),
      $('<li>').html('<hr class="dropdown-divider">'),
      $('<li>').append($resetButton)
    );
    $dropdown.append($button, $menu);

    return $dropdown;
  }

  createNavbar() {
    const $nav = this.createContainer();
    $nav.append(this.createConfigurationMenu());
    $nav.append(this.createValuesMenu());
    return $nav[0];
  }
}
