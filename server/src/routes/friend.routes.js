const express = require("express");
const { param, query } = require("express-validator");
const friendController = require("../controllers/friend.controller");
const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const userIdParam = param("userId").isUUID().withMessage("Valid user id is required");
const limitRule = query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be from 1 to 50");

router.use(requireAuth);

router.get("/", [limitRule], validate, asyncHandler(friendController.list));
router.get("/requests", [limitRule], validate, asyncHandler(friendController.requests));
router.get("/suggestions", [limitRule], validate, asyncHandler(friendController.suggestions));
router.post("/request/:userId", [userIdParam], validate, asyncHandler(friendController.request));
router.put("/accept/:userId", [userIdParam], validate, asyncHandler(friendController.accept));
router.put("/reject/:userId", [userIdParam], validate, asyncHandler(friendController.reject));
router.delete("/:userId", [userIdParam], validate, asyncHandler(friendController.remove));

module.exports = router;
