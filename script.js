// КОСТЯ ЭТО МОК ДАННЫЕ
const places = [
  {
    name: "Парк «СемьЯ»",
    category: "park",
    categoryName: "Парк",
    address: "ул. Сююмбике, Нижнекамск",
    description: "Большой ухоженный парк с аллеями, фонтаном и прудом. Отличное место для прогулочных и семейных фото. Утром здесь мало людей — можно спокойно поймать мягкий свет.",
    image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=60",
    coords: [55.6367, 51.8206]
  },
  {
    name: "Набережная Камы",
    category: "water",
    categoryName: "Вода",
    address: "Набережная р. Кама, Нижнекамск",
    description: "Вид на реку, закаты и мост. Идеально для пейзажных и вечерних съёмок. Лучшее время — за час до заката.",
    image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=60",
    coords: [55.6304, 51.7869]
  },
  {
    name: "Соборная мечеть",
    category: "architecture",
    categoryName: "Архитектура",
    address: "пр. Строителей, Нижнекамск",
    description: "Красивая современная мечеть с минаретами. Симметричные ракурсы и вечерняя подсветка. При съёмке стоит соблюдать уважение к месту.",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=60",
    coords: [55.6339, 51.8245]
  },
  {
    name: "Городской пляж",
    category: "water",
    categoryName: "Вода",
    address: "оз. Пионерское, Нижнекамск",
    description: "Песчаный берег и вода. Летние фото, отражения и рассветы. Хорошо для портретов на фоне воды.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=60",
    coords: [55.6188, 51.8003]
  },
  {
    name: "Парк Победы",
    category: "park",
    categoryName: "Парк",
    address: "ул. Корабельная, Нижнекамск",
    description: "Мемориал, аллеи и техника под открытым небом. Хорошо для тематических съёмок и репортажа.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=60",
    coords: [55.6406, 51.8066]
  },
  {
    name: "Лесопарковая зона",
    category: "nature",
    categoryName: "Природа",
    address: "район Красный Ключ, Нижнекамск",
    description: "Сосновый лес, тропинки и естественный свет через кроны. Для портретов и прогулочных фото.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=60",
    coords: [55.6013, 51.7881]
  },
  {
    name: "Дом народного творчества",
    category: "architecture",
    categoryName: "Архитектура",
    address: "пр. Химиков, Нижнекамск",
    description: "Здание с интересным фасадом и площадью рядом. Городская архитектурная съёмка, особенно хорош вечером.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=60",
    coords: [55.6343, 51.8160]
  },
  {
    name: "Сквер у фонтана",
    category: "park",
    categoryName: "Парк",
    address: "пр. Строителей, Нижнекамск",
    description: "Небольшой сквер с фонтаном и лавочками. Уютное место для коротких прогулок и фото. Летом работает фонтан.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=60",
    coords: [55.6357, 51.8216]
  }
];

const cardsContainer = document.getElementById("cards");
const filterButtons = document.querySelectorAll(".filter-btn");
const placesCountEl = document.getElementById("places-count");

// Элементы модального окна
const modal = document.getElementById("modal");
const modalImage = document.getElementById("modal-image");
const modalTag = document.getElementById("modal-tag");
const modalTitle = document.getElementById("modal-title");
const modalAddress = document.getElementById("modal-address");
const modalDescription = document.getElementById("modal-description");
const modalMap = document.getElementById("modal-map");
const modalMapLink = document.getElementById("modal-map-link");

// URL для встроенной карты-виджета Яндекс.Карт
function buildMapEmbedUrl(coords, name) {
  const [lat, lon] = coords;
  const pt = `${lon},${lat},pm2rdm`;
  const ll = `${lon},${lat}`;
  return `https://yandex.ru/map-widget/v1/?ll=${ll}&z=16&pt=${pt}&mode=search&text=${encodeURIComponent(name)}`;
}

// Ссылка на Яндекс.Карты для кнопки «Открыть»
function buildMapLink(coords) {
  const [lat, lon] = coords;
  return `https://yandex.ru/maps/?pt=${lon},${lat}&z=17&l=map`;
}

// Рендер карточек
function renderCards(filter = "all") {
  cardsContainer.innerHTML = "";

  const filtered = filter === "all"
    ? places
    : places.filter(p => p.category === filter);

  if (filtered.length === 0) {
    cardsContainer.innerHTML = "<p style='color:#888;grid-column:1/-1;text-align:center'>Пока ничего нет в этой категории.</p>";
    return;
  }

  filtered.forEach(place => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-image-wrap">
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
    card.addEventListener("click", () => openModal(place));
    cardsContainer.appendChild(card);
  });
}

// Открытие модального окна
function openModal(place) {
  modalImage.src = place.image;
  modalImage.alt = place.name;
  modalTag.textContent = place.categoryName;
  modalTitle.textContent = place.name;
  modalAddress.textContent = place.address;
  modalDescription.textContent = place.description;
  modalMap.src = buildMapEmbedUrl(place.coords, place.name);
  modalMapLink.href = buildMapLink(place.coords);

  modal.classList.add("open");
  document.body.classList.add("modal-open");
}

// Закрытие модального окна
function closeModal() {
  modal.classList.remove("open");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    modalMap.src = "";
  }, 200);
}

// Обработчики закрытия
modal.querySelectorAll("[data-close]").forEach(el => {
  el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

// Фильтры
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderCards(btn.dataset.filter);
  });
});

// Счётчик мест
placesCountEl.textContent = places.length;

// Старт
renderCards();