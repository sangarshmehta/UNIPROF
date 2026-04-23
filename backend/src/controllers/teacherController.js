const { supabaseAdmin } = require("../config/supabase");
const { assert } = require("../utils/validators");
const { createNotification } = require("../services/notificationService");

const MAX_BOOKINGS_PER_SLOT = 10;

async function listTeachers(req, res) {
  const { data, error } = await supabaseAdmin.from("teachers").select("*").eq("is_approved", true).order("id", { ascending: true });
  if (error) throw error;
  return res.json(data || []);
}

async function getTeacherById(req, res) {
  const id = Number(req.params.id);
  assert(Number.isFinite(id), "Invalid teacher id");
  const { data, error } = await supabaseAdmin.from("teachers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  assert(data, "Teacher not found", 404);
  return res.json(data);
}

async function getSlots(req, res) {
  const teacherId = Number(req.params.teacher_id);
  assert(Number.isFinite(teacherId), "Invalid teacher id");

  const { data: teacher, error: teacherError } = await supabaseAdmin
    .from("teachers")
    .select("id,availability")
    .eq("id", teacherId)
    .maybeSingle();
  if (teacherError) throw teacherError;
  assert(teacher, "Teacher not found", 404);

  const { data: bookings, error: bookingsError } = await supabaseAdmin
    .from("bookings")
    .select("time_slot")
    .eq("teacher_id", teacherId);
  if (bookingsError) throw bookingsError;

  // Extend to include new availability table (Advanced Scheduling)
  const { data: advancedSlots, error: advancedSlotsError } = await supabaseAdmin
    .from("availability")
    .select("time_slot")
    .eq("teacher_id", teacherId);
  if (advancedSlotsError && advancedSlotsError.code !== '42P01') { // Ignore if table doesn't exist yet
    console.error("Advanced slots error:", advancedSlotsError);
  }

  const allSlots = [
    ...(Array.isArray(teacher.availability) ? teacher.availability : []),
    ...(advancedSlots || []).map((s) => s.time_slot),
    ...(bookings || []).map((b) => b.time_slot),
  ];
  const slotSet = new Set(allSlots.filter(Boolean));

  const slots = Array.from(slotSet).map((slot) => {
    const bookedCount = (bookings || []).filter((b) => b.time_slot === slot).length;
    const remainingSlots = Math.max(0, MAX_BOOKINGS_PER_SLOT - bookedCount);
    let status = "Available";
    if (remainingSlots <= 0) status = "Full";
    else if (remainingSlots <= 3) status = "Few slots left";

    return {
      time_slot: slot,
      booked_count: bookedCount,
      remaining_slots: remainingSlots,
      status,
    };
  });

  return res.json(slots);
}

async function getMySlots(req, res) {
  const teacherId = Number(req.user.teacher_id);
  assert(Number.isFinite(teacherId), "Forbidden", 403);

  const { data, error } = await supabaseAdmin
    .from("availability")
    .select("id,time_slot,created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return res.json(data || []);
}

async function teacherDashboard(req, res) {
  const teacherId = Number(req.user.teacher_id);
  assert(Number.isFinite(teacherId), "Forbidden", 403);

  const { data, error } = await supabaseAdmin.from("bookings").select("status").eq("teacher_id", teacherId);
  if (error) throw error;
  const rows = data || [];
  const accepted = rows.filter((b) => b.status === "accepted").length;
  const total = rows.length;

  return res.json({
    total_bookings: total,
    accepted_bookings: accepted,
    pending_bookings: total - accepted,
  });
}

async function teacherBookings(req, res) {
  const teacherId = Number(req.user.teacher_id);
  assert(Number.isFinite(teacherId), "Forbidden", 403);

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return res.json(data || []);
}

async function getTeacherProfile(req, res) {
  const teacherId = Number(req.user.teacher_id);
  assert(Number.isFinite(teacherId), "Forbidden", 403);

  const { data, error } = await supabaseAdmin.from("teachers").select("*").eq("id", teacherId).maybeSingle();
  if (error) throw error;
  assert(data, "Teacher not found", 404);
  return res.json(data);
}

async function updateTeacherProfile(req, res) {
  const teacherId = Number(req.user.teacher_id);
  assert(Number.isFinite(teacherId), "Forbidden", 403);

  const payload = {};
  if (req.body?.name !== undefined) payload.name = String(req.body.name).trim();
  if (req.body?.gender !== undefined) payload.gender = String(req.body.gender).trim();
  if (req.body?.room_number !== undefined) payload.room_number = String(req.body.room_number).trim();
  if (req.body?.bio !== undefined) payload.bio = String(req.body.bio).trim();
  if (req.body?.profile_image !== undefined) payload.profile_image = String(req.body.profile_image).trim();
  if (req.body?.timetable_image !== undefined) payload.timetable_image = String(req.body.timetable_image).trim();
  
  // SaaS Extensions
  if (req.body?.education_level !== undefined) payload.education_level = String(req.body.education_level).trim();
  if (req.body?.specialization !== undefined) payload.specialization = Array.isArray(req.body.specialization) ? req.body.specialization : [];
  if (req.body?.languages !== undefined) payload.languages = Array.isArray(req.body.languages) ? req.body.languages : [];

  if (req.body?.subjects !== undefined) {
    const subjects = Array.isArray(req.body.subjects)
      ? req.body.subjects
      : String(req.body.subjects || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
    payload.subjects = subjects;
  }

  const { data, error } = await supabaseAdmin
    .from("teachers")
    .update(payload)
    .eq("id", teacherId)
    .select("*")
    .single();
  if (error) throw error;

  return res.json(data);
}

async function acceptTeacherBooking(req, res) {
  const teacherId = Number(req.user.teacher_id);
  const bookingId = Number(req.params.id);
  assert(Number.isFinite(teacherId), "Forbidden", 403);
  assert(Number.isFinite(bookingId), "Invalid booking id");

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();
  if (bookingError) throw bookingError;
  assert(booking, "Booking not found", 404);
  assert(Number(booking.teacher_id) === teacherId, "Forbidden", 403);

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select("*")
    .single();
  if (updateError) throw updateError;

  const { data: studentOwner, error: studentOwnerError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("student_id", booking.student_id)
    .maybeSingle();
  if (studentOwnerError) throw studentOwnerError;

  await createNotification({
    userId: studentOwner?.id,
    type: "booking_accepted",
    title: "Booking accepted",
    message: `Your booking for ${booking.time_slot} was accepted.`,
    entityType: "booking",
    entityId: updated.id,
  });

  return res.json(updated);
}

async function rejectTeacherBooking(req, res) {
  const teacherId = Number(req.user.teacher_id);
  const bookingId = Number(req.params.id);
  assert(Number.isFinite(teacherId), "Forbidden", 403);

  const { data: updated, error } = await supabaseAdmin
    .from("bookings")
    .update({ status: "rejected" })
    .eq("id", bookingId)
    .eq("teacher_id", teacherId)
    .select("*")
    .single();
  if (error) throw error;
  return res.json(updated);
}

async function publishSlot(req, res) {
  const teacherId = Number(req.user.teacher_id);
  assert(Number.isFinite(teacherId), "Forbidden", 403);
  const { time_slot } = req.body;
  assert(time_slot, "time_slot is required");

  const { data, error } = await supabaseAdmin
    .from("availability")
    .insert({ teacher_id: teacherId, time_slot })
    .select("*")
    .single();
  if (error) throw error;
  return res.status(201).json(data);
}

async function deleteSlot(req, res) {
  const teacherId = Number(req.user.teacher_id);
  const slotId = Number(req.params.id);
  assert(Number.isFinite(teacherId), "Forbidden", 403);

  const { error } = await supabaseAdmin
    .from("availability")
    .delete()
    .eq("id", slotId)
    .eq("teacher_id", teacherId);
  if (error) throw error;
  return res.status(204).send();
}

module.exports = {
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
};

