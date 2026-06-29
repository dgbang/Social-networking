const express = require("express");
const { body, param } = require("express-validator");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const requireAuth = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const emailRule = body("email").isEmail().withMessage("Valid email is required");
const passwordRule = body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters");
const tokenParamRule = param("token").isLength({ min: 16 }).withMessage("Token is required");

router.post(
  "/register",
  authLimiter,
  [
    emailRule,
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    passwordRule,
    body("fullName").trim().notEmpty().withMessage("Full name is required")
  ],
  validate,
  asyncHandler(authController.register)
);

router.post("/login", authLimiter, [emailRule, body("password").notEmpty()], validate, asyncHandler(authController.login));
router.get("/google", authLimiter, asyncHandler(authController.googleStart));
router.get("/google/callback", authLimiter, asyncHandler(authController.googleCallback));
router.post("/refresh-token", authLimiter, asyncHandler(authController.refresh));
router.post("/logout", authLimiter, asyncHandler(authController.logout));

router.post("/forgot-password", authLimiter, [emailRule], validate, asyncHandler(authController.forgotPassword));
router.post("/reset-password/:token", authLimiter, [tokenParamRule, passwordRule], validate, asyncHandler(authController.resetPassword));

router.get("/me", requireAuth, asyncHandler(authController.me));

module.exports = router;
