const express = require("express");
const { success } = require("../utils/response");

const router = express.Router();

router.get("/", (req, res) => {
  return success(res, req, {
    message: "Hệ thống hoạt động bình thường",
    data: { status: "ok" }
  });
});

module.exports = router;
