function getRoleFromEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (normalized.endsWith("@cumail.in")) return "teacher";
  if (normalized.endsWith("@cuchd.in")) return "student";
  return "";
}

function assert(condition, message, status = 400) {
  if (!condition) {
    const error = new Error(message);
    error.status = status;
    throw error;
  }
}

module.exports = { getRoleFromEmail, assert };
