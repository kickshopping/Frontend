export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  user_type?: string;
  user_id?: number;
  username?: string;
}

interface JWTPayload {
  exp: number;
  [key: string]: any;
}

async function makeRequest(input: string | Request, init: RequestInit = {}, token?: string) {
  const url = typeof input === 'string' && !input.startsWith('http') ? `${API_BASE}${input}` : input as string;
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  // set content-type if body present and not FormData
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  try {
    let res = await fetch(url, { ...init, headers });

    // If unauthorized, try to refresh the token once and retry
    if (res.status === 401) {
      // attempt token refresh (refreshToken is defined later in this module)
      const refreshed = await refreshToken().catch(() => false);
      if (refreshed) {
        const newToken = localStorage.getItem('tokenkick');
        if (newToken) {
          headers.set('Authorization', `Bearer ${newToken}`);
          res = await fetch(url, { ...init, headers });
        }
      } else {
        // If refresh failed, clear auth and redirect to login to force re-authentication
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('tokenkick');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_type');
            localStorage.removeItem('user');
            // small delay to let UI update if needed
            window.location.href = '/login';
          }
        } catch (e) {
          // ignore
        }
      }
    }

    return res;
  } catch (err) {
    // Network errors (server down, CORS network failure, etc.) end up here.
    // Throw a clear error so callers can detect and show a friendly message.
    // Use debug so it's less noisy in production consoles.
    console.debug('Network error when calling API:', url, err);
    throw new Error('NetworkError');
  }
}

function parseJwt(token: string | null): JWTPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1])) as JWTPayload;
    return payload;
  } catch (e) {
    return null;
  }
}

function isTokenExpired(token: string | null, bufferSec = 30) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + bufferSec;
}

let refreshingPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  // If a refresh is already in-flight, return that promise
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      console.debug('auth: attempting refresh, have refresh_token=', !!refreshToken);
      if (!refreshToken) {
        // nothing to do
        localStorage.removeItem('tokenkick');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_type');
        return false;
      }
      const refreshRes = await fetch(`${API_BASE}/usuarios/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken}` }
      });
      if (!refreshRes.ok) {
        console.debug('auth: refresh endpoint returned', refreshRes.status);
        // refresh failed -> clear storage
        localStorage.removeItem('tokenkick');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_type');
        return false;
      }
      const refreshData = await refreshRes.json().catch(() => ({} as RefreshResponse));
      console.debug('auth: refresh response', refreshData);
      if (refreshData.access_token) {
        // Update tokens in localStorage
        localStorage.setItem('tokenkick', refreshData.access_token);
        if (refreshData.refresh_token) localStorage.setItem('refresh_token', refreshData.refresh_token);
        if (refreshData.user_type) localStorage.setItem('user_type', refreshData.user_type);
        
        // Always update the user object with all available data
        const u = {
          user_id: refreshData.user_id,
          username: refreshData.username,
          user_type: refreshData.user_type,
          // Keep existing data if new refresh didn't provide it
          ...JSON.parse(localStorage.getItem('user') || '{}')
        };
        localStorage.setItem('user', JSON.stringify(u));
        
        return true;
      }
      return false;
    } catch (e) {
      return false;
    } finally {
      refreshingPromise = null;
    }
  })();

  return refreshingPromise;
}

// Expose refreshToken so other client code (for example app initializer) can
// trigger a silent refresh on app startup.
export { refreshToken };

// Control para permitir/desactivar refresh automático desde la app.
// Por defecto está activado. Puedes desactivarlo llamando a setAutoRefresh(false)
let AUTO_REFRESH = true;
export function setAutoRefresh(v: boolean) {
  AUTO_REFRESH = !!v;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('disable_auto_refresh', AUTO_REFRESH ? '0' : '1');
    }
  } catch (e) {}
}
// Inicializar desde localStorage si el usuario ya lo configuró
try {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('disable_auto_refresh');
    if (stored === '1') AUTO_REFRESH = false;
  }
} catch (e) {}

/**
 * authFetch: intenta una petición protegida usando tokenkick en localStorage.
 * - Si el access token está vencido (o a punto de vencerse), intenta refresh antes.
 * - Si la petición responde 401, intenta refresh y reintenta una vez.
 */
export async function authFetch(input: string | Request, init: RequestInit = {}) {
  if (typeof window === 'undefined') {
    // Server-side, do a normal fetch without auth
    return makeRequest(input, init, undefined);
  }
  // Obtener token actual
  let token = localStorage.getItem('tokenkick');

  // Si está habilitado el auto-refresh, renovamos antes cuando corresponda
  if (AUTO_REFRESH && isTokenExpired(token)) {
    const ok = await refreshToken();
    if (ok) token = localStorage.getItem('tokenkick');
  }

  let res;
  try {
    res = await makeRequest(input, init, token ?? undefined);
  } catch (e: any) {
    // Network error while trying to reach backend (server down, CORS, etc.)
    if (e && e.message === 'NetworkError') {
      // Return a synthetic response-like object so callers can handle it gracefully
      return {
        ok: false,
        status: 0,
        json: async () => ({}),
        text: async () => ''
      } as unknown as Response;
    }
    throw e;
  }

  // Si está desactivado el auto-refresh, devolvemos la respuesta tal cual
  if (!AUTO_REFRESH) return res;

  if (res.status !== 401) return res;

  // Si recibimos 401, intentar refresh y reintentar una sola vez
  const refreshed = await refreshToken();
  if (!refreshed) {
    // no se pudo renovar -> devolver el 401 (el cliente deberá pedir login)
    return res;
  }
  const newToken = localStorage.getItem('tokenkick');
  try {
    const retry = await makeRequest(input, init, newToken ?? undefined);
    return retry;
  } catch (e: any) {
    if (e && e.message === 'NetworkError') {
      return {
        ok: false,
        status: 0,
        json: async () => ({}),
        text: async () => ''
      } as unknown as Response;
    }
    throw e;
  }
}

export async function authFetchJson(input: string | Request, init: RequestInit = {}) {
  const res = await authFetch(input, init);
  const json = await res.json().catch(() => ({}));
  return { res, json };
}
