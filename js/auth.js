const Auth = (() => {
  const USERS_KEY = "users";
  const SESSION_KEY = "session";

  function hashPassword(password) {
    let h = 0;
    for (let i = 0; i < password.length; i++) {
      h = (h << 5) - h + password.charCodeAt(i);
      h |= 0;
    }
    return "h" + Math.abs(h).toString(36);
  }

  function getUsers() {
    return Store.get(USERS_KEY, []);
  }

  function saveUsers(users) {
    Store.set(USERS_KEY, users);
  }

  function normalizeEmail(email) {
    return String(email).trim().toLowerCase();
  }

  function register({ name, email, password }) {
    name = String(name).trim();
    email = normalizeEmail(email);

    if (!name || name.length < 2) {
      return { ok: false, error: "Имя должно быть не короче 2 символов" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Некорректный email" };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: "Пароль — минимум 6 символов" };
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return { ok: false, error: "Пользователь с таким email уже существует" };
    }

    const user = {
      id: "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: Date.now()
    };

    users.push(user);
    saveUsers(users);
    setSession(user.id);

    return { ok: true, user: publicUser(user) };
  }

  function login({ email, password }) {
    email = normalizeEmail(email);

    if (!email || !password) {
      return { ok: false, error: "Заполните email и пароль" };
    }

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return { ok: false, error: "Пользователь не найден" };
    }
    if (user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: "Неверный пароль" };
    }

    setSession(user.id);
    return { ok: true, user: publicUser(user) };
  }

  function logout() {
    Store.remove(SESSION_KEY);
  }

  function setSession(userId) {
    Store.set(SESSION_KEY, { userId, at: Date.now() });
  }

  function getCurrentUser() {
    const session = Store.get(SESSION_KEY);
    if (!session || !session.userId) return null;
    const user = getUsers().find(u => u.id === session.userId);
    return user ? publicUser(user) : null;
  }

  function publicUser(user) {
    return { id: user.id, name: user.name, email: user.email };
  }

  return { register, login, logout, getCurrentUser };
})();