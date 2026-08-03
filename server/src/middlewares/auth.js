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
      message: "Thiếu access token"
    });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub);
    if (!user) {
      return fail(res, req, {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Access token không hợp lệ"
      });
    }
    req.user = user;
    return next();
  } catch (error) {
    return fail(res, req, {
      status: 401,
      code: "UNAUTHORIZED",
      message: "Access token không hợp lệ hoặc đã hết hạn"
    });
  }
}

module.exports = requireAuth;
