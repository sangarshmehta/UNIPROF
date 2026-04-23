const { z } = require("zod");

const roleSchema = z.enum(["student", "teacher", "admin"]);

const registerSchema = z.object({
  name: z.string().trim().min(1),
  gender: z.enum(["Male", "Female", "Other"]),
  email: z.string().trim().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const studentProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  profile_image: z.string().trim().optional(),
  phone_number: z.string().trim().optional(),
});

const teacherProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  subjects: z.array(z.string().trim().min(1)).optional(),
  room_number: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  profile_image: z.string().trim().optional(),
  education_level: z.string().trim().optional(),
  specialization: z.array(z.string().trim().min(1)).optional(),
  languages: z.array(z.string().trim().min(1)).optional(),
});

const bookingSchema = z.object({
  teacher_id: z.number().int().positive(),
  time_slot: z.string().trim().min(1),
});

const ratingSchema = z.object({
  teacher_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().optional(),
});

const teacherApprovalSchema = z.object({
  approved: z.boolean(),
});

const roleUpdateSchema = z.object({
  role: roleSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  studentProfileSchema,
  teacherProfileSchema,
  bookingSchema,
  ratingSchema,
  teacherApprovalSchema,
  roleUpdateSchema,
};
