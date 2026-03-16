/**
 * Servicio API — conecta el frontend con el backend Express
 * Base URL: http://localhost:5000/api
 */

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/* Leer token JWT guardado en localStorage (dentro del estado auth) */
function getToken() {
  try {
    const saved = localStorage.getItem('auth');
    if (!saved) return null;
    return JSON.parse(saved)?.token || null;
  } catch {
    return null;
  }
}

/* Fetch con headers de autenticación */
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error || `Error ${res.status}`;
      console.error(`[API] ${options.method || 'GET'} ${path} → ${res.status}: ${msg}`);
      throw new Error(msg);
    }
    return res.json();
  } catch (err) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      console.error('[API] No se puede conectar al backend en', BASE, '— ¿está corriendo npm run dev?');
    } else {
      console.error('[API] Error en', path, ':', err.message);
    }
    throw err;
  }
}

/* ── Auth ─────────────────────────────────────────────────────── */
export const authAPI = {
  login: (username, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

/* ── Ventas ───────────────────────────────────────────────────── */
export const ventasAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/ventas${qs ? '?' + qs : ''}`);
  },
  create: (data) =>
    apiFetch('/ventas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/ventas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

/* ── Stock ────────────────────────────────────────────────────── */
export const stockAPI = {
  getAll: () => apiFetch('/stock'),
  getByKey: (key) => apiFetch(`/stock/${encodeURIComponent(key)}`),
  update: (key, categorias) =>
    apiFetch(`/stock/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ categorias }),
    }),
};

/* ── Consultorio ─────────────────────────────────────────────── */
export const consulAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/consultorio${qs ? '?' + qs : ''}`);
  },
  create: (data) =>
    apiFetch('/consultorio', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/consultorio/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) =>
    apiFetch(`/consultorio/${id}`, { method: 'DELETE' }),
};
