const path = require("path");
const { supabaseAdmin } = require("../config/supabase");

function getPublicUrl(filePath) {
  const { data } = supabaseAdmin.storage.from("profile-images").getPublicUrl(filePath);
  return data?.publicUrl || "";
}

async function uploadFileToProfileBucket(req, res, folder) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const userId = String(req.user.sub || "");
  const ext = path.extname(req.file.originalname || "").toLowerCase() || ".jpg";
  const filePath = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  const { error } = await supabaseAdmin.storage.from("profile-images").upload(filePath, req.file.buffer, {
    contentType: req.file.mimetype,
    upsert: false,
  });
  if (error) throw error;

  return res.json({
    path: filePath,
    public_url: getPublicUrl(filePath),
  });
}

async function uploadProfileImage(req, res) {
  return uploadFileToProfileBucket(req, res, "profile");
}

async function uploadTimetableImage(req, res) {
  return uploadFileToProfileBucket(req, res, "timetable");
}

module.exports = { uploadProfileImage, uploadTimetableImage };
