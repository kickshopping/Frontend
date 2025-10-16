export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function makeRequest(input: string | Request, init: RequestInit = {}, token?: string) {
  const url = typeof input === 'string' && !input.startsWith('http') ? `${API_BASE}${input}` : input as string;
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  // set content-type if body present and not FormData
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(url, { ...init, headers });
  return res;
}

/**
 * authFetch: intenta una petición protegida usando tokenkick en localStorage.
 * Si la petición responde 401, intentará renovar el token en /usuarios/refresh
 * y reintentará la petición automáticamente.
 */
export async function authFetch(input: string | Request, init: RequestInit = {}) {
  if (typeof window === 'undefined') {
    // Server-side, do a normal fetch without auth
    return makeRequest(input, init, undefined);
  }

  let token = localStorage.getItem('tokenkick');
  let tokenOrUndef: string | undefined = token ?? undefined;
  let res = await makeRequest(input, init, tokenOrUndef);

  if (res.status !== 401) return res;

  // Intentar renovar token
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const refreshRes = await fetch(`${API_BASE}/usuarios/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken ?? ''}` }
      });
    if (!refreshRes.ok) {
      // No se pudo renovar: limpiar y devolver la respuesta original (401)
      localStorage.removeItem('tokenkick');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_type');
      return res;
    }
    const refreshData = await refreshRes.json().catch(() => ({}));
      if (refreshData.access_token) {
      localStorage.setItem('tokenkick', refreshData.access_token);
        if (refreshData.refresh_token) localStorage.setItem('refresh_token', refreshData.refresh_token);
      if (refreshData.user_type) localStorage.setItem('user_type', refreshData.user_type);
      token = refreshData.access_token;
      // Reintentar la petición original con token renovado
      const retry = await makeRequest(input, init, token ?? undefined);
      return retry;
    }
    return res;
  } catch (e) {
    // En caso de error de red durante refresh, devolver la respuesta original (401)
    return res;
  }
}

export async function authFetchJson(input: string | Request, init: RequestInit = {}) {
  const res = await authFetch(input, init);
  const json = await res.json().catch(() => ({}));
  return { res, json };
}
