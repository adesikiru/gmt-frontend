import { ENV } from './environment';

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
  const baseUrl = ENV.apiUrl;
  const res = await fetch(`${baseUrl}${path}`, {
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
    updateProfile: (token: string, body: unknown) =>
      authRequest('/api/v1/auth/profile', token, { method: 'PATCH', body: JSON.stringify(body) }),
    updatePassword: (token: string, body: unknown) =>
      authRequest('/api/v1/auth/password', token, { method: 'PATCH', body: JSON.stringify(body) }),
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
      const cleanParams: Record<string, string> = {};
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          if (v !== undefined && v !== null && v !== '') cleanParams[k] = v;
        }
      }
      const query = Object.keys(cleanParams).length ? '?' + new URLSearchParams(cleanParams).toString() : '';
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
    list: (params?: { stateId?: string; userId?: string } | string) => {
      let query = '';
      if (typeof params === 'string') {
        query = params ? `?stateId=${params}` : '';
      } else if (params) {
        const cleanParams: Record<string, string> = {};
        for (const [k, v] of Object.entries(params)) {
          if (v) cleanParams[k] = v;
        }
        query = Object.keys(cleanParams).length ? '?' + new URLSearchParams(cleanParams).toString() : '';
      }
      return request(`/api/v1/events${query}`);
    },
    get: (id: string) => request(`/api/v1/events/${id}`),
    create: (token: string, body: unknown) =>
      authRequest('/api/v1/events', token, { method: 'POST', body: JSON.stringify(body) }),
    publish: (token: string, id: string) =>
      authRequest(`/api/v1/events/${id}/publish`, token, { method: 'PATCH' }),
    delete: (token: string, id: string) =>
      authRequest(`/api/v1/events/${id}`, token, { method: 'DELETE' }),
    toggleRsvp: (token: string, id: string) =>
      authRequest(`/api/v1/events/${id}/rsvp`, token, { method: 'POST' }),
  },
  empowerments: {
    list: (stateId?: string) => request(`/api/v1/empowerments${stateId ? `?stateId=${stateId}` : ''}`),
    get: (id: string) => request(`/api/v1/empowerments/${id}`),
    create: (token: string, body: unknown) =>
      authRequest('/api/v1/empowerments', token, { method: 'POST', body: JSON.stringify(body) }),
    delete: (token: string, id: string) =>
      authRequest(`/api/v1/empowerments/${id}`, token, { method: 'DELETE' }),
  },
  news: {
    list: (stateId?: string) => request(`/api/v1/news${stateId ? `?stateId=${stateId}` : ''}`),
    get: (slug: string) => request(`/api/v1/news/${slug}`),
    create: (token: string, body: unknown) =>
      authRequest('/api/v1/news', token, { method: 'POST', body: JSON.stringify(body) }),
    publish: (token: string, id: string) =>
      authRequest(`/api/v1/news/${id}/publish`, token, { method: 'PATCH' }),
    delete: (token: string, id: string) =>
      authRequest(`/api/v1/news/${id}`, token, { method: 'DELETE' }),
  },
  announcements: {
    list: (token: string) => authRequest('/api/v1/announcements', token),
  },
};
