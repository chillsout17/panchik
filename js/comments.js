
const Comments = (() => {
  const EVENT = "comments:changed";

  function key(placeId) {
    return "comments_" + placeId;
  }

  function getFor(placeId) {
    const list = Store.get(key(placeId), []);
    // Свежие сверху
    return list.slice().sort((a, b) => b.createdAt - a.createdAt);
  }

  function add(placeId, text) {
    const user = Auth.getCurrentUser();
    if (!user) {
      return { ok: false, error: "Нужно войти, чтобы оставить отзыв" };
    }

    text = String(text).trim();
    if (text.length < 3) {
      return { ok: false, error: "Слишком короткий отзыв" };
    }
    if (text.length > 800) {
      return { ok: false, error: "Отзыв слишком длинный (макс. 800 символов)" };
    }

    const list = Store.get(key(placeId), []);
    const comment = {
      id: "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      userId: user.id,
      authorName: user.name,
      text,
      createdAt: Date.now()
    };

    list.push(comment);
    Store.set(key(placeId), list);

    window.dispatchEvent(new CustomEvent(EVENT, {
      detail: { placeId, comment }
    }));

    return { ok: true, comment };
  }

  function remove(placeId, commentId) {
    const user = Auth.getCurrentUser();
    if (!user) return { ok: false, error: "Не авторизован" };

    const list = Store.get(key(placeId), []);
    const idx = list.findIndex(c => c.id === commentId);
    if (idx === -1) return { ok: false, error: "Отзыв не найден" };

    // Удалять может только автор
    if (list[idx].userId !== user.id) {
      return { ok: false, error: "Можно удалять только свои отзывы" };
    }

    list.splice(idx, 1);
    Store.set(key(placeId), list);

    window.dispatchEvent(new CustomEvent(EVENT, {
      detail: { placeId, commentId, removed: true }
    }));

    return { ok: true };
  }

  function countFor(placeId) {
    return Store.get(key(placeId), []).length;
  }

  function onChange(callback) {
    window.addEventListener(EVENT, callback);
  }

  return { getFor, add, remove, countFor, onChange };
})();