/**
 * Dev-only logger — production'da hiçbir şey loglanmaz.
 * Hassas hata mesajlarının production console'a sızmasını engeller.
 */
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
};
