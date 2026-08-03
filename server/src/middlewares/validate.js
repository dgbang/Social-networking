const { validationResult } = require("express-validator");
const { fail } = require("../utils/response");

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return fail(res, req, {
    status: 422,
    code: "VALIDATION_ERROR",
    message: "Dữ liệu không hợp lệ",
    details: result.array()
  });
}

module.exports = validate;
