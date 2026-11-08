// Injected at build time from the root package.json (see vite.config.js).
// eslint-disable-next-line no-undef
export const VERSION = typeof __APP_VERSION__ === 'undefined' ? 'dev' : __APP_VERSION__;
