const { AuthSession } = require("../models");
const { randomToken } = require("../utils/tokens");

function getBrowserName(req) {
  return (req.headers["user-agent"] || "Unknown browser").slice(0, 255);
}

async function findSessionFromCookie(req) {
  const sessionId = req.cookies.authSessionId;
  if (!sessionId) return null;
  return AuthSession.findOne({
    where: {
      sessionId,
      revokedAt: null
    }
  });
}

async function createVerifiedSession(user, req) {
  const session = await AuthSession.create({
    userId: user.id,
    sessionId: randomToken(),
    browserName: getBrowserName(req),
    ipAddress: req.ip,
    isVerified: true,
    lastUsedAt: new Date()
  });
  return session;
}

async function ensureVerifiedSession(user, req) {
  const existing = await findSessionFromCookie(req);
  if (existing && existing.userId === user.id && existing.isVerified) {
    return { status: "verified", session: existing };
  }

  const session = await createVerifiedSession(user, req);
  return { status: "verified", session };
}

module.exports = {
  findSessionFromCookie,
  createVerifiedSession,
  ensureVerifiedSession
};
