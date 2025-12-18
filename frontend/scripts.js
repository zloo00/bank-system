const buttons = document.querySelectorAll(".hero__buttons button");
const baseUrlInput = document.getElementById("base-url-input");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const refreshForm = document.getElementById("refresh-form");
const customForm = document.getElementById("custom-request-form");
const currentUserBtn = document.getElementById("current-user-btn");
const accountsBtn = document.getElementById("accounts-btn");
const transactionsBtn = document.getElementById("transactions-btn");
const responseLog = document.getElementById("response-log");
const registerStatus = document.getElementById("register-status");
const loginStatus = document.getElementById("login-status");
const refreshStatus = document.getElementById("refresh-status");
const customStatus = document.getElementById("custom-status");
const accessTokenEl = document.getElementById("access-token");
const refreshTokenEl = document.getElementById("refresh-token");
const refreshTokenInput = document.getElementById("refresh-token-input");

const STORAGE_KEY = "microbank-frontend-tokens";
const state = {
  accessToken: "",
  refreshToken: "",
};
const logStack = [];

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.section;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

function setStatus(element, message = "", status = "") {
  if (!element) return;
  element.textContent = message;
  if (status) {
    element.dataset.status = status;
  } else {
    element.removeAttribute("data-status");
  }
}

function buildUrl(path) {
  const base = (baseUrlInput?.value || "http://localhost:8123").trim().replace(/\/$/, "");
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `${base}${trimmed.startsWith("/") ? trimmed : "/" + trimmed}`;
}

function logResponse(entry, isError = false) {
  const formatted = `${new Date().toLocaleTimeString()} · ${entry.label} (${entry.status})\n${formatPayload(entry.payload)}`;
  logStack.unshift(formatted);
  responseLog.textContent = logStack.slice(0, 6).join("\n\n\n");
  responseLog.dataset.error = isError ? "true" : "";
}

function formatPayload(payload) {
  if (payload === undefined || payload === null) {
    return "<пустой ответ>";
  }
  if (typeof payload === "string") {
    return payload;
  }
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

async function sendRequest({ path, method = "GET", body = null, includeAuth = true, label = "Запрос" }) {
  const url = buildUrl(path);
  const headers = {};
  if (body !== null) {
    headers["Content-Type"] = "application/json";
  }
  if (includeAuth && state.accessToken) {
    headers["Authorization"] = `Bearer ${state.accessToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body !== null) {
    options.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let response;
  let payload = null;
  try {
    response = await fetch(url, options);
    const text = await response.text();
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    logResponse({ label, status: response.status, payload });

    if (!response.ok) {
      const errorMessage = (payload && payload.message) || response.statusText || "Ошибка";
      throw new Error(errorMessage);
    }

    return payload;
  } catch (error) {
    logResponse(
      {
        label,
        status: response ? response.status : "network",
        payload: error.message,
      },
      true,
    );
    throw error;
  }
}

function applyTokens(payload) {
  if (!payload) return;
  if (payload.access_token) {
    state.accessToken = payload.access_token;
  }
  if (payload.refresh_token) {
    state.refreshToken = payload.refresh_token;
  }
  updateTokenUI();
}

function updateTokenUI() {
  const short = (value) => (value ? `${value.slice(0, 24)}…` : "—");
  accessTokenEl.textContent = state.accessToken ? short(state.accessToken) : "—";
  refreshTokenEl.textContent = state.refreshToken ? short(state.refreshToken) : "—";
  refreshTokenInput.value = state.refreshToken || "";
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadTokens() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      state.accessToken = parsed.accessToken || "";
      state.refreshToken = parsed.refreshToken || "";
    } catch (error) {
      console.warn("Не удалось считать сохранённые токены:", error);
    }
  }
  updateTokenUI();
}

function parseBody(raw) {
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(registerStatus, "Отправляем регистрацию...");
  const values = Object.fromEntries(new FormData(registerForm));
  try {
    await sendRequest({
      path: "/api/v1/auth/register",
      method: "POST",
      body: values,
      includeAuth: false,
      label: "Регистрация",
    });
    setStatus(registerStatus, "Регистрация принята, проверьте email.", "success");
  } catch (error) {
    setStatus(registerStatus, error.message || "Ошибка регистрации", "error");
  }
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(loginStatus, "Авторизуемся...");
  const values = Object.fromEntries(new FormData(loginForm));
  try {
    const response = await sendRequest({
      path: "/api/v1/auth/login",
      method: "POST",
      body: values,
      includeAuth: false,
      label: "Логин",
    });
    applyTokens(response?.data || response);
    setStatus(loginStatus, "Вход выполнен", "success");
  } catch (error) {
    setStatus(loginStatus, error.message || "Ошибка входа", "error");
  }
});

refreshForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(refreshStatus, "Обновляем токен...");
  const values = Object.fromEntries(new FormData(refreshForm));
  try {
    const response = await sendRequest({
      path: "/api/v1/auth/refresh-token",
      method: "POST",
      body: values,
      includeAuth: false,
      label: "Обновление токена",
    });
    applyTokens(response?.data || response);
    setStatus(refreshStatus, "Токен обновлён", "success");
  } catch (error) {
    setStatus(refreshStatus, error.message || "Ошибка обновления", "error");
  }
});

customForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(customStatus, "Отправляем запрос...");
  const formData = new FormData(customForm);
  const method = formData.get("method") || "GET";
  const endpoint = formData.get("endpoint") || "";
  const body = parseBody(formData.get("body"));
  try {
    await sendRequest({
      path: endpoint,
      method,
      body,
      includeAuth: true,
      label: `Custom ${method} ${endpoint}`,
    });
    setStatus(customStatus, "Запрос отправлен", "success");
  } catch (error) {
    setStatus(customStatus, error.message || "Ошибка запроса", "error");
  }
});

currentUserBtn?.addEventListener("click", () => {
  sendRequest({
    path: "/api/v1/auth/users/me",
    method: "GET",
    includeAuth: true,
    label: "Профиль",
  }).catch(() => {});
});

accountsBtn?.addEventListener("click", () => {
  sendRequest({
    path: "/api/v1/accounts",
    method: "GET",
    includeAuth: true,
    label: "Счета",
  }).catch(() => {});
});

transactionsBtn?.addEventListener("click", () => {
  sendRequest({
    path: "/api/v1/transactions",
    method: "GET",
    includeAuth: true,
    label: "Транзакции",
  }).catch(() => {});
});

loadTokens();
