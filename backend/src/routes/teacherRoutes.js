const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireTeacher } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { teacherProfileSchema } = require("../validation/schemas");
const {
  listTeachers,
  getTeacherById,
  getSlots,
  teacherDashboard,
  teacherBookings,
  getTeacherProfile,
  updateTeacherProfile,
  acceptTeacherBooking,
} = require("../controllers/teacherController");

const router = express.Router();

router.get("/teachers", asyncHandler(listTeachers));
router.get("/teachers/:id", asyncHandler(getTeacherById));
router.get("/slots/:teacher_id", asyncHandler(getSlots));

router.get("/teacher/dashboard", requireAuth, requireTeacher, asyncHandler(teacherDashboard));
router.get("/teacher/profile", requireAuth, requireTeacher, asyncHandler(getTeacherProfile));
router.put("/teacher/profile", requireAuth, requireTeacher, validate(teacherProfileSchema), asyncHandler(updateTeacherProfile));
router.get("/teacher/bookings", requireAuth, requireTeacher, asyncHandler(teacherBookings));
router.post("/teacher/bookings/:id/accept", requireAuth, requireTeacher, asyncHandler(acceptTeacherBooking));

module.exports = router;
