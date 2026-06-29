const express = require("express");
const { param } = require("express-validator");
const messageController = require("../controllers/message.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth);

router.delete("/:id", [param("id").isUUID().withMessage("Valid message id is required")], validate, asyncHandler(messageController.remove));

module.exports = router;
