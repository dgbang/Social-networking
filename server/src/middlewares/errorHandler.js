const { fail } = require("../utils/response");

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const code = err.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");
  const message = status === 500 ? "Internal server error" : err.message;
  const details = err.details || [];

  if (status === 500 && process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  return fail(res, req, { status, code, message, details });
}

module.exports = errorHandler;
