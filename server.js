if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 5000;
const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;

const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const corsOptions = CORS_ORIGIN === "*"
  ? { origin: true }
  : {
      origin: CORS_ORIGIN.split(",").map((v) => v.trim()).filter(Boolean),
    };

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

function validateEmailAndRole(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const teacherRegex = /^[a-zA-Z0-9._%+-]+@cumail\.in$/;
  const studentRegex = /^[a-zA-Z0-9._%+-]+@cuchd\.in$/;

  if (teacherRegex.test(normalizedEmail)) return { valid: true, role: "teacher", email: normalizedEmail };
  if (studentRegex.test(normalizedEmail)) return { valid: true, role: "student", email: normalizedEmail };
  return { valid: false, role: null, email: normalizedEmail };
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");
  if (!token) return res.status(401).json({ message: "Missing Authorization token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

const requireTeacher = requireRole("teacher");
const requireStudent = requireRole("student");

const users = [
  {
    id: 1,
    email: "aarav.sharma@cumail.in",
    role: "teacher",
    teacher_id: 1,
    verified: true,
    password_hash: bcrypt.hashSync("Password@123", 10),
  },
  {
    id: 2,
    email: "shivam@cuchd.in",
    role: "student",
    student_id: 1,
    verified: true,
    password_hash: bcrypt.hashSync("Password@123", 10),
  },
];

const students = [
  {
    id: 1,
    name: "Shivam Kumar",
    email: "shivam@cuchd.in",
    profile_image: "",
    phone_number: "+91-99999-00000",
  },
];

function canTeacherSeeStudentPhone({ teacherId, studentId }) {
  return bookings.some(
    (b) =>
      b.teacher_id === teacherId &&
      b.student_id === studentId &&
      b.status === "accepted",
  );
}

function serializeStudentProfile({ viewer, student }) {
  const base = {
    id: student.id,
    name: student.name,
    email: student.email,
    profile_image: student.profile_image || "",
  };

  if (!viewer) return base;

  if (viewer.role === "student" && viewer.student_id === student.id) {
    return { ...base, phone_number: student.phone_number };
  }

  if (viewer.role === "teacher" && Number.isFinite(viewer.teacher_id)) {
    const allowed = canTeacherSeeStudentPhone({
      teacherId: viewer.teacher_id,
      studentId: student.id,
    });
    return allowed ? { ...base, phone_number: student.phone_number } : base;
  }

  return base;
}

const teachers = [
  {
    id: 1,
    profile_image:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=256&q=80",
    name: "Aarav Sharma",
    email: "aarav.sharma@uniprof.edu",
    department: "Computer Science",
    subjects: ["Data Structures", "Algorithms", "Operating Systems"],
    room_number: "B-204",
    bio: "Focuses on systems and algorithms; enjoys mentoring competitive programming.",
    achievements: ["Best Faculty Award 2024", "Published 12 research papers"],
    experience_years: 8,
    availability: ["Mon 10:00-12:00", "Wed 14:00-16:00", "Fri 10:00-11:00"],
    rating: 4.7,
    total_reviews: 132,
  },
  {
    id: 2,
    profile_image:
      "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=256&q=80",
    name: "Neha Verma",
    email: "neha.verma@uniprof.edu",
    department: "Mathematics",
    subjects: ["Linear Algebra", "Calculus", "Discrete Mathematics"],
    room_number: "A-115",
    bio: "Passionate about building intuition through problem-solving and proofs.",
    achievements: ["University Teaching Excellence 2023"],
    experience_years: 11,
    availability: ["Tue 09:00-11:00", "Thu 13:00-15:00"],
    rating: 4.8,
    total_reviews: 98,
  },
  {
    id: 3,
    profile_image: "",
    name: "Rohit Mehta",
    email: "rohit.mehta@uniprof.edu",
    department: "Electronics",
    subjects: ["Digital Systems", "Microprocessors", "Embedded Systems"],
    room_number: "C-310",
    bio: "Hands-on learning with labs and real-world embedded projects.",
    achievements: ["Patent: Low-power IoT sensor node"],
    experience_years: 6,
    availability: ["Mon 15:00-17:00", "Thu 10:00-12:00"],
    rating: 4.5,
    total_reviews: 76,
  },
];

const bookings = [];
let nextBookingId = 1;
const MAX_BOOKINGS_PER_SLOT = 10;

let nextUserId = users.length + 1;

async function createMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

async function sendVerificationEmail({ toEmail, verifyUrl }) {
  const transporter = await createMailTransporter();
  const from = process.env.SMTP_FROM || "no-reply@myuniversity.edu";

  const info = await transporter.sendMail({
    from,
    to: toEmail,
    subject: "Verify your email",
    text: `Verify your email by opening: ${verifyUrl}`,
    html: `<p>Verify your email by clicking:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  return { previewUrl: previewUrl || null };
}

app.get("/api/test", (req, res) => {
  res.send("API working");
});

app.get("/", (req, res) => {
  res.send("Server running");
});

app.get("/teachers", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({
      message: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.",
    });
  }

  const { data, error } = await supabase.from("teachers").select("*");
  if (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch teachers" });
  }
  return res.json(data || []);
});

app.post("/api/register", async (req, res) => {
  const emailInput = String(req.body?.email ?? "");
  const password = String(req.body?.password ?? "");

  const { valid, role, email } = validateEmailAndRole(emailInput);
  if (!valid) return res.status(400).json({ message: "Invalid university email" });

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ message: "User already exists" });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiresAt = Date.now() + 1000 * 60 * 30; // 30 minutes

  const user = {
    id: nextUserId++,
    email,
    role,
    verified: false,
    verification_token: verificationToken,
    verification_token_expires_at: tokenExpiresAt,
    password_hash: await bcrypt.hash(password, 10),
  };

  users.push(user);

  const verifyUrl = `${APP_BASE_URL}/api/verify-email/${verificationToken}`;

  try {
    const { previewUrl } = await sendVerificationEmail({ toEmail: email, verifyUrl });
    return res.status(201).json({
      message: "Registered successfully. Please verify your email before logging in.",
      previewUrl,
      ...(previewUrl ? { verifyUrl } : {}),
    });
  } catch (e) {
    return res.status(500).json({
      message:
        "Registered, but failed to send verification email. Check SMTP settings and try again.",
    });
  }
});

app.get("/api/verify-email/:token", (req, res) => {
  const token = String(req.params.token || "");
  const user = users.find((u) => u.verification_token === token);
  if (!user) return res.status(400).json({ message: "Invalid verification token" });

  if (user.verified) return res.json({ message: "Email already verified" });

  if (
    typeof user.verification_token_expires_at === "number" &&
    Date.now() > user.verification_token_expires_at
  ) {
    return res.status(400).json({ message: "Verification token expired" });
  }

  user.verified = true;
  user.verification_token = null;
  user.verification_token_expires_at = null;

  return res.json({ message: "Email verified successfully" });
});

async function handleLogin(req, res) {
  const emailInput = String(req.body?.email ?? "");
  const password = String(req.body?.password ?? "");

  if (!emailInput || !password) {
    return res.status(400).json({ message: "Invalid input. Required: email, password" });
  }

  const { valid, role, email } = validateEmailAndRole(emailInput);
  if (!valid) return res.status(400).json({ message: "Invalid university email" });

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  if (!user.verified) {
    return res.status(403).json({ message: "Email not verified" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password" });

  const roleMeta =
    user.role === "teacher"
      ? { teacher_id: user.teacher_id }
      : user.role === "student"
        ? { student_id: user.student_id }
        : {};

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, ...roleMeta },
    JWT_SECRET,
    { expiresIn: "2h" },
  );

  return res.json({ token, role: role });
}

app.post("/api/login", handleLogin);
app.post("/api/auth/login", handleLogin);

app.get("/api/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

app.get("/api/teachers", (req, res) => {
  res.json(teachers);
});

app.get("/api/teachers/:id", (req, res) => {
  const id = Number(req.params.id);
  const teacher = teachers.find((t) => t.id === id);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });
  return res.json(teacher);
});

app.get("/api/students/me", requireAuth, requireStudent, (req, res) => {
  const studentId = Number(req.user.student_id);
  const student = students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });
  return res.json(serializeStudentProfile({ viewer: req.user, student }));
});

app.put("/api/students/me", requireAuth, requireStudent, (req, res) => {
  const studentId = Number(req.user.student_id);
  const student = students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });

  const name = req.body?.name != null ? String(req.body.name).trim() : undefined;
  const profile_image =
    req.body?.profile_image != null ? String(req.body.profile_image).trim() : undefined;
  const phone_number =
    req.body?.phone_number != null ? String(req.body.phone_number).trim() : undefined;

  if (name !== undefined) student.name = name;
  if (profile_image !== undefined) student.profile_image = profile_image;
  if (phone_number !== undefined) student.phone_number = phone_number;

  return res.json(serializeStudentProfile({ viewer: req.user, student }));
});

app.get("/api/students/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const student = students.find((s) => s.id === id);
  if (!student) return res.status(404).json({ message: "Student not found" });

  if (req.user.role === "student" && Number(req.user.student_id) !== id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json(serializeStudentProfile({ viewer: req.user, student }));
});

app.post("/api/book", requireAuth, requireStudent, (req, res) => {
  const student_name = String(req.body?.student_name ?? "").trim();
  const teacher_id = Number(req.body?.teacher_id);
  const time_slot = String(req.body?.time_slot ?? "").trim();

  if (!student_name || !Number.isFinite(teacher_id) || !time_slot) {
    return res.status(400).json({
      message: "Invalid input. Required: student_name, teacher_id, time_slot",
    });
  }

  const teacher = teachers.find((t) => t.id === teacher_id);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });

  const existingCount = bookings.filter(
    (b) => b.teacher_id === teacher_id && b.time_slot === time_slot,
  ).length;
  if (existingCount >= MAX_BOOKINGS_PER_SLOT) {
    return res
      .status(409)
      .json({ message: "This time slot is full for this teacher" });
  }

  const booking = {
    id: nextBookingId++,
    student_name,
    student_id: Number(req.user.student_id),
    student_email: req.user.email,
    teacher_id,
    time_slot,
    status: "pending",
    created_at: new Date().toISOString(),
    accepted_at: null,
  };
  bookings.push(booking);

  return res.status(201).json(booking);
});

app.get("/api/slots/:teacher_id", (req, res) => {
  const teacherId = Number(req.params.teacher_id);
  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });

  const knownSlots = new Set(Array.isArray(teacher.availability) ? teacher.availability : []);
  bookings
    .filter((b) => b.teacher_id === teacherId)
    .forEach((b) => knownSlots.add(b.time_slot));

  const slots = Array.from(knownSlots).map((slot) => {
    const booked_count = bookings.filter(
      (b) => b.teacher_id === teacherId && b.time_slot === slot,
    ).length;
    const remaining_slots = Math.max(0, MAX_BOOKINGS_PER_SLOT - booked_count);
    const status =
      booked_count >= 10
        ? "Full"
        : booked_count >= 7
          ? "Few slots left"
          : "Available";
    return {
      time_slot: slot,
      booked_count,
      remaining_slots,
      status,
    };
  });

  return res.json(slots);
});

app.get("/api/teacher/dashboard", requireAuth, requireTeacher, (req, res) => {
  const teacherId = Number(req.user.teacher_id);
  if (!Number.isFinite(teacherId)) return res.status(403).json({ message: "Forbidden" });
  const teacherBookings = bookings.filter((b) => b.teacher_id === teacherId);
  const acceptedBookings = teacherBookings.filter((b) => b.status === "accepted");
  return res.json({
    total_bookings: teacherBookings.length,
    accepted_bookings: acceptedBookings.length,
    pending_bookings: teacherBookings.length - acceptedBookings.length,
  });
});

app.get("/api/teacher/bookings", requireAuth, requireTeacher, (req, res) => {
  const teacherId = Number(req.user.teacher_id);
  if (!Number.isFinite(teacherId)) return res.status(403).json({ message: "Forbidden" });

  const result = bookings
    .filter((b) => b.teacher_id === teacherId)
    .map((b) => {
      const student = students.find((s) => s.id === b.student_id) || null;
      return {
        ...b,
        student: student ? serializeStudentProfile({ viewer: req.user, student }) : null,
      };
    });

  return res.json(result);
});

app.post("/api/teacher/bookings/:id/accept", requireAuth, requireTeacher, (req, res) => {
  const teacherId = Number(req.user.teacher_id);
  if (!Number.isFinite(teacherId)) return res.status(403).json({ message: "Forbidden" });

  const bookingId = Number(req.params.id);
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.teacher_id !== teacherId) return res.status(403).json({ message: "Forbidden" });

  booking.status = "accepted";
  booking.accepted_at = new Date().toISOString();

  const student = students.find((s) => s.id === booking.student_id) || null;
  return res.json({
    ...booking,
    student: student ? serializeStudentProfile({ viewer: req.user, student }) : null,
  });
});

app.post("/api/rate", requireAuth, requireStudent, (req, res) => {
  const teacher_id = Number(req.body?.teacher_id);
  const rating = Number(req.body?.rating);

  const isValidRating =
    Number.isFinite(rating) && Number.isInteger(rating) && rating >= 1 && rating <= 5;
  if (!Number.isFinite(teacher_id) || !isValidRating) {
    return res
      .status(400)
      .json({ message: "Invalid input. Required: teacher_id, rating (1-5)" });
  }

  const teacher = teachers.find((t) => t.id === teacher_id);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });

  const prevReviews = Number(teacher.total_reviews) || 0;
  const prevAvg = Number(teacher.rating) || 0;

  const newTotal = prevReviews + 1;
  const newAvg = (prevAvg * prevReviews + rating) / newTotal;

  teacher.total_reviews = newTotal;
  teacher.rating = Math.round(newAvg * 10) / 10;

  return res.json(teacher);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", env: NODE_ENV });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${NODE_ENV})`);
});

