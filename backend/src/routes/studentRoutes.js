const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireStudent } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { bookingSchema, ratingSchema, studentProfileSchema } = require("../validation/schemas");
const { getMyStudent, updateMyStudent, getWishlist, toggleWishlist } = require("../controllers/studentController");
const { bookSlot, rateTeacher, getMyBookings } = require("../controllers/bookingController");

const router = express.Router();

router.get("/students/me", requireAuth, requireStudent, asyncHandler(getMyStudent));
router.put("/students/me", requireAuth, requireStudent, validate(studentProfileSchema), asyncHandler(updateMyStudent));
router.post("/book", requireAuth, requireStudent, validate(bookingSchema), asyncHandler(bookSlot));
router.post("/rate", requireAuth, requireStudent, validate(ratingSchema), asyncHandler(rateTeacher));

router.get("/bookings/me", requireAuth, requireStudent, asyncHandler(getMyBookings));
router.get("/wishlist", requireAuth, requireStudent, asyncHandler(getWishlist));
router.post("/wishlist/:id", requireAuth, requireStudent, asyncHandler(toggleWishlist));


module.exports = router;
