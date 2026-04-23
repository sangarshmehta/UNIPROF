const { supabaseAdmin } = require("../config/supabase");
const { assert } = require("../utils/validators");

async function getMyStudent(req, res) {
  const studentId = Number(req.user.student_id);
  assert(Number.isFinite(studentId), "Forbidden", 403);

  const { data, error } = await supabaseAdmin.from("students").select("*").eq("id", studentId).maybeSingle();
  if (error) throw error;
  assert(data, "Student not found", 404);
  return res.json(data);
}

async function updateMyStudent(req, res) {
  const studentId = Number(req.user.student_id);
  assert(Number.isFinite(studentId), "Forbidden", 403);

  const payload = {};
  if (req.body?.name !== undefined) payload.name = String(req.body.name).trim();
  if (req.body?.gender !== undefined) payload.gender = String(req.body.gender).trim();
  if (req.body?.profile_image !== undefined) payload.profile_image = String(req.body.profile_image).trim();
  if (req.body?.phone_number !== undefined) payload.phone_number = String(req.body.phone_number).trim();

  const { data, error } = await supabaseAdmin
    .from("students")
    .update(payload)
    .eq("id", studentId)
    .select("*")
    .single();
  if (error) throw error;
  return res.json(data);
}

async function getWishlist(req, res) {
  const studentId = Number(req.user.student_id);
  assert(Number.isFinite(studentId), "Forbidden", 403);

  const { data, error } = await supabaseAdmin
    .from("wishlist")
    .select("*, teacher:teachers(*)")
    .eq("student_id", studentId);
  if (error) throw error;
  return res.json(data || []);
}

async function toggleWishlist(req, res) {
  const studentId = Number(req.user.student_id);
  const teacherId = Number(req.params.id);
  assert(Number.isFinite(studentId), "Forbidden", 403);

  const { data: existing, error: checkError } = await supabaseAdmin
    .from("wishlist")
    .select("*")
    .eq("student_id", studentId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  
  if (checkError) throw checkError;

  if (existing) {
    const { error: delError } = await supabaseAdmin
      .from("wishlist")
      .delete()
      .eq("id", existing.id);
    if (delError) throw delError;
    return res.json({ removed: true });
  } else {
    const { data, error: insError } = await supabaseAdmin
      .from("wishlist")
      .insert({ student_id: studentId, teacher_id: teacherId })
      .select("*")
      .single();
    if (insError) throw insError;
    return res.json(data);
  }
}

module.exports = { getMyStudent, updateMyStudent, getWishlist, toggleWishlist };

