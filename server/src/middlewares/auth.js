const { User } = require("../models");
const { verifyAccessToken } = require("../utils/tokens");
const { fail } = require("../utils/response");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return fail(res, req, {
      status: 401,
      code: "UNAUTHORIZED",
      message: "Missing access token"
    });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub);
    if (!user) {
      return fail(res, req, {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Invalid access token"
      });
    }
    req.user = user;
    return next();
  } catch (error) {
    return fail(res, req, {
      status: 401,
      code: "UNAUTHORIZED",
      message: "Invalid or expired access token"
    });
  }
}

module.exports = requireAuth;
