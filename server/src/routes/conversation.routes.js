const express = require("express");
const { body, param, query } = require("express-validator");
const conversationController = require("../controllers/conversation.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const conversationIdParam = param("id").isUUID().withMessage("Valid conversation id is required");
const limitRule = query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be from 1 to 50");
const cursorRule = query("cursor").optional().isISO8601().withMessage("Cursor must be a valid datetime");

router.use(requireAuth);

router.get("/", [limitRule], validate, asyncHandler(conversationController.list));
router.post(
  "/",
  [
    body("type").isIn(["private", "group"]).withMessage("Invalid conversation type"),
    body("memberIds").isArray({ min: 1 }).withMessage("Member ids are required"),
    body("memberIds.*").isUUID().withMessage("Valid member id is required"),
    body("name").optional({ nullable: true }).trim().isLength({ max: 80 }).withMessage("Name is too long")
  ],
  validate,
  asyncHandler(conversationController.create)
);
router.get("/:id/messages", [conversationIdParam, limitRule, cursorRule], validate, asyncHandler(conversationController.messages));
router.post(
  "/:id/messages",
  [
    conversationIdParam,
    body("content").isString().trim().notEmpty().withMessage("Message content is required"),
    body("replyToId").optional({ nullable: true }).isUUID().withMessage("Valid reply message id is required")
  ],
  validate,
  asyncHandler(conversationController.createMessage)
);

module.exports = router;
