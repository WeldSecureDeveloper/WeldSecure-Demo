(function () {
  const globalObject = typeof globalThis !== "undefined" ? globalThis : window;
  if (!globalObject) return;

  const registry = Object.create(null);

  function normalizeName(name) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new Error("WeldModules.define requires a non-empty string name.");
    }
    return name.trim();
  }

  function define(name, factory) {
    const normalized = normalizeName(name);
    if (registry[normalized]) {
      console.warn(`WeldModules: module "${normalized}" is already defined.`);
      return registry[normalized].exports;
    }
    if (typeof factory !== "function") {
      throw new Error(`WeldModules.define("${normalized}") requires a factory function.`);
    }
    registry[normalized] = {
      factory,
      exports: undefined,
      initialized: false
    };
    return undefined;
  }

  function use(name) {
    const normalized = normalizeName(name);
    const entry = registry[normalized];
    if (!entry) {
      throw new Error(`WeldModules: module "${normalized}" has not been defined.`);
    }
    if (!entry.initialized) {
      entry.exports = entry.factory();
      entry.initialized = true;
    }
    return entry.exports;
  }

  function has(name) {
    try {
      const normalized = normalizeName(name);
      return Boolean(registry[normalized]);
    } catch {
      return false;
    }
  }

  function entries() {
    return Object.keys(registry).slice();
  }

  globalObject.WeldModules = globalObject.WeldModules || {
    define,
    use,
    has,
    entries
  };
})();
