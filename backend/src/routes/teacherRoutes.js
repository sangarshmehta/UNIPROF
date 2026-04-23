const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireTeacher } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { teacherProfileSchema } = require("../validation/schemas");
const {
  listTeachers,
  getTeacherById,
  getSlots,
  getMySlots,
  teacherDashboard,
  teacherBookings,
  getTeacherProfile,
  updateTeacherProfile,
  acceptTeacherBooking,
  rejectTeacherBooking,
  publishSlot,
  deleteSlot,
} = require("../controllers/teacherController");

const router = express.Router();

router.get("/teachers", asyncHandler(listTeachers));
router.get("/teachers/:id", asyncHandler(getTeacherById));
router.get("/slots/:teacher_id", asyncHandler(getSlots));
router.get("/teacher/slots", requireAuth, requireTeacher, asyncHandler(getMySlots));

router.get("/teacher/dashboard", requireAuth, requireTeacher, asyncHandler(teacherDashboard));
router.get("/teacher/profile", requireAuth, requireTeacher, asyncHandler(getTeacherProfile));
router.put("/teacher/profile", requireAuth, requireTeacher, validate(teacherProfileSchema), asyncHandler(updateTeacherProfile));
router.get("/teacher/bookings", requireAuth, requireTeacher, asyncHandler(teacherBookings));
router.post("/teacher/bookings/:id/accept", requireAuth, requireTeacher, asyncHandler(acceptTeacherBooking));
router.post("/teacher/bookings/:id/reject", requireAuth, requireTeacher, asyncHandler(rejectTeacherBooking));

router.post("/teacher/slots", requireAuth, requireTeacher, asyncHandler(publishSlot));
router.delete("/teacher/slots/:id", requireAuth, requireTeacher, asyncHandler(deleteSlot));


module.exports = router;
