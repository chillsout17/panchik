// UI: тема, хедер-авторизация, карточки, фильтры, поиск, модалка авторизации.

const UI = (() => {
  const cardsContainer = document.getElementById("cards");
  const filterButtons  = document.querySelectorAll(".filter-btn");
  const placesCountEl  = document.getElementById("places-count");
  const searchInput    = document.getElementById("search-input");
  const authZone       = document.getElementById("auth-zone");

  // Модалка авторизации
  const authModal       = document.getElementById("auth-modal");
  const authForm        = document.getElementById("auth-form");
  const authTitleEl     = document.getElementById("auth-title");
  const authSubEl       = document.getElementById("auth-sub");
  const authNameField   = document.getElementById("field-name");
  const authNameInput   = document.getElementById("auth-name");
  const authEmailInput  = document.getElementById("auth-email");
  const authPassInput   = document.getElementById("auth-password");
  const authErrorEl     = document.getElementById("auth-error");
  const authSubmitBtn   = document.getElementById("auth-submit");
  const authSwitchText  = document.getElementById("auth-switch-text");
  const authSwitchBtn   = document.getElementById("auth-switch-btn");

  let authMode = "login"; // "login" | "register"

  //СОСТОЯНИЕ 
  const state = {
    filter: "all",
    query: ""
  };

  //КАРТОЧКИ 
  function getVisiblePlaces() {
    let list = PLACES.slice();

    if (state.filter === "favorites") {
      list = list.filter(p => Favorites.has(p.id));
    } else if (state.filter !== "all") {
      list = list.filter(p => p.category === state.filter);
    }

    if (state.query.trim()) {
      const q = state.query.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    }

    return list;
  }

  function renderCards() {
    const list = getVisiblePlaces();
    cardsContainer.innerHTML = "";

    if (!list.length) {
      const text = state.filter === "favorites"
        ? "В избранном пока ничего нет. Нажмите ♥ на карточке, чтобы сохранить место."
        : "Ничего не найдено.";
      cardsContainer.innerHTML = `<p class="empty-state" style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px 0">${text}</p>`;
      return;
    }

    list.forEach(place => {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.placeId = place.id;

      const isFav = Favorites.has(place.id);

      card.innerHTML = `
        <div class="card-image-wrap">
          <button class="fav-btn ${isFav ? "is-fav" : ""}" data-fav="${place.id}" aria-label="В избранное">
            ${isFav ? "♥" : "♡"}
          </button>
          <img src="${place.image}" alt="${place.name}" loading="lazy">
        </div>
        <div class="card-body">
          <span class="card-tag">${place.categoryName}</span>
          <h3>${place.name}</h3>
          <p class="address">${place.address}</p>
          <p class="description">${place.description}</p>
          <span class="map-link">Подробнее →</span>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-fav]")) return;
        PlaceModal.open(place.id);
      });

      cardsContainer.appendChild(card);
    });
  }

  function updateFavVisual(placeId) {
    const isFav = Favorites.has(placeId);
    document.querySelectorAll(`[data-fav="${placeId}"]`).forEach(btn => {
      btn.classList.toggle("is-fav", isFav);
      btn.textContent = isFav ? "♥" : "♡";
    });
  }

  //ФИЛЬТРЫ И ПОИСК
  function initFilters() {
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.filter = btn.dataset.filter;
        renderCards();
      });
    });
  }

  function initSearch() {
    let t = null;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.query = e.target.value;
        renderCards();
      }, 120);
    });
  }

  //АВТОРИЗАЦИЯ
  function renderAuthZone() {
    const user = Auth.getCurrentUser();

    if (!user) {
      authZone.innerHTML = `
        <button class="btn-outline" id="open-login">Войти</button>
        <button class="btn-primary" id="open-register">Регистрация</button>
      `;
      document.getElementById("open-login").addEventListener("click", () => openAuthModal("login"));
      document.getElementById("open-register").addEventListener("click", () => openAuthModal("register"));
    } else {
      const initial = (user.name || "?").trim().charAt(0).toUpperCase();
      authZone.innerHTML = `
        <div class="user-chip">
          <div class="user-avatar">${initial}</div>
          <span class="user-name">${escapeHtml(user.name)}</span>
        </div>
        <button class="user-menu-btn" id="logout-btn">Выйти</button>
      `;
      document.getElementById("logout-btn").addEventListener("click", () => {
        Auth.logout();
        // после выхода сбрасываем фильтр избранного
        if (state.filter === "favorites") {
          filterButtons.forEach(b => b.classList.remove("active"));
          document.querySelector('[data-filter="all"]').classList.add("active");
          state.filter = "all";
        }
        renderCards();
        window.dispatchEvent(new CustomEvent("auth:changed"));
      });
    }
  }

  //МОДАЛКА АВТОРИЗАЦИИ
  function openAuthModal(mode) {
    setAuthMode(mode);
    authModal.classList.add("open");
    document.body.classList.add("modal-open");
    setTimeout(() => authEmailInput.focus(), 100);
  }

  function closeAuthModal() {
    authModal.classList.remove("open");
    if (!PlaceModal.isOpen()) {
      document.body.classList.remove("modal-open");
    }
    authForm.reset();
    authErrorEl.textContent = "";
  }

  function setAuthMode(mode) {
    authMode = mode;

    if (mode === "login") {
      authTitleEl.textContent = "Вход";
      authSubEl.textContent = "Войдите, чтобы оставлять отзывы и сохранять места.";
      authNameField.hidden = true;
      authNameInput.required = false;
      authSubmitBtn.textContent = "Войти";
      authPassInput.setAttribute("autocomplete", "current-password");
      authSwitchText.textContent = "Нет аккаунта?";
      authSwitchBtn.textContent = "Зарегистрироваться";
    } else {
      authTitleEl.textContent = "Регистрация";
      authSubEl.textContent = "Создайте аккаунт, чтобы сохранять места и писать отзывы.";
      authNameField.hidden = false;
      authNameInput.required = true;
      authSubmitBtn.textContent = "Создать аккаунт";
      authPassInput.setAttribute("autocomplete", "new-password");
      authSwitchText.textContent = "Уже есть аккаунт?";
      authSwitchBtn.textContent = "Войти";
    }

    authErrorEl.textContent = "";
  }

  function handleAuthSubmit(e) {
    e.preventDefault();
    authErrorEl.textContent = "";

    const payload = {
      name: authNameInput.value,
      email: authEmailInput.value,
      password: authPassInput.value
    };

    const res = authMode === "login"
      ? Auth.login(payload)
      : Auth.register(payload);

    if (!res.ok) {
      authErrorEl.textContent = res.error;
      return;
    }

    closeAuthModal();
    renderAuthZone();
    renderCards();
    window.dispatchEvent(new CustomEvent("auth:changed"));
  }

  function initAuthModal() {
    authModal.querySelectorAll("[data-close-auth]").forEach(el => {
      el.addEventListener("click", closeAuthModal);
    });

    authForm.addEventListener("submit", handleAuthSubmit);

    authSwitchBtn.addEventListener("click", () => {
      setAuthMode(authMode === "login" ? "register" : "login");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && authModal.classList.contains("open")) {
        closeAuthModal();
      }
    });
  }

  //УТИЛИТЫ
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  //ИНИЦИАЛИЗАЦИЯ
  function init() {
    initFilters();
    initSearch();
    initAuthModal();
    renderAuthZone();
    renderCards();

    placesCountEl.textContent = PLACES.length;

    // Реакции на изменения
    Favorites.onChange((e) => {
      updateFavVisual(e.detail.placeId);
      if (state.filter === "favorites") renderCards();
    });

    window.addEventListener("auth:changed", () => {
      renderAuthZone();
      renderCards();
    });

    // Клик по fav-кнопке внутри карточки
    cardsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-fav]");
      if (!btn) return;
      e.stopPropagation();
      Favorites.toggle(btn.dataset.fav);
    });
  }

  return { init };
})();