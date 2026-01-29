class DynamicFormActions {
  constructor() {
    this.eventListeners = {};
    this.element = this.createNavbar();
    this.setupMenuHandlers();
  }

  createNavbar() {
    const $nav = $('<nav>').addClass('navbar sticky-top bg-light px-4 py-2 gap-2 justify-content-start');

    const $settingsDropdown = $('<div>').addClass('dropdown').html(`
      <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
        設定
      </button>
      <ul class="dropdown-menu">
        <li><button class="dropdown-item" id="importConfigurationButton">読み込む</button></li>
        <li><button class="dropdown-item text-danger" id="resetConfigurationButton">初期化</button></li>
      </ul>
    `);

    const $valuesDropdown = $('<div>').addClass('dropdown').html(`
      <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
        入力内容
      </button>
      <ul class="dropdown-menu">
        <li><button class="dropdown-item" id="importFormValuesButton">読み込む</button></li>
        <li><button class="dropdown-item" id="exportFormValuesButton">書き出す</button></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" id="resetInputBtn">リセットする</button></li>
      </ul>
    `);

    $nav.append($settingsDropdown, $valuesDropdown);
    return $nav[0];
  }

  setupMenuHandlers() {
    // 設定: 読み込む
    this.element.querySelector('#importConfigurationButton').addEventListener('click', (e) => {
      e.preventDefault();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        try {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const config = JSON.parse(event.target.result);
              // バリデーション
              if (!config.form || !config.templates) {
                throw new Error('Invalid config format');
              }
              this.emit('import-configuration', config);
            } catch (error) {
              alert('設定ファイルの解析に失敗しました: ' + error.message);
            }
          };
          reader.onerror = () => {
            alert('ファイルの読み込みに失敗しました');
          };
          reader.readAsText(file);
        } catch (error) {
          alert('設定の読み込みに失敗しました: ' + error.message);
        }
      };
      input.click();
    });

    // 設定: 初期化
    this.element.querySelector('#resetConfigurationButton').addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('設定をデフォルトにリセットしますか？')) {
        this.emit('reset-configuration');
      }
    });

    // 入力内容: 読み込む
    this.element.querySelector('#importFormValuesButton').addEventListener('click', (e) => {
      e.preventDefault();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        try {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const values = JSON.parse(event.target.result);
              if (typeof values !== 'object' || Array.isArray(values)) {
                throw new Error('Invalid values format');
              }
              this.emit('import-values', values);
            } catch (error) {
              alert('フォーム値の解析に失敗しました: ' + error.message);
            }
          };
          reader.onerror = () => {
            alert('ファイルの読み込みに失敗しました');
          };
          reader.readAsText(file);
        } catch (error) {
          alert('値の読み込みに失敗しました: ' + error.message);
        }
      };
      input.click();
    });

    // 入力内容: 書き出す
    this.element.querySelector('#exportFormValuesButton').addEventListener('click', (e) => {
      e.preventDefault();
      this.emit('export-values');
    });

    // 入力内容: リセット
    this.element.querySelector('#resetInputBtn').addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('入力内容をリセットしますか？')) {
        this.emit('reset-values');
      }
    });
  }

  addEventListener(actionName, callback) {
    if (!this.eventListeners[actionName]) {
      this.eventListeners[actionName] = [];
    }
    this.eventListeners[actionName].push(callback);
  }

  emit(actionName, data) {
    if (this.eventListeners[actionName]) {
      this.eventListeners[actionName].forEach(callback => callback(data));
    }
  }
}
