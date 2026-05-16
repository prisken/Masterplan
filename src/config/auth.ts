/** Client-side feature flag: set VITE_AUTH_ENABLED=true to require login and server-backed AppData. */
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true';
