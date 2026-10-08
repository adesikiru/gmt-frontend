const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json() as Promise<ApiResponse<T>>;
}

function authRequest<T>(path: string, token: string, options?: RequestInit): Promise<ApiResponse<T>> {
  return request<T>(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
}

export const api = {
  auth: {
    register: (body: unknown) =>
      request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: unknown) =>
      request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: (token: string) => authRequest('/api/v1/auth/me', token),
  },
  organization: {
    states: () => request('/api/v1/states'),
    lgas: (stateId?: string) => request(`/api/v1/lgas${stateId ? `?stateId=${stateId}` : ''}`),
    wards: (lgaId?: string) => request(`/api/v1/wards${lgaId ? `?lgaId=${lgaId}` : ''}`),
    pollingUnits: (wardId?: string) => request(`/api/v1/polling-units${wardId ? `?wardId=${wardId}` : ''}`),
  },
  membership: {
    my: (token: string) => authRequest('/api/v1/my-membership', token),
    list: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return authRequest(`/api/v1/admin/members${query}`, token);
    },
    verify: (token: string, id: string) =>
      authRequest(`/api/v1/admin/members/${id}/verify`, token, { method: 'PATCH' }),
    reject: (token: string, id: string, reason?: string) =>
      authRequest(`/api/v1/admin/members/${id}/reject`, token, { method: 'PATCH', body: JSON.stringify({ reason }) }),
    suspend: (token: string, id: string, reason?: string) =>
      authRequest(`/api/v1/admin/members/${id}/suspend`, token, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  },
  events: {
    list: (stateId?: string) => request(`/api/v1/events${stateId ? `?stateId=${stateId}` : ''}`),
    get: (id: string) => request(`/api/v1/events/${id}`),
  },
  news: {
    list: (stateId?: string) => request(`/api/v1/news${stateId ? `?stateId=${stateId}` : ''}`),
    get: (slug: string) => request(`/api/v1/news/${slug}`),
  },
  announcements: {
    list: (token: string) => authRequest('/api/v1/announcements', token),
  },
};
