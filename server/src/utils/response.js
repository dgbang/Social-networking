function meta(req) {
  return {
    requestId: req.id || null,
    timestamp: new Date().toISOString()
  };
}

function success(res, req, { message = "OK", data = null, status = 200, meta: extraMeta = {} } = {}) {
  return res.status(status).json({
    success: true,
    message,
    data,
    meta: {
      ...meta(req),
      ...extraMeta
    }
  });
}

function fail(res, req, { message = "Error", code = "ERROR", details = [], status = 400 } = {}) {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    error: {
      code,
      details
    },
    meta: meta(req)
  });
}

module.exports = {
  success,
  fail
};
