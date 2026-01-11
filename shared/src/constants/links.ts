// Centralized link constants to prevent URL drift between backend and mobile
export const DEEP_LINK_SCHEME = 'faithconnect://magic-login';
export const DEV_DEEP_LINK_SCHEME = 'exp://127.0.0.1:8081';

// Use Netlify-hosted redirect page (custom domain can be swapped via env in backend)
export const WEB_FALLBACK_DOMAIN = 'https://faithconnectapp.netlify.app';
export const WEB_MAGIC_ROUTE = '/';

export const MAGIC_LINK_WEB_URL = `${WEB_FALLBACK_DOMAIN}${WEB_MAGIC_ROUTE}`;