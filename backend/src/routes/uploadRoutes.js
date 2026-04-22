const express = require("express");
const multer = require("multer");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const { uploadProfileImage } = require("../controllers/uploadController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/uploads/profile-image", requireAuth, upload.single("file"), asyncHandler(uploadProfileImage));

module.exports = router;
