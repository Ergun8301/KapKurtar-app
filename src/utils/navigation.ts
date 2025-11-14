// Navigation utilities for handling redirects after login

const REDIRECT_KEY = 'redirect_after_login';

export const saveRedirectPath = (path: string) => {
  sessionStorage.setItem(REDIRECT_KEY, path);
};

export const getRedirectPath = (): string | null => {
  return sessionStorage.getItem(REDIRECT_KEY);
};

export const clearRedirectPath = () => {
  sessionStorage.removeItem(REDIRECT_KEY);
};

export const handlePostLoginRedirect = (): string => {
  const savedPath = getRedirectPath();
  clearRedirectPath();
  return savedPath || '/customer/offers';
};
