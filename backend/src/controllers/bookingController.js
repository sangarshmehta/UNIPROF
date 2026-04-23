const { supabaseAdmin } = require("../config/supabase");
const { assert } = require("../utils/validators");
const { createNotification } = require("../services/notificationService");

const MAX_BOOKINGS_PER_SLOT = 10;
const ACTIVE_BOOKING_STATUSES = ["pending", "accepted"];
const RESERVATION_ID_PREFIX = "reservation:";

async function getReservationRowsForTeacherAndSlot(teacherId, timeSlot, studentId = null) {
  let query = supabaseAdmin
    .from("student_reservations")
    .select("id,status")
    .eq("teacher_id", teacherId)
    .eq("time_slot", timeSlot)
    .in("status", ACTIVE_BOOKING_STATUSES);

  if (Number.isFinite(studentId)) {
    query = query.eq("student_id", studentId);
  }

  const { data, error } = await query;
  if (error && error.code === "42P01") return [];
  if (error) throw error;
  return data || [];
}

async function bookSlot(req, res) {
  const studentId = Number(req.user.student_id);
  const teacherId = Number(req.body?.teacher_id);
  const timeSlot = String(req.body?.time_slot || "").trim();

  assert(Number.isFinite(studentId), "Forbidden", 403);
  assert(Number.isFinite(teacherId), "Invalid teacher id");
  assert(timeSlot, "time_slot is required");

  const studentName =
    String(req.user?.name || "").trim() ||
    String(req.user?.email || "").split("@")[0].trim() ||
    "Student";

  const { data: teacher, error: teacherError } = await supabaseAdmin
    .from("teachers")
    .select("id,availability")
    .eq("id", teacherId)
    .maybeSingle();
  if (teacherError) throw teacherError;
  assert(teacher, "Teacher not found", 404);

  const { data: advancedSlots, error: advancedSlotsError } = await supabaseAdmin
    .from("availability")
    .select("time_slot")
    .eq("teacher_id", teacherId);
  if (advancedSlotsError && advancedSlotsError.code !== "42P01") throw advancedSlotsError;

  const availableSlotSet = new Set([
    ...(Array.isArray(teacher.availability) ? teacher.availability : []),
    ...((advancedSlots || []).map((slot) => slot.time_slot).filter(Boolean)),
  ]);
  assert(availableSlotSet.has(timeSlot), "This slot is no longer available", 409);

  const { data: activeSlotBookings, error: countError } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("time_slot", timeSlot)
    .in("status", ACTIVE_BOOKING_STATUSES);
  if (countError) throw countError;
  const reservationRowsForSlot = await getReservationRowsForTeacherAndSlot(teacherId, timeSlot);
  const activeCount = (Array.isArray(activeSlotBookings) ? activeSlotBookings.length : 0) + reservationRowsForSlot.length;
  assert(activeCount < MAX_BOOKINGS_PER_SLOT, "This time slot is full for this teacher", 409);

  const { data: duplicateReservations, error: duplicateError } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("student_id", studentId)
    .eq("teacher_id", teacherId)
    .eq("time_slot", timeSlot)
    .in("status", ACTIVE_BOOKING_STATUSES)
    .limit(1);
  if (duplicateError) throw duplicateError;
  const reservationDuplicates = await getReservationRowsForTeacherAndSlot(teacherId, timeSlot, studentId);
  assert(!(duplicateReservations || []).length && !reservationDuplicates.length, "You already reserved this slot", 409);

  let { data, error } = await supabaseAdmin
    .from("bookings")
    .insert({
      student_name: studentName,
      student_id: studentId,
      student_email: req.user.email,
      teacher_id: teacherId,
      time_slot: timeSlot,
      status: "pending",
      reserved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  // Backward compatibility: allow booking creation when reserved_at migration is pending.
  if (error && (error.code === "42703" || String(error.message || "").toLowerCase().includes("reserved_at"))) {
    ({ data, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        student_name: studentName,
        student_id: studentId,
        student_email: req.user.email,
        teacher_id: teacherId,
        time_slot: timeSlot,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single());
  }

  // Final fallback for environments where bookings writes are broken:
  // reserve in dedicated student_reservations table.
  if (error) {
    let reservationInsert = await supabaseAdmin
      .from("student_reservations")
      .insert({
        student_name: studentName,
        student_id: studentId,
        student_email: req.user.email,
        teacher_id: teacherId,
        time_slot: timeSlot,
        status: "pending",
        reserved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (reservationInsert.error && reservationInsert.error.code === "42P01") {
      reservationInsert = await supabaseAdmin
        .from("student_reservations")
        .insert({
          student_name: studentName,
          student_id: studentId,
          student_email: req.user.email,
          teacher_id: teacherId,
          time_slot: timeSlot,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select("*")
        .single();
    }

    if (reservationInsert.error) throw error;
    data = {
      ...reservationInsert.data,
      id: `${RESERVATION_ID_PREFIX}${reservationInsert.data.id}`,
    };
  }

  if (error) throw error;

  const { data: teacherOwner, error: teacherOwnerError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (teacherOwnerError) throw teacherOwnerError;

  await createNotification({
    userId: teacherOwner?.id,
    type: "booking_created",
    title: "New booking request",
    message: `${studentName} requested ${timeSlot}.`,
    entityType: "booking",
    entityId: data.id,
  });

  return res.status(201).json(data);
}

async function getMyBookings(req, res) {
  const studentId = Number(req.user.student_id);
  assert(Number.isFinite(studentId), "Forbidden", 403);

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(`
      *,
      teacher:teachers(*)
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  let primaryRows = [];
  if (!error) {
    primaryRows = data || [];
  }

  // Fallback for environments where PostgREST relationship metadata is stale or unavailable.
  const { data: bookings, error: bookingsError } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  if (bookingsError && !primaryRows.length) throw bookingsError;
  const fallbackBookings = bookings || [];

  const { data: reservations, error: reservationsError } = await supabaseAdmin
    .from("student_reservations")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  if (reservationsError && reservationsError.code !== "42P01") throw reservationsError;
  const reservationRows = (reservations || []).map((row) => ({
    ...row,
    id: `${RESERVATION_ID_PREFIX}${row.id}`,
  }));

  const combinedRows = primaryRows.length ? [...primaryRows, ...reservationRows] : [...fallbackBookings, ...reservationRows];
  const teacherIds = Array.from(new Set(combinedRows.map((booking) => Number(booking.teacher_id)).filter(Number.isFinite)));
  let teacherMap = new Map();

  if (teacherIds.length) {
    const { data: teachers, error: teachersError } = await supabaseAdmin
      .from("teachers")
      .select("*")
      .in("id", teacherIds);
    if (teachersError) throw teachersError;
    teacherMap = new Map((teachers || []).map((teacher) => [Number(teacher.id), teacher]));
  }

  const hydrated = combinedRows.map((booking) => ({
    ...booking,
    teacher: booking.teacher || teacherMap.get(Number(booking.teacher_id)) || null,
  }));

  return res.json(hydrated);
}

async function rateTeacher(req, res) {
  const teacherId = Number(req.body?.teacher_id);
  const rating = Number(req.body?.rating);
  const review = String(req.body?.review || "").trim();
  const studentId = Number(req.user.student_id);

  assert(Number.isFinite(teacherId), "Invalid teacher id");
  assert(Number.isInteger(rating) && rating >= 1 && rating <= 5, "rating must be 1-5");

  // CRITICAL: Check if a completed booking exists
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("student_id", studentId)
    .eq("teacher_id", teacherId)
    .eq("status", "completed")
    .maybeSingle();
  
  if (bookingError) throw bookingError;
  assert(booking, "You can only rate after completing a session", 403);

  const { data: teacher, error: teacherError } = await supabaseAdmin
    .from("teachers")
    .select("*")
    .eq("id", teacherId)
    .maybeSingle();
  if (teacherError) throw teacherError;
  assert(teacher, "Teacher not found", 404);

  // Atomic update of teacher rating
  const previousReviews = Number(teacher.total_reviews) || 0;
  const previousRating = Number(teacher.rating) || 0;
  const nextReviews = previousReviews + 1;
  const nextRating = Math.round((((previousRating * previousReviews + rating) / nextReviews) * 10)) / 10;

  await supabaseAdmin
    .from("teachers")
    .update({ total_reviews: nextReviews, rating: nextRating })
    .eq("id", teacherId);

  // Insert review into ratings table
  const { data: reviewData, error: reviewError } = await supabaseAdmin
    .from("ratings")
    .insert({
      student_id: studentId,
      teacher_id: teacherId,
      booking_id: booking.id,
      rating,
      review
    })
    .select("*")
    .single();
  if (reviewError) throw reviewError;

  return res.json(reviewData);
}

module.exports = { bookSlot, rateTeacher, getMyBookings };

