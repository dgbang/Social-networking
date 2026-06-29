const express = require("express");
const { body, param, query } = require("express-validator");
const storyController = require("../controllers/story.controller");
const requireAuth = require("../middlewares/auth");
const { handleMediaUpload } = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const storyIdParam = param("id").isUUID().withMessage("Valid story id is required");
const textRule = body("text").optional({ nullable: true }).trim().isLength({ max: 160 }).withMessage("Story text is too long");
const limitRule = query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be from 1 to 50");

router.use(requireAuth);

router.get("/feed", [limitRule], validate, asyncHandler(storyController.feed));
router.post("/", handleMediaUpload("media"), [textRule], validate, asyncHandler(storyController.create));
router.post("/:id/view", [storyIdParam], validate, asyncHandler(storyController.view));
router.delete("/:id", [storyIdParam], validate, asyncHandler(storyController.remove));

module.exports = router;
