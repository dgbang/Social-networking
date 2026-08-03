const express = require("express");
const { body, param, query } = require("express-validator");
const userController = require("../controllers/user.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { handleUpload } = require("../middlewares/upload");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const uuidParam = param("id").isUUID().withMessage("ID người dùng hợp lệ là bắt buộc");
const limitRule = query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Giới hạn phải từ 1 đến 50");

router.use(requireAuth);

router.get("/me", asyncHandler(userController.me));
router.get("/online-friends", asyncHandler(userController.onlineFriends));
router.post(
  "/fcm-token",
  [body("token").isString().trim().isLength({ min: 10, max: 4096 }).withMessage("Token FCM hợp lệ là bắt buộc")],
  validate,
  asyncHandler(userController.saveFcmToken)
);
router.put(
  "/me",
  [
    body("fullName").optional().trim().isLength({ min: 1, max: 80 }).withMessage("Họ và tên phải có từ 1 đến 80 ký tự"),
    body("bio").optional({ nullable: true }).trim().isLength({ max: 300 }).withMessage("Tiểu sử không được vượt quá 300 ký tự")
  ],
  validate,
  asyncHandler(userController.updateMe)
);
router.post("/me/avatar", handleUpload("avatar"), asyncHandler(userController.uploadAvatar));
router.post("/me/cover", handleUpload("cover"), asyncHandler(userController.uploadCover));
router.get(
  "/search",
  [
    query("q").trim().isLength({ min: 2 }).withMessage("Từ khóa tìm kiếm phải có ít nhất 2 ký tự"),
    query("limit").optional().isInt({ min: 1, max: 20 }).withMessage("Giới hạn phải từ 1 đến 20")
  ],
  validate,
  asyncHandler(userController.search)
);
router.get("/:id", [uuidParam, limitRule], validate, asyncHandler(userController.getById));
router.get(
  "/:id/posts",
  [
    uuidParam,
    limitRule,
    query("cursor").optional().isISO8601().withMessage("Con trỏ phải là thời gian hợp lệ")
  ],
  validate,
  asyncHandler(userController.posts)
);

module.exports = router;
