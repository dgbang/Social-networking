const ACCESS_TOKEN_KEY = "socialPromax.accessToken";
const USER_KEY = "socialPromax.user";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function loadStoredAuth() {
  if (!canUseStorage()) {
    return { accessToken: null, user: null };
  }

  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!accessToken || !rawUser) {
    return { accessToken: null, user: null };
  }

  try {
    return {
      accessToken,
      user: JSON.parse(rawUser)
    };
  } catch (error) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    return { accessToken: null, user: null };
  }
}

export function saveStoredAuth({ accessToken, user }) {
  if (!canUseStorage() || !accessToken || !user) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
