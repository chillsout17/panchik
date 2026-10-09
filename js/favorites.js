
const Favorites = (() => {
  const EVENT = "favorites:changed";

  function currentKey() {
    const user = Auth.getCurrentUser();
    return "favorites_" + (user ? user.id : "guest");
  }

  function getAll() {
    return Store.get(currentKey(), []);
  }

  function has(placeId) {
    return getAll().includes(placeId);
  }

  function toggle(placeId) {
    const list = getAll();
    const idx = list.indexOf(placeId);
    let added;

    if (idx === -1) {
      list.push(placeId);
      added = true;
    } else {
      list.splice(idx, 1);
      added = false;
    }

    Store.set(currentKey(), list);
    window.dispatchEvent(new CustomEvent(EVENT, {
      detail: { placeId, added }
    }));
    return added;
  }

  function count() {
    return getAll().length;
  }

  function onChange(callback) {
    window.addEventListener(EVENT, callback);
  }

  return { getAll, has, toggle, count, onChange };
})();