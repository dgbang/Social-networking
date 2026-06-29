const authService = require("../services/auth.service");
const { success } = require("../utils/response");
const toPublicUser = require("../utils/publicUser");
const env = require("../config/env");
const { randomToken } = require("../utils/tokens");

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.cookies.secure,
  sameSite: env.cookies.sameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const sessionCookieOptions = {
  httpOnly: true,
  secure: env.cookies.secure,
  sameSite: env.cookies.sameSite,
  maxAge: 30 * 24 * 60 * 60 * 1000
};

const googleStateCookieOptions = {
  httpOnly: true,
  secure: env.cookies.secure,
  sameSite: env.cookies.sameSite,
  maxAge: 10 * 60 * 1000
};

function withoutMaxAge(options) {
  const { maxAge, ...cookieOptions } = options;
  return cookieOptions;
}

function clearAuthCookies(res) {
  res.clearCookie("refreshToken", withoutMaxAge(refreshCookieOptions));
  res.clearCookie("authSessionId", withoutMaxAge(sessionCookieOptions));
}

function oauthErrorRedirect(code) {
  const url = new URL("/login", env.clientUrl);
  url.searchParams.set("oauthError", code || "GOOGLE_LOGIN_FAILED");
  return url.toString();
}

function logOAuthError(error) {
  if (env.nodeEnv === "test") return;
  console.error("Google OAuth failed", {
    code: error.code || "GOOGLE_LOGIN_FAILED",
    message: error.message
  });
}

async function register(req, res) {
  const user = await authService.register(req.body);
  return success(res, req, {
    status: 201,
    message: "Register successful. You can login now.",
    data: { user }
  });
}

async function login(req, res) {
  const result = await authService.login(req.body, req);

  res.cookie("authSessionId", result.sessionId, sessionCookieOptions);

  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
  return success(res, req, {
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
}

async function googleStart(req, res) {
  try {
    const state = randomToken();
    const url = authService.getGoogleAuthUrl(state);
    res.cookie("googleOAuthState", state, googleStateCookieOptions);
    return res.redirect(url);
  } catch (error) {
    return res.redirect(oauthErrorRedirect(error.code));
  }
}

async function googleCallback(req, res) {
  try {
    const result = await authService.loginWithGoogle(
      {
        code: req.query.code,
        state: req.query.state,
        expectedState: req.cookies.googleOAuthState
      },
      req
    );

    res.clearCookie("googleOAuthState", withoutMaxAge(googleStateCookieOptions));
    res.cookie("authSessionId", result.sessionId, sessionCookieOptions);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    const url = new URL("/oauth/callback", env.clientUrl);
    url.hash = new URLSearchParams({ accessToken: result.accessToken }).toString();
    return res.redirect(url.toString());
  } catch (error) {
    logOAuthError(error);
    res.clearCookie("googleOAuthState", withoutMaxAge(googleStateCookieOptions));
    return res.redirect(oauthErrorRedirect(error.code || "GOOGLE_LOGIN_FAILED"));
  }
}

async function refresh(req, res) {
  const result = await authService.refresh(req);
  return success(res, req, {
    message: "Token refreshed",
    data: result
  });
}

async function logout(req, res) {
  await authService.logout(req);
  clearAuthCookies(res);
  return success(res, req, {
    message: "Logout successful",
    data: null
  });
}

async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body.email);
  return success(res, req, {
    message: "If the email exists, a reset email has been sent.",
    data: null
  });
}

async function resetPassword(req, res) {
  await authService.resetPassword(req.params.token, req.body.password);
  clearAuthCookies(res);
  return success(res, req, {
    message: "Password reset successful",
    data: null
  });
}

async function me(req, res) {
  return success(res, req, {
    message: "Current user",
    data: { user: toPublicUser(req.user) }
  });
}

module.exports = {
  register,
  login,
  googleStart,
  googleCallback,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  me
};
