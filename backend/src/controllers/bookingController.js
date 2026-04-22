const { supabaseAdmin } = require("../config/supabase");
const { assert } = require("../utils/validators");
const { createNotification } = require("../services/notificationService");

const MAX_BOOKINGS_PER_SLOT = 10;

async function bookSlot(req, res) {
  const studentId = Number(req.user.student_id);
  const teacherId = Number(req.body?.teacher_id);
  const studentName = String(req.body?.student_name || "").trim();
  const timeSlot = String(req.body?.time_slot || "").trim();

  assert(Number.isFinite(studentId), "Forbidden", 403);
  assert(Number.isFinite(teacherId), "Invalid teacher id");
  assert(studentName, "student_name is required");
  assert(timeSlot, "time_slot is required");

  const { count, error: countError } = await supabaseAdmin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", teacherId)
    .eq("time_slot", timeSlot);
  if (countError) throw countError;
  assert((count || 0) < MAX_BOOKINGS_PER_SLOT, "This time slot is full for this teacher", 409);

  const { data, error } = await supabaseAdmin
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
    .single();

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

async function rateTeacher(req, res) {
  const teacherId = Number(req.body?.teacher_id);
  const rating = Number(req.body?.rating);
  assert(Number.isFinite(teacherId), "Invalid teacher id");
  assert(Number.isInteger(rating) && rating >= 1 && rating <= 5, "rating must be 1-5");

  const { data: teacher, error: teacherError } = await supabaseAdmin
    .from("teachers")
    .select("*")
    .eq("id", teacherId)
    .maybeSingle();
  if (teacherError) throw teacherError;
  assert(teacher, "Teacher not found", 404);

  const previousReviews = Number(teacher.total_reviews) || 0;
  const previousRating = Number(teacher.rating) || 0;
  const nextReviews = previousReviews + 1;
  const nextRating = Math.round((((previousRating * previousReviews + rating) / nextReviews) * 10)) / 10;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("teachers")
    .update({
      total_reviews: nextReviews,
      rating: nextRating,
    })
    .eq("id", teacherId)
    .select("*")
    .single();
  if (updateError) throw updateError;

  return res.json(updated);
}

module.exports = { bookSlot, rateTeacher };
