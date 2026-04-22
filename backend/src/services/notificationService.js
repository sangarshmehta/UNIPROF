const { supabaseAdmin } = require("../config/supabase");

async function createNotification({ userId, type, title, message, entityType = "", entityId = null }) {
  if (!userId) return null;
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      message,
      entity_type: entityType,
      entity_id: entityId,
      is_read: false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

module.exports = { createNotification };
