const express = require("express");
const { body, param, query } = require("express-validator");
const conversationController = require("../controllers/conversation.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const conversationIdParam = param("id").isUUID().withMessage("ID cuộc trò chuyện hợp lệ là bắt buộc");
const limitRule = query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Giới hạn phải từ 1 đến 50");
const cursorRule = query("cursor").optional().isISO8601().withMessage("Con trỏ phải là thời gian hợp lệ");

router.use(requireAuth);

router.get("/", [limitRule], validate, asyncHandler(conversationController.list));
router.get("/unread-count", asyncHandler(conversationController.unreadCount));
router.post(
  "/",
  [
    body("type").isIn(["private", "group"]).withMessage("Loại cuộc trò chuyện không hợp lệ"),
    body("memberIds").isArray({ min: 1 }).withMessage("Danh sách ID thành viên là bắt buộc"),
    body("memberIds.*").isUUID().withMessage("ID thành viên hợp lệ là bắt buộc"),
    body("name").optional({ nullable: true }).trim().isLength({ max: 80 }).withMessage("Tên không được vượt quá 80 ký tự")
  ],
  validate,
  asyncHandler(conversationController.create)
);
router.get("/:id/messages", [conversationIdParam, limitRule, cursorRule], validate, asyncHandler(conversationController.messages));
router.post(
  "/:id/messages",
  [
    conversationIdParam,
    body("content").isString().trim().isLength({ min: 1, max: 5000 }).withMessage("Nội dung tin nhắn phải có từ 1 đến 5.000 ký tự"),
    body("replyToId").optional({ nullable: true }).isUUID().withMessage("ID tin nhắn được trả lời hợp lệ là bắt buộc")
  ],
  validate,
  asyncHandler(conversationController.createMessage)
);

module.exports = router;
