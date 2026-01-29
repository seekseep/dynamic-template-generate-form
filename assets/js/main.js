async function main() {
  const storage = new DynamicStorage()
  const configuration = storage.loadConfiguration()

  const exporter = new DynamicExporter()

  const form = new DynamicForm(configuration.form)
  const renderer = new DynamicRenderer(configuration.templates)
  const actions = new DynamicFormActions()

  $("#formContainer").append(form.element)
  $("#rendererContainer").append(renderer.element)
  $("#actionContainer").replaceWith(actions.element)

  form.addEventListener('submit', (values) => {
    renderer.render(configuration.form, values)
  })

  actions.addEventListener('import-values', (values) => {
    form.setValues(values)
  })

  actions.addEventListener('export-values', () => {
    const values = form.getValues()
    exporter.exportValues(values)
  })

  actions.addEventListener('reset-values', () => {
    form.resetValues()
  })

  actions.addEventListener('import-configuration', (configuration) => {
    form.setConfiguration(configuration.form)
    renderer.setConfiguration(configuration.templates)
    storage.saveConfiguration(configuration)
  })

  actions.addEventListener('reset-configuration', () => {
    storage.clearConfiguration()
    location.reload()
  })
}

$(main)
