const TOKEN_KEY = 'tdc_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Event dispatched when a 401 is encountered, so the app can log out. */
export const AUTH_LOGOUT_EVENT = 'tdc:logout';

export function emitLogout(): void {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}
