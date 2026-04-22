import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { getTeacherProfile, updateTeacherProfile } from "../../services/teacherService";
import { uploadProfileImage } from "../../services/uploadService";

function parseSubjects(input) {
  return String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function EditTeacherProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    gender: "Male",
    subjectsText: "",
    room_number: "",
    bio: "",
    profile_image: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const profile = await getTeacherProfile();
        setForm({
          name: profile?.name || "",
          gender: profile?.gender || "Male",
          subjectsText: Array.isArray(profile?.subjects) ? profile.subjects.join(", ") : "",
          room_number: profile?.room_number || "",
          bio: profile?.bio || "",
          profile_image: profile?.profile_image || "",
        });
      } catch (requestError) {
        setError(requestError.message || "Failed to load teacher profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const subjectsPreview = useMemo(() => parseSubjects(form.subjectsText), [form.subjectsText]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.room_number.trim()) nextErrors.room_number = "Room number is required.";
    if (!subjectsPreview.length) nextErrors.subjectsText = "At least one subject is required.";

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setSaving(true);
      await updateTeacherProfile({
        name: form.name.trim(),
        gender: form.gender,
        subjects: subjectsPreview,
        room_number: form.room_number.trim(),
        bio: form.bio.trim(),
        profile_image: form.profile_image.trim(),
      });
      setSuccess("Profile updated successfully. Redirecting...");
      setTimeout(() => {
        navigate("/teacher", { replace: true });
      }, 850);
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
    <AppShell title="Edit Teacher Profile" subtitle="Update your profile details shown to students.">
      <div className="max-w-3xl glass-card rounded-2xl border border-white/70 p-6 shadow-sm">
        {loading ? (
          <EmptyState text="Loading current profile..." loading />
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 ${
                  fieldErrors.name ? "border-red-400" : "border-slate-300 focus:border-indigo-400"
                }`}
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Teacher name"
              />
              {fieldErrors.name ? <p className="input-error-text">{fieldErrors.name}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Subjects (comma separated)</label>
              <input
                className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 ${
                  fieldErrors.subjectsText ? "border-red-400" : "border-slate-300 focus:border-indigo-400"
                }`}
                value={form.subjectsText}
                onChange={(event) => setForm((prev) => ({ ...prev, subjectsText: event.target.value }))}
                placeholder="Data Structures, Algorithms"
              />
              {fieldErrors.subjectsText ? <p className="input-error-text">{fieldErrors.subjectsText}</p> : null}
              {subjectsPreview.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {subjectsPreview.map((subject) => (
                    <span key={subject} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
                      {subject}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Gender</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                value={form.gender}
                onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Room Number</label>
              <input
                className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 ${
                  fieldErrors.room_number ? "border-red-400" : "border-slate-300 focus:border-indigo-400"
                }`}
                value={form.room_number}
                onChange={(event) => setForm((prev) => ({ ...prev, room_number: event.target.value }))}
                placeholder="B-204"
              />
              {fieldErrors.room_number ? <p className="input-error-text">{fieldErrors.room_number}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Bio</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                value={form.bio}
                onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                placeholder="Write a short professional bio..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                onChange={handleImageUpload}
              />
              {uploading ? <p className="text-xs text-slate-500 mt-1">Uploading image...</p> : null}
              {form.profile_image ? (
                <div className="mt-2 flex items-center gap-3">
                  <img src={form.profile_image} alt="Profile preview" className="h-12 w-12 rounded-lg object-cover border border-slate-200" />
                  <p className="text-xs text-slate-600 break-all">{form.profile_image}</p>
                </div>
              ) : null}
            </div>

            <Alert message={error} />
            <Alert type="success" message={success} />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 transition"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/teacher")}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
