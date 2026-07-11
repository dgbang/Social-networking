const express = require("express");
const { param, query } = require("express-validator");
const notificationController = require("../controllers/notification.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const notificationIdParam = param("id").isUUID().withMessage("Valid notification id is required");
const limitRule = query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be from 1 to 50");
const cursorRule = query("cursor").optional().isISO8601().withMessage("Cursor must be a valid datetime");
const statusRule = query("status").optional().isIn(["all", "unread", "read"]).withMessage("Invalid notification status");

router.use(requireAuth);

router.get("/", [limitRule, cursorRule, statusRule], validate, asyncHandler(notificationController.list));
router.put("/read-all", asyncHandler(notificationController.readAll));
router.put("/:id/read", [notificationIdParam], validate, asyncHandler(notificationController.read));

module.exports = router;
