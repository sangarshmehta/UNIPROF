const { supabaseAdmin } = require("../config/supabase");
const { assert } = require("../utils/validators");

async function adminUsers(req, res) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id,email,role,name,gender,is_active,student_id,teacher_id,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return res.json(data || []);
}

async function adminBookings(req, res) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return res.json(data || []);
}

async function setTeacherApproval(req, res) {
  const teacherId = Number(req.params.teacherId);
  const approved = Boolean(req.body?.approved);
  assert(Number.isFinite(teacherId), "Invalid teacher id");

  const { data, error } = await supabaseAdmin
    .from("teachers")
    .update({
      is_approved: approved,
      approved_at: approved ? new Date().toISOString() : null,
      approved_by: Number(req.user.sub),
    })
    .eq("id", teacherId)
    .select("*")
    .single();
  if (error) throw error;
  return res.json(data);
}

async function deleteUser(req, res) {
  const userId = Number(req.params.userId);
  assert(Number.isFinite(userId), "Invalid user id");
  assert(userId !== Number(req.user.sub), "Admin cannot delete own account", 400);

  const { data: target, error: targetError } = await supabaseAdmin
    .from("users")
    .select("id,student_id,teacher_id")
    .eq("id", userId)
    .maybeSingle();
  if (targetError) throw targetError;
  assert(target, "User not found", 404);

  const { error: userDeleteError } = await supabaseAdmin.from("users").delete().eq("id", userId);
  if (userDeleteError) throw userDeleteError;

  if (target.student_id) {
    const { error: studentDeleteError } = await supabaseAdmin.from("students").delete().eq("id", target.student_id);
    if (studentDeleteError) throw studentDeleteError;
  }
  if (target.teacher_id) {
    const { error: teacherDeleteError } = await supabaseAdmin.from("teachers").delete().eq("id", target.teacher_id);
    if (teacherDeleteError) throw teacherDeleteError;
  }

  return res.json({ message: "User deleted successfully" });
}

module.exports = {
  adminUsers,
  adminBookings,
  setTeacherApproval,
  deleteUser,
};
