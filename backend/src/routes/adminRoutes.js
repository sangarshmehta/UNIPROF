const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { teacherApprovalSchema } = require("../validation/schemas");
const { adminUsers, adminBookings, setTeacherApproval, deleteUser } = require("../controllers/adminController");

const router = express.Router();

router.get("/admin/users", requireAuth, requireAdmin, asyncHandler(adminUsers));
router.get("/admin/bookings", requireAuth, requireAdmin, asyncHandler(adminBookings));
router.patch(
  "/admin/teachers/:teacherId/approval",
  requireAuth,
  requireAdmin,
  validate(teacherApprovalSchema),
  asyncHandler(setTeacherApproval),
);
router.delete("/admin/users/:userId", requireAuth, requireAdmin, asyncHandler(deleteUser));

module.exports = router;
