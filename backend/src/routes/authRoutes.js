const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const { authRateLimiter } = require("../middleware/rateLimit");
const { validate } = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validation/schemas");
const { register, login, me } = require("../controllers/authController");

const router = express.Router();

router.post("/register", authRateLimiter, validate(registerSchema), asyncHandler(register));
router.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

module.exports = router;
