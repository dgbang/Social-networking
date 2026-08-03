const express = require("express");
const { body, param, query } = require("express-validator");
const postController = require("../controllers/post.controller");
const requireAuth = require("../middlewares/auth");
const { handleMediaUpload } = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const postIdParam = param("id").isUUID().withMessage("ID bài viết hợp lệ là bắt buộc");
const limitRule = query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Giới hạn phải từ 1 đến 50");
const cursorRule = query("cursor").optional().isISO8601().withMessage("Con trỏ phải là thời gian hợp lệ");
const privacyRule = body("privacy").optional().isIn(["public", "friends", "private"]).withMessage("Quyền riêng tư không hợp lệ");
const contentRule = body("content").optional({ nullable: true }).trim().isLength({ max: 5000 }).withMessage("Nội dung không được vượt quá 5.000 ký tự");
const reactionRule = body("type").optional().isIn(["like", "love", "haha", "wow", "sad", "angry"]).withMessage("Loại cảm xúc không hợp lệ");

router.use(requireAuth);

router.get("/feed", [limitRule, cursorRule], validate, asyncHandler(postController.feed));
router.post("/", handleMediaUpload("media"), [contentRule, privacyRule], validate, asyncHandler(postController.create));
router.get("/:id", [postIdParam], validate, asyncHandler(postController.detail));
router.put("/:id", handleMediaUpload("media"), [postIdParam, contentRule, privacyRule], validate, asyncHandler(postController.update));
router.delete("/:id", [postIdParam], validate, asyncHandler(postController.remove));
router.post("/:id/like", [postIdParam, reactionRule], validate, asyncHandler(postController.react));
router.post("/:id/share", [postIdParam, contentRule, privacyRule], validate, asyncHandler(postController.share));
router.get(
  "/:id/comments",
  [
    postIdParam,
    limitRule,
    cursorRule,
    query("parentId").optional().isUUID().withMessage("ID bình luận cha hợp lệ là bắt buộc")
  ],
  validate,
  asyncHandler(postController.listComments)
);
router.post(
  "/:id/comments",
  [
    postIdParam,
    body("content").trim().isLength({ min: 1, max: 2000 }).withMessage("Nội dung bình luận phải có từ 1 đến 2.000 ký tự"),
    body("parentId").optional({ nullable: true }).isUUID().withMessage("ID bình luận cha hợp lệ là bắt buộc")
  ],
  validate,
  asyncHandler(postController.createComment)
);

module.exports = router;
