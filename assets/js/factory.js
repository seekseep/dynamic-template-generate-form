function createDynamicFormConditionExpression (value) {
  return {
    field: value.field || '',
    value: value.value,
  }
}

function createDynamicFormCondition (value) {
  if (typeof value === 'undefined' || value === null) {
    return null
  }

  if (Array.isArray(value)) {
    return {
      and: value.map(createDynamicFormConditionExpression)
    }
  }

  if (Array.isArray(value.and)) {
    return {
      and: value.and.map(createDynamicFormConditionExpression)
    }
  }

  if (Array.isArray(value.or)) {
    return {
      or: value.or.map(createDynamicFormConditionExpression)
    }
  }

  return null
}

function createDynamicFormOption (value) {
  if (typeof value === 'string') {
    return {
      value: value,
      label: value,
    }
  }

  return {
    value: value.value || value.label || '',
    label: value.label || '',
  }
}

function createDynamicFormField (value) {
  return {
    name: value.name || value.label || '',
    label: value.label || value.name || '',
    type: value.type || 'text',
    required: value.required || false,
    options: (value.options || []).map(createDynamicFormOption),
    condition: createDynamicFormCondition(value.condition)
  }
}


function createDynamicFormSection (value) {
  return {
    name: value.name || value.label ||  '',
    label: value.label || '',
    condition: createDynamicFormCondition(value.condition),
    fields: (value.fields || []).map(field => {
      // フィールドが配列（ネストされたフィールド）の場合
      if (Array.isArray(field)) {
        return field.map(createDynamicFormField);
      }
      // 単一フィールドの場合
      return createDynamicFormField(field);
    })
  }
}


function createDynamicForm (value) {
  return {
    sections: (value.sections || []).map(createDynamicFormSection)
  }
}

function createDynamicTemplate (value) {
  return {
    label: value.label || '',
    sections: (value.sections || []).map(createDynamicTemplateSection)
  }
}

function createDynamicTemplateSection (value) {
  return {
    name: value.name || value.label || '',
    label: value.label || '',
    condition: createDynamicFormCondition(value.condition),
    content: value.content || ''
  }
}

function createDynamicTemplates (values) {
  return (values || []).map(createDynamicTemplate)
}
