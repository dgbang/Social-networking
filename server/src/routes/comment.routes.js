const express = require("express");
const { param } = require("express-validator");
const commentController = require("../controllers/comment.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth);
router.delete(
  "/:id",
  [param("id").isUUID().withMessage("Valid comment id is required")],
  validate,
  asyncHandler(commentController.remove)
);

module.exports = router;
