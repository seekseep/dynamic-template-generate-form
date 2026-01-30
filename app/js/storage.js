class DynamicStorage {
  static STORAGE_KEYS = {
    CONFIG: 'CONFIGURATION'
  };

  loadConfiguration() {
    try {
      const json = localStorage.getItem(DynamicStorage.STORAGE_KEYS.CONFIG);
      const data = JSON.parse(json);
      const configuration = GeneratorConfiguration.create(data);
      return configuration;
    } catch {
      return defaultConfiguration;
    }
  }

  saveConfiguration(config) {
    localStorage.setItem(DynamicStorage.STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  clearConfiguration() {
    localStorage.removeItem(DynamicStorage.STORAGE_KEYS.CONFIG);
  }
}
