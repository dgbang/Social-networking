const express = require("express");
const { param, query } = require("express-validator");
const notificationController = require("../controllers/notification.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const notificationIdParam = param("id").isUUID().withMessage("ID thông báo hợp lệ là bắt buộc");
const limitRule = query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Giới hạn phải từ 1 đến 50");
const cursorRule = query("cursor").optional().isISO8601().withMessage("Con trỏ phải là thời gian hợp lệ");
const statusRule = query("status").optional().isIn(["all", "unread", "read"]).withMessage("Trạng thái thông báo không hợp lệ");

router.use(requireAuth);

router.get("/", [limitRule, cursorRule, statusRule], validate, asyncHandler(notificationController.list));
router.put("/read-all", asyncHandler(notificationController.readAll));
router.put("/:id/read", [notificationIdParam], validate, asyncHandler(notificationController.read));

module.exports = router;
