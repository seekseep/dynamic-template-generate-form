class DynamicFormConditionExpressionConfiguration {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}

class DynamicFormConditionConfiguration {
  static create(value) {
    if (typeof value === 'undefined' || value === null) {
      return new DynamicFormConditionConfiguration();
    }

    if (Array.isArray(value)) {
      return new DynamicFormConditionConfiguration({
        and: value.map(expr => new DynamicFormConditionExpressionConfiguration(expr.field, expr.value))
      });
    }

    if (value && Array.isArray(value.and)) {
      return new DynamicFormConditionConfiguration({
        and: value.and.map(expr => new DynamicFormConditionExpressionConfiguration(expr.field, expr.value))
      });
    }

    if (value && Array.isArray(value.or)) {
      return new DynamicFormConditionConfiguration({
        or: value.or.map(expr => new DynamicFormConditionExpressionConfiguration(expr.field, expr.value))
      });
    }

    return new DynamicFormConditionConfiguration();
  }

  constructor({ and, or } = {}) {
    this.and = and;
    this.or = or;
  }

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

class DynamicFormOptionConfiguration {
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

  constructor(value, label) {
    this.value = value;
    this.label = label;
  }
}

class DynamicFormFieldConfiguration {
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

  constructor(name, label, type, required, options, condition) {
    this.name = name;
    this.label = label;
    this.type = type;
    this.required = required;
    this.options = options;
    this.condition = condition;
  }
}

class DynamicFormSectionConfiguration {
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

  constructor(name, label, condition, fields) {
    this.name = name;
    this.label = label;
    this.condition = condition;
    this.fields = fields;
  }
}

class DynamicFormConfiguration {
  static create(value) {
    return {
      sections: (value.sections || []).map(section => DynamicFormSectionConfiguration.create(section))
    };
  }
}

class DynamicTemplateSectionConfiguration {
  static create(value) {
    return {
      name: value.name || value.label || '',
      label: value.label || '',
      condition: DynamicFormConditionConfiguration.create(value.condition),
      content: value.content || ''
    };
  }

  constructor(name, label, condition, content) {
    this.name = name;
    this.label = label;
    this.condition = condition;
    this.content = content;
  }
}

class DynamicTemplateConfiguration {
  static create(value) {
    return {
      label: value.label || '名称未設定',
      sections: (value.sections || []).map(section => DynamicTemplateSectionConfiguration.create(section))
    };
  }
}

class GeneratorConfiguration {
  static create(value) {
    return new GeneratorConfiguration(
      DynamicFormConfiguration.create(value.form),
      value.templates.map(template => DynamicTemplateConfiguration.create(template))
    );
  }

  constructor(form, templates) {
    this.form = form;
    this.templates = templates;
  }
}
