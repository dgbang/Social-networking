const { Op } = require("sequelize");
const { User, AuthSession } = require("../models");
const env = require("../config/env");
const { hashPassword, comparePassword } = require("../utils/password");
const {
  randomToken,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require("../utils/tokens");
const toPublicUser = require("../utils/publicUser");
const mailService = require("./mail.service");
const sessionService = require("./session.service");

function addHours(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function requireGoogleConfig() {
  if (!env.google.clientId || !env.google.clientSecret) {
    const error = new Error("Google login is not configured");
    error.status = 503;
    error.code = "GOOGLE_AUTH_NOT_CONFIGURED";
    throw error;
  }
}

function getGoogleAuthUrl(state) {
  requireGoogleConfig();

  const params = new URLSearchParams({
    client_id: env.google.clientId,
    redirect_uri: env.google.callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account"
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeGoogleCode(code) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: env.google.clientId,
      client_secret: env.google.clientSecret,
      redirect_uri: env.google.callbackUrl,
      grant_type: "authorization_code"
    })
  });

  if (!res.ok) {
    const error = new Error("Google token exchange failed");
    error.status = 401;
    error.code = "GOOGLE_TOKEN_EXCHANGE_FAILED";
    throw error;
  }

  return res.json();
}

async function fetchGoogleProfile(accessToken) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const error = new Error("Google profile request failed");
    error.status = 401;
    error.code = "GOOGLE_PROFILE_FAILED";
    throw error;
  }

  return res.json();
}

function normalizeGoogleUsername(email) {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);

  return base.length >= 3 ? base : `user${base}`;
}

async function createUniqueGoogleUsername(email) {
  const base = normalizeGoogleUsername(email);
  let candidate = base;
  let index = 1;

  while (await User.findOne({ where: { username: candidate } })) {
    candidate = `${base}${index}`;
    index += 1;
  }

  return candidate;
}

async function findOrCreateGoogleUser(profile) {
  const email = profile.email?.toLowerCase().trim();
  if (!email || !profile.email_verified) {
    const error = new Error("Google account email is not verified");
    error.status = 403;
    error.code = "GOOGLE_EMAIL_NOT_VERIFIED";
    throw error;
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    if (!existing.isVerified) {
      await existing.update({ isVerified: true, verificationToken: null });
    }
    return existing;
  }

  return User.create({
    email,
    username: await createUniqueGoogleUsername(email),
    password: await hashPassword(randomToken()),
    fullName: profile.name || email.split("@")[0],
    avatar: profile.picture || null,
    isVerified: true,
    verificationToken: null
  });
}

async function loginWithGoogle({ code, state, expectedState }, req) {
  requireGoogleConfig();

  if (!code || !state || !expectedState || state !== expectedState) {
    const error = new Error("Invalid Google login state");
    error.status = 400;
    error.code = "INVALID_GOOGLE_STATE";
    throw error;
  }

  const tokenResult = await exchangeGoogleCode(code);
  const profile = await fetchGoogleProfile(tokenResult.access_token);
  const user = await findOrCreateGoogleUser(profile);
  const session = await sessionService.createVerifiedSession(user, req);
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, session);

  await session.update({
    refreshTokenHash: hashToken(refreshToken),
    lastUsedAt: new Date(),
    revokedAt: null
  });

  return {
    accessToken,
    refreshToken,
    sessionId: session.sessionId,
    user: toPublicUser(user)
  };
}

async function register({ email, username, password, fullName }) {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.trim();

  const existing = await User.findOne({
    where: {
      [Op.or]: [{ email: normalizedEmail }, { username: normalizedUsername }]
    }
  });

  if (existing) {
    const error = new Error("Email or username already exists");
    error.status = 409;
    error.code = "USER_EXISTS";
    throw error;
  }

  const user = await User.create({
    email: normalizedEmail,
    username: normalizedUsername,
    password: await hashPassword(password),
    fullName: fullName.trim(),
    verificationToken: null,
    isVerified: true
  });

  return toPublicUser(user);
}

async function login({ email, password }, req) {
  const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const passwordOk = await comparePassword(password, user.password);
  if (!passwordOk) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const sessionState = await sessionService.ensureVerifiedSession(user, req);
  const session = sessionState.session;
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, session);

  await session.update({
    refreshTokenHash: hashToken(refreshToken),
    lastUsedAt: new Date(),
    revokedAt: null
  });

  return {
    accessToken,
    refreshToken,
    sessionId: session.sessionId,
    user: toPublicUser(user)
  };
}

async function refresh(req) {
  const refreshToken = req.cookies.refreshToken;
  const session = await sessionService.findSessionFromCookie(req);

  if (!refreshToken || !session || !session.refreshTokenHash) {
    const error = new Error("Invalid refresh token");
    error.status = 401;
    error.code = "INVALID_REFRESH_TOKEN";
    throw error;
  }

  const payload = verifyRefreshToken(refreshToken);
  if (payload.sid !== session.sessionId || payload.sub !== session.userId) {
    const error = new Error("Invalid refresh token");
    error.status = 401;
    error.code = "INVALID_REFRESH_TOKEN";
    throw error;
  }

  if (hashToken(refreshToken) !== session.refreshTokenHash) {
    const error = new Error("Invalid refresh token");
    error.status = 401;
    error.code = "INVALID_REFRESH_TOKEN";
    throw error;
  }

  const user = await User.findByPk(payload.sub);
  if (!user) {
    const error = new Error("Invalid refresh token");
    error.status = 401;
    error.code = "INVALID_REFRESH_TOKEN";
    throw error;
  }

  await session.update({ lastUsedAt: new Date() });
  return {
    accessToken: signAccessToken(user),
    user: toPublicUser(user)
  };
}

async function logout(req) {
  const session = await sessionService.findSessionFromCookie(req);
  if (session) {
    await session.update({
      refreshTokenHash: null,
      revokedAt: new Date()
    });
  }
}

async function forgotPassword(email) {
  const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    return;
  }

  await user.update({
    resetPasswordToken: randomToken(),
    resetPasswordExpires: addHours(1)
  });
  await mailService.sendResetPasswordEmail(user);
}

async function resetPassword(token, password) {
  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: new Date() }
    }
  });

  if (!user) {
    const error = new Error("Invalid or expired reset token");
    error.status = 400;
    error.code = "INVALID_RESET_TOKEN";
    throw error;
  }

  await user.update({
    password: await hashPassword(password),
    resetPasswordToken: null,
    resetPasswordExpires: null
  });

  await AuthSession.update(
    {
      refreshTokenHash: null,
      revokedAt: new Date()
    },
    { where: { userId: user.id, revokedAt: null } }
  );
}

module.exports = {
  register,
  login,
  getGoogleAuthUrl,
  loginWithGoogle,
  refresh,
  logout,
  forgotPassword,
  resetPassword
};
