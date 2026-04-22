const { supabaseAdmin } = require("../config/supabase");
const { assert } = require("../utils/validators");

async function listNotifications(req, res) {
  const userId = Number(req.user.sub);
  assert(Number.isFinite(userId), "Forbidden", 403);

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return res.json(data || []);
}

async function unreadCount(req, res) {
  const userId = Number(req.user.sub);
  assert(Number.isFinite(userId), "Forbidden", 403);
  const { count, error } = await supabaseAdmin
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) throw error;
  return res.json({ count: count || 0 });
}

async function markNotificationRead(req, res) {
  const userId = Number(req.user.sub);
  const notificationId = Number(req.params.id);
  assert(Number.isFinite(userId), "Forbidden", 403);
  assert(Number.isFinite(notificationId), "Invalid notification id");

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return res.json(data);
}

async function markAllRead(req, res) {
  const userId = Number(req.user.sub);
  assert(Number.isFinite(userId), "Forbidden", 403);
  const { error } = await supabaseAdmin.from("notifications").update({ is_read: true }).eq("user_id", userId);
  if (error) throw error;
  return res.json({ message: "All notifications marked as read" });
}

module.exports = {
  listNotifications,
  unreadCount,
  markNotificationRead,
  markAllRead,
};
