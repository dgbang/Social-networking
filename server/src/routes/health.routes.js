const express = require("express");
const { success } = require("../utils/response");

const router = express.Router();

router.get("/", (req, res) => {
  return success(res, req, {
    message: "OK",
    data: { status: "ok" }
  });
});

module.exports = router;
