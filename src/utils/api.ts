const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const resolveApiBaseUrl = () => {
  const configured = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (typeof window === 'undefined') {
    return '';
  }

  if (import.meta.env.DEV) {
    return '';
  }

  const { hostname, port } = window.location;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isBackendOrigin = isLocalHost && port === '8080';

  if (isLocalHost && !isBackendOrigin) {
    return 'http://127.0.0.1:8080';
  }

  return '';
};

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${resolveApiBaseUrl()}${normalizedPath}`;
};
