const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const {
  listNotifications,
  unreadCount,
  markNotificationRead,
  markAllRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/notifications", requireAuth, asyncHandler(listNotifications));
router.get("/notifications/unread-count", requireAuth, asyncHandler(unreadCount));
router.post("/notifications/read-all", requireAuth, asyncHandler(markAllRead));
router.post("/notifications/:id/read", requireAuth, asyncHandler(markNotificationRead));

module.exports = router;
