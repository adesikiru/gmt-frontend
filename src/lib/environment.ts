// ─────────────────────────────────────────────────────────────────────────────
// Environment Configuration
//
// You can easily toggle between LOCAL and HOSTED environments below,
// OR leave ENV_MODE as 'auto' to read from NEXT_PUBLIC_API_URL in .env.local:
// ─────────────────────────────────────────────────────────────────────────────

export type EnvMode = 'auto' | 'local' | 'hosted';

export const ENV_MODE: EnvMode = (process.env.NEXT_PUBLIC_ENV_MODE as EnvMode) || 'auto';

export const BACKEND_URLS = {
  // Local development backend
  local: 'http://localhost:4000',
  // Hosted / Cloud production backend (Render, Railway, Fly.io, etc.)
  hosted: 'https://gmt-backend.onrender.com',
} as const;

export const ENV = {
  /** Resolved Base URL of the NestJS backend API */
  apiUrl:
    ENV_MODE === 'local'
      ? BACKEND_URLS.local
      : ENV_MODE === 'hosted'
      ? BACKEND_URLS.hosted
      : process.env.NEXT_PUBLIC_API_URL || BACKEND_URLS.local,
} as const;
