// ─────────────────────────────────────────────────────────────────────────────
// Environment Configuration
//
// Automatically resolves the API base URL based on environment,
// runtime hostname, or NEXT_PUBLIC_API_URL.
// ─────────────────────────────────────────────────────────────────────────────

export type EnvMode = 'auto' | 'local' | 'hosted';

export const ENV_MODE: EnvMode = (process.env.NEXT_PUBLIC_ENV_MODE as EnvMode) || 'auto';

export const BACKEND_URLS = {
  // Local development backend
  local: 'http://localhost:4000',
  // Hosted / Cloud production backend (Render default)
  hosted: 'https://gmt-backend.onrender.com',
} as const;

export function getApiUrl(): string {
  if (ENV_MODE === 'local') return BACKEND_URLS.local;
  if (ENV_MODE === 'hosted') return BACKEND_URLS.hosted;

  // 1. Explicitly provided in environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // 2. Running in browser: if not on localhost, use hosted production backend
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local');

    if (!isLocalhost) {
      return BACKEND_URLS.hosted;
    }
  }

  // 3. Fallback for SSR / Node environment
  return process.env.NODE_ENV === 'production' ? BACKEND_URLS.hosted : BACKEND_URLS.local;
}

export const ENV = {
  get apiUrl() {
    return getApiUrl();
  },
} as const;
