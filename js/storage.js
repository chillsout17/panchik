// Обёртка над localStorage с безопасным парсингом.
// Все модули работают с хранилищем через этот объект.

const Store = (() => {
  const PREFIX = "nk_photo_";

  function key(name) {
    return PREFIX + name;
  }

  function get(name, fallback = null) {
    try {
      const raw = localStorage.getItem(key(name));
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Store.get error:", name, e);
      return fallback;
    }
  }

  function set(name, value) {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn("Store.set error:", name, e);
      return false;
    }
  }

  function remove(name) {
    localStorage.removeItem(key(name));
  }

  return { get, set, remove };
})();