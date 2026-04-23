const express = require("express");
const multer = require("multer");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireTeacher } = require("../middleware/auth");
const { uploadProfileImage, uploadTimetableImage } = require("../controllers/uploadController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/uploads/profile-image", requireAuth, upload.single("file"), asyncHandler(uploadProfileImage));
router.post("/uploads/timetable-image", requireAuth, requireTeacher, upload.single("file"), asyncHandler(uploadTimetableImage));

module.exports = router;
