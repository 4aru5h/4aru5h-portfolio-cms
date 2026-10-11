let cachedCsrfToken = null;

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export function setCsrfToken(token) {
  cachedCsrfToken = token;
}

export function getCsrfToken() {
  return cachedCsrfToken;
}

async function request(endpoint, options = {}) {
  // If state-changing request and no CSRF token cached, fetch it first
  const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes((options.method || 'GET').toUpperCase());
  if (isStateChanging && !cachedCsrfToken && endpoint !== '/auth/csrf') {
    try {
      const csrfRes = await fetch(`${API_BASE}/auth/csrf`, { credentials: 'include' });
      if (csrfRes.ok) {
        const data = await csrfRes.json();
        if (data.csrfToken) cachedCsrfToken = data.csrfToken;
      }
    } catch (e) {
      // Best effort; proceeding to actual request
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (cachedCsrfToken && isStateChanging) {
    headers['X-CSRF-Token'] = cachedCsrfToken;
  }

  const config = {
    credentials: 'include',
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  // Update cached CSRF token if returned in response
  if (data && data.csrfToken) {
    cachedCsrfToken = data.csrfToken;
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || 'API Request Failed';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  del: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default api;
