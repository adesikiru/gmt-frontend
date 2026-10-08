// ─────────────────────────────────────────────────────────────────────────────
// Environment configuration
// Change NEXT_PUBLIC_API_URL in your .env.local to switch environments:
//   Local:  NEXT_PUBLIC_API_URL=http://localhost:4000
//   Hosted: NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
// ─────────────────────────────────────────────────────────────────────────────

export const ENV = {
  /** Base URL of the NestJS backend API */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
} as const;
