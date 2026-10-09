// Модальное окно места: открытие, закрытие, рендер содержимого,
// привязка избранного и комментариев.

const PlaceModal = (() => {
  let currentPlaceId = null;

  const modal        = document.getElementById("place-modal");
  const imageEl      = document.getElementById("modal-image");
  const tagEl        = document.getElementById("modal-tag");
  const titleEl      = document.getElementById("modal-title");
  const addressEl    = document.getElementById("modal-address");
  const descEl       = document.getElementById("modal-description");
  const mapEl        = document.getElementById("modal-map");
  const mapLinkEl    = document.getElementById("modal-map-link");
  const favBtn       = document.getElementById("modal-fav");

  // Комментарии
  const commentsListEl  = document.getElementById("comments-list");
  const commentsCountEl = document.getElementById("comments-count");
  const commentInput    = document.getElementById("comment-input");
  const commentSubmit   = document.getElementById("comment-submit");
  const commentHint     = document.getElementById("comment-hint");

  function buildMapEmbedUrl(coords, name) {
    const [lat, lon] = coords;
    const pt = `${lon},${lat},pm2rdm`;
    const ll = `${lon},${lat}`;
    return `https://yandex.ru/map-widget/v1/?ll=${ll}&z=16&pt=${pt}&mode=search&text=${encodeURIComponent(name)}`;
  }

  function buildMapLink(coords) {
    const [lat, lon] = coords;
    return `https://yandex.ru/maps/?pt=${lon},${lat}&z=17&l=map`;
  }

  function open(placeId) {
    const place = findPlaceById(placeId);
    if (!place) return;

    currentPlaceId = placeId;

    imageEl.src = place.image;
    imageEl.alt = place.name;
    tagEl.textContent = place.categoryName;
    titleEl.textContent = place.name;
    addressEl.textContent = place.address;
    descEl.textContent = place.description;
    mapEl.src = buildMapEmbedUrl(place.coords, place.name);
    mapLinkEl.href = buildMapLink(place.coords);

    updateFavBtn();
    renderComments();
    updateCommentFormState();

    modal.classList.add("open");
    document.body.classList.add("modal-open");
  }

  function close() {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
    currentPlaceId = null;
    setTimeout(() => { mapEl.src = ""; }, 200);
  }

  function isOpen() {
    return modal.classList.contains("open");
  }

  function updateFavBtn() {
    if (!currentPlaceId) return;
    const isFav = Favorites.has(currentPlaceId);
    favBtn.classList.toggle("is-fav", isFav);
    favBtn.textContent = isFav ? "♥" : "♡";
  }

  // ===== КОММЕНТАРИИ =====

  function updateCommentFormState() {
    const user = Auth.getCurrentUser();
    if (!user) {
      commentInput.disabled = true;
      commentSubmit.disabled = true;
      commentHint.textContent = "Войдите, чтобы оставить отзыв";
    } else {
      commentInput.disabled = false;
      commentSubmit.disabled = false;
      commentHint.textContent = "Вы вошли как " + user.name;
    }
  }

  function renderComments() {
    if (!currentPlaceId) return;

    const list = Comments.getFor(currentPlaceId);
    const me = Auth.getCurrentUser();

    commentsCountEl.textContent = list.length ? `(${list.length})` : "";

    if (!list.length) {
      commentsListEl.innerHTML = `<li class="comment-empty">Пока нет отзывов. Будьте первым!</li>`;
      return;
    }

    commentsListEl.innerHTML = list.map(c => {
      const isMine = me && me.id === c.userId;
      return `
        <li class="comment" data-comment-id="${c.id}">
          <div class="comment-avatar">${escapeHtml(initial(c.authorName))}</div>
          <div class="comment-body">
            <div class="comment-meta">
              <span class="comment-author">${escapeHtml(c.authorName)}</span>
              <span class="comment-date">${formatDate(c.createdAt)}</span>
              ${isMine ? `<button class="comment-delete" data-delete="${c.id}">удалить</button>` : ""}
            </div>
            <p class="comment-text">${escapeHtml(c.text)}</p>
          </div>
        </li>
      `;
    }).join("");
  }

  function handleSubmit() {
    if (!currentPlaceId) return;

    const text = commentInput.value;
    const res = Comments.add(currentPlaceId, text);

    if (!res.ok) {
      commentHint.textContent = res.error;
      return;
    }

    commentInput.value = "";
    commentHint.textContent = "Отзыв добавлен";
    // renderComments вызовется по событию Comments.onChange
  }

  function handleDelete(commentId) {
    if (!currentPlaceId) return;
    Comments.remove(currentPlaceId, commentId);
  }

  // ===== Утилиты =====

  function initial(name) {
    return (name || "?").trim().charAt(0).toUpperCase() || "?";
  }

  function formatDate(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diffMin = Math.floor((now - d) / 60000);

    if (diffMin < 1) return "только что";
    if (diffMin < 60) return `${diffMin} мин назад`;
    if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)} ч назад`;
    if (diffMin < 60 * 24 * 7) return `${Math.floor(diffMin / 60 / 24)} дн назад`;

    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  //Инициализация обработчиков

  function init() {
    modal.querySelectorAll("[data-close-place]").forEach(el => {
      el.addEventListener("click", close);
    });

    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!currentPlaceId) return;
      Favorites.toggle(currentPlaceId);
      updateFavBtn();
    });

    commentSubmit.addEventListener("click", handleSubmit);

    commentInput.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleSubmit();
      }
    });

    commentsListEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-delete]");
      if (!btn) return;
      handleDelete(btn.dataset.delete);
    });

    // Реакция на изменения
    Comments.onChange(() => renderComments());
    Favorites.onChange(() => updateFavBtn());

    // При смене пользователя перерисуем форму и список
    window.addEventListener("auth:changed", () => {
      updateCommentFormState();
      renderComments();
      updateFavBtn();
    });

    // Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) close();
    });
  }

  return { init, open, close, isOpen };
})();