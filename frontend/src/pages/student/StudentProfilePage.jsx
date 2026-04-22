import { useEffect, useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { getMyStudentProfile, updateMyStudentProfile } from "../../services/studentService";
import { uploadProfileImage } from "../../services/uploadService";

export default function StudentProfilePage() {
  const [form, setForm] = useState({ name: "", gender: "Male", profile_image: "", phone_number: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyStudentProfile();
        setForm({
          name: data?.name || "",
          gender: data?.gender || "Male",
          profile_image: data?.profile_image || "",
          phone_number: data?.phone_number || "",
        });
      } catch (requestError) {
        setError(requestError.message || "Could not load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }
    try {
      setSaving(true);
      await updateMyStudentProfile(form);
      setSuccess("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      setUploading(true);
      const result = await uploadProfileImage(file);
      setForm((prev) => ({ ...prev, profile_image: result?.public_url || "" }));
    } catch (requestError) {
      setError(requestError.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell title="My Profile" subtitle="Manage your student information.">
      <div className="max-w-xl glass-card rounded-2xl border border-white/70 p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600 animate-pulse">Loading profile...</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 ${
                fieldErrors.name ? "border-red-400" : "border-slate-300 focus:border-indigo-400"
              }`}
              placeholder="Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            {fieldErrors.name ? <p className="input-error-text">{fieldErrors.name}</p> : null}
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              value={form.gender}
              onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              onChange={handleImageUpload}
            />
            {uploading ? <p className="text-xs text-slate-500">Uploading image...</p> : null}
            {form.profile_image ? (
              <div className="flex items-center gap-3">
                <img src={form.profile_image} alt="Profile preview" className="h-12 w-12 rounded-lg object-cover border border-slate-200" />
                <p className="text-xs text-slate-600 break-all">{form.profile_image}</p>
              </div>
            ) : null}
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="Phone number"
              value={form.phone_number}
              onChange={(event) => setForm((prev) => ({ ...prev, phone_number: event.target.value }))}
            />
            <Alert message={error} />
            <Alert type="success" message={success} />
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-slate-800 transition"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
