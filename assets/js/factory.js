/**
 * 動的フォーム条件式設定クラス
 */
class DynamicFormConditionExpressionConfiguration {
  /**
   * @param {string} name - フィールド名
   * @param {*} value - 比較値
   */
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}

/**
 * 動的フォーム条件設定クラス
 */
class DynamicFormConditionConfiguration {
  /**
   * 条件設定インスタンスを作成
   * @param {Object|Array|null} value - 条件設定データ
   * @returns {Object|null} 条件設定オブジェクト
   */
  static create(value) {
    if (typeof value === 'undefined' || value === null) {
      return null;
    }

    if (Array.isArray(value)) {
      return {
        and: value.map(expr => new DynamicFormConditionExpressionConfiguration(expr.field, expr.value))
      };
    }

    if (value && Array.isArray(value.and)) {
      return {
        and: value.and.map(expr => new DynamicFormConditionExpressionConfiguration(expr.field, expr.value))
      };
    }

    if (value && Array.isArray(value.or)) {
      return {
        or: value.or.map(expr => new DynamicFormConditionExpressionConfiguration(expr.field, expr.value))
      };
    }

    return null;
  }

  /**
   * @param {Array<DynamicFormConditionExpressionConfiguration>} and - AND条件
   * @param {Array<DynamicFormConditionExpressionConfiguration>} or - OR条件
   */
  constructor(and, or) {
    this.and = and;
    this.or = or;
  }

  /**
   * フォームデータが条件にマッチするか判定
   * @param {Object} formData - フォームデータ
   * @returns {boolean} マッチ結果
   */
  match(formData) {
    if (this.and) {
      return this.and.every(expr => formData[expr.name] === expr.value);
    }
    if (this.or) {
      return this.or.some(expr => formData[expr.name] === expr.value);
    }
    return true;
  }
}

/**
 * 動的フォームオプション設定クラス
 */
class DynamicFormOptionConfiguration {
  /**
   * オプション設定インスタンスを作成
   * @param {Object|string} value - オプション設定データ
   * @returns {Object} オプション設定オブジェクト
   */
  static create(value) {
    if (typeof value === 'string') {
      return {
        value: value,
        label: value,
      };
    }

    return {
      value: value.value || value.label || '',
      label: value.label || '',
    };
  }

  /**
   * @param {string} value - オプション値
   * @param {string} label - オプションラベル
   */
  constructor(value, label) {
    this.value = value;
    this.label = label;
  }
}

/**
 * 動的フォームフィールド設定クラス
 */
class DynamicFormFieldConfiguration {
  /**
   * フィールド設定インスタンスを作成
   * @param {Object} value - フィールド設定データ
   * @returns {Object} フィールド設定オブジェクト
   */
  static create(value) {
    return {
      name: value.name || value.label || '',
      label: value.label || value.name || '',
      type: value.type || 'text',
      required: value.required || false,
      options: (value.options || []).map(opt => DynamicFormOptionConfiguration.create(opt)),
      condition: DynamicFormConditionConfiguration.create(value.condition)
    };
  }

  /**
   * @param {string} name - フィールド名
   * @param {string} label - フィールドラベル
   * @param {string} type - フィールド型（text, email, select等）
   * @param {boolean} required - 必須フラグ
   * @param {Array<Object>} options - オプション一覧
   * @param {DynamicFormConditionConfiguration} condition - 表示条件
   */
  constructor(name, label, type, required, options, condition) {
    this.name = name;
    this.label = label;
    this.type = type;
    this.required = required;
    this.options = options;
    this.condition = condition;
  }
}

/**
 * 動的フォームセクション設定クラス
 */
class DynamicFormSectionConfiguration {
  /**
   * セクション設定インスタンスを作成
   * @param {Object} value - セクション設定データ
   * @returns {DynamicFormSectionConfiguration} セクション設定オブジェクト
   */
  static create(value) {
    return {
      name: value.name || value.label || '',
      label: value.label || '',
      condition: DynamicFormConditionConfiguration.create(value.condition),
      fields: (value.fields || []).map(field => {
        if (Array.isArray(field)) {
          return field.map(f => DynamicFormFieldConfiguration.create(f));
        }
        return DynamicFormFieldConfiguration.create(field);
      })
    };
  }

  /**
   * @param {string} name - セクション名
   * @param {string} label - セクションラベル
   * @param {DynamicFormConditionConfiguration} condition - 表示条件
   * @param {Array<DynamicFormFieldConfiguration>} fields - フィールド一覧
   */
  constructor(name, label, condition, fields) {
    this.name = name;
    this.label = label;
    this.condition = condition;
    this.fields = fields;
  }
}

/**
 * 動的フォーム設定クラス
 */
class DynamicFormConfiguration {
  /**
   * フォーム設定インスタンスを作成
   * @param {Object} value - フォーム設定データ
   * @returns {Object} フォーム設定オブジェクト
   */
  static create(value) {
    return {
      sections: (value.sections || []).map(section => DynamicFormSectionConfiguration.create(section))
    };
  }
}

/**
 * 動的テンプレートセクション設定クラス
 */
class DynamicTemplateSectionConfiguration {
  /**
   * テンプレートセクション設定インスタンスを作成
   * @param {Object} value - テンプレートセクション設定データ
   * @returns {Object} テンプレートセクション設定オブジェクト
   */
  static create(value) {
    return {
      name: value.name || value.label || '',
      label: value.label || '',
      condition: DynamicFormConditionConfiguration.create(value.condition),
      content: value.content || ''
    };
  }

  /**
   * @param {string} name - セクション名
   * @param {string} label - セクションラベル
   * @param {DynamicFormConditionConfiguration} condition - 表示条件
   * @param {string} content - テンプレートコンテンツ
   */
  constructor(name, label, condition, content) {
    this.name = name;
    this.label = label;
    this.condition = condition;
    this.content = content;
  }
}

/**
 * 動的テンプレート設定クラス
 */
class DynamicTemplateConfiguration {
  /**
   * テンプレート設定インスタンスを作成
   * @param {Object} value - テンプレート設定データ
   * @returns {Object} テンプレート設定オブジェクト
   */
  static create(value) {
    return {
      label: value.label || '名称未設定',
      sections: (value.sections || []).map(section => DynamicTemplateSectionConfiguration.create(section))
    };
  }
}

/**
 * ジェネレーター設定クラス
 */
class GeneratorConfiguration {
  /**
   * ジェネレーター設定インスタンスを作成
   * @param {Object} value - ジェネレーター設定データ
   * @returns {GeneratorConfiguration} ジェネレーター設定インスタンス
   */
  static create(value) {
    return new GeneratorConfiguration(
      DynamicFormConfiguration.create(value.form),
      value.templates.map(template => DynamicTemplateConfiguration.create(template))
    );
  }

  /**
   * @param {Object} form - フォーム設定
   * @param {Array<Object>} templates - テンプレート設定一覧
   */
  constructor(form, templates) {
    this.form = form;
    this.templates = templates;
  }
}
