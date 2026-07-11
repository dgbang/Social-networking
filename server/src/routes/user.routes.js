const express = require("express");
const { body, param, query } = require("express-validator");
const userController = require("../controllers/user.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { handleUpload } = require("../middlewares/upload");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const uuidParam = param("id").isUUID().withMessage("Valid user id is required");
const limitRule = query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be from 1 to 50");

router.use(requireAuth);

router.get("/me", asyncHandler(userController.me));
router.get("/online-friends", asyncHandler(userController.onlineFriends));
router.post(
  "/fcm-token",
  [body("token").isString().trim().isLength({ min: 10, max: 4096 }).withMessage("Valid FCM token is required")],
  validate,
  asyncHandler(userController.saveFcmToken)
);
router.put(
  "/me",
  [
    body("fullName").optional().trim().isLength({ min: 1, max: 80 }).withMessage("Full name must be 1-80 characters"),
    body("bio").optional({ nullable: true }).trim().isLength({ max: 300 }).withMessage("Bio must be 300 characters or less")
  ],
  validate,
  asyncHandler(userController.updateMe)
);
router.post("/me/avatar", handleUpload("avatar"), asyncHandler(userController.uploadAvatar));
router.post("/me/cover", handleUpload("cover"), asyncHandler(userController.uploadCover));
router.get(
  "/search",
  [
    query("q").trim().isLength({ min: 2 }).withMessage("Search query must be at least 2 characters"),
    query("limit").optional().isInt({ min: 1, max: 20 }).withMessage("Limit must be from 1 to 20")
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
    query("cursor").optional().isISO8601().withMessage("Cursor must be a valid datetime")
  ],
  validate,
  asyncHandler(userController.posts)
);

module.exports = router;
