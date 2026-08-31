// Next.js specific logic for setting/getting cookies.
// We'll use a simple utility for client-side cookies for now.
// For robust usage in app router, you'd use next/headers for SSR.

export const setSessionToken = (token: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `smartbio_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  }
};

export const getSessionToken = (): string | null => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )smartbio_token=([^;]+)'));
    if (match) return match[2];
  }
  return null;
};

export const clearSession = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'smartbio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};
