const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabaseAdmin } = require("../config/supabase");
const env = require("../config/env");
const { assert, getRoleFromEmail } = require("../utils/validators");

function buildToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      student_id: user.student_id || null,
      teacher_id: user.teacher_id || null,
    },
    env.JWT_SECRET,
    { expiresIn: "2h" },
  );
}

async function register(req, res) {
  const name = String(req.body?.name || "").trim();
  const gender = String(req.body?.gender || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const role = getRoleFromEmail(email);

  assert(name, "Name is required");
  assert(gender, "Gender is required");
  assert(role, "Invalid university email");
  assert(password.length >= 6, "Password must be at least 6 characters");

  const { data: existingUser, error: existingError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingError) throw existingError;
  assert(!existingUser, "User already exists", 409);

  let studentId = null;
  let teacherId = null;

  if (role === "student") {
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .insert({
        name,
        email,
        gender,
      })
      .select("id")
      .single();
    if (studentError) throw studentError;
    studentId = student.id;
  } else {
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from("teachers")
      .insert({
        name,
        email,
        gender,
      })
      .select("id")
      .single();
    if (teacherError) throw teacherError;
    teacherId = teacher.id;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { error: createUserError } = await supabaseAdmin.from("users").insert({
    email,
    password_hash: passwordHash,
    role,
    name,
    gender,
    student_id: studentId,
    teacher_id: teacherId,
  });
  if (createUserError) throw createUserError;

  return res.status(201).json({ message: "Registered successfully" });
}

async function login(req, res) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  assert(email && password, "Email and password are required");

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id,email,role,password_hash,student_id,teacher_id,name,gender")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  assert(user, "Invalid email or password", 401);

  const ok = await bcrypt.compare(password, user.password_hash || "");
  assert(ok, "Invalid email or password", 401);

  if (user.role === "teacher" && user.teacher_id) {
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from("teachers")
      .select("is_approved")
      .eq("id", user.teacher_id)
      .maybeSingle();
    if (teacherError) throw teacherError;
    assert(teacher?.is_approved, "Teacher profile is not approved by admin yet", 403);
  }

  const token = buildToken(user);
  return res.json({
    token,
    role: user.role,
    name: user.name || "",
    gender: user.gender || "",
  });
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, me };
