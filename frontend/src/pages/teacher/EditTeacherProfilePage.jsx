import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { getTeacherProfile, updateTeacherProfile } from "../../services/teacherService";
import { uploadProfileImage } from "../../services/uploadService";

const LANGUAGES_LIST = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", "Hindi", "Arabic",
  "Portuguese", "Russian", "Bengali", "Punjabi", "Telugu", "Marathi", "Tamil", "Urdu",
  "Turkish", "Korean", "Vietnamese", "Italian", "Thai", "Gujarati", "Kannada", "Malayalam"
]; // Truncated for brevity, would usually be 100+

export default function EditTeacherProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    education_level: "BE / BTech",
    specialization: [],
    languages: [],
    subjects: [],
    bio: "",
    profile_image: "",
  });

  const [langSearch, setLangSearch] = useState("");
  const [specInput, setSpecInput] = useState("");
  const [subjectInput, setSubjectInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const p = await getTeacherProfile();
        setForm({
          name: p.name || "",
          education_level: p.education_level || "BE / BTech",
          specialization: p.specialization || [],
          languages: p.languages || [],
          subjects: p.subjects || [],
          bio: p.bio || "",
          profile_image: p.profile_image || "",
        });
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await uploadProfileImage(file);
      setForm(prev => ({ ...prev, profile_image: res.public_url }));
    } catch (err) {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function toggleArrayItem(key, item) {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter(i => i !== item)
        : [...prev[key], item]
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await updateTeacherProfile(form);
      setSuccess("Profile updated! Redirecting...");
      setTimeout(() => navigate("/teacher"), 1000);
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AppShell><EmptyState text="Loading profile..." loading /></AppShell>;

  return (
    <AppShell title="Profile Settings">
      <div className="max-w-4xl mx-auto space-y-8 fade-in">
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Image & Identity */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-8 flex flex-col items-center text-center">
                <div className="relative group">
                  <img
                    src={form.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&size=256`}
                    className="w-32 h-32 rounded-3xl object-cover mb-4 shadow-lg border-4 border-white"
                    alt="Profile"
                  />
                  <label className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs">
                    {uploading ? "..." : "Change"}
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                </div>
                <h3 className="font-bold text-xl">{form.name}</h3>
                <p className="text-[var(--text-muted)] text-sm font-medium">Mentor ID: #{form.id || 'N/A'}</p>
              </div>

              <div className="glass-card p-8 space-y-4">
                <h4 className="text-[10px] uppercase font-black tracking-widest opacity-60">Education Level</h4>
                <div className="flex flex-col gap-2">
                  {['BE / BTech', 'ME / MTech', 'PhD'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, education_level: lvl }))}
                      className={`w-full py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${form.education_level === lvl ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-light)]'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Detailed Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60">Professional Bio</label>
                  <textarea
                    className="w-full bg-[var(--bg-light)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[var(--text-main)] outline-none focus:ring-2 focus:ring-blue-400 min-h-[120px]"
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Share your expertise and background..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60">Specialization Tags</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      className="flex-1 bg-[var(--bg-light)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm outline-none"
                      value={specInput}
                      onChange={e => setSpecInput(e.target.value)}
                      placeholder="e.g. Machine Learning"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (specInput.trim()) toggleArrayItem('specialization', specInput.trim());
                          setSpecInput("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => { if (specInput.trim()) toggleArrayItem('specialization', specInput.trim()); setSpecInput(""); }}
                      className="btn-primary px-4 py-2 text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.specialization.map(s => (
                      <span key={s} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full flex items-center gap-2">
                        {s} <button type="button" onClick={() => toggleArrayItem('specialization', s)} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60">Language Proficiency (Multi-select)</label>
                  <div className="relative">
                    <input
                      className="w-full bg-[var(--bg-light)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm outline-none"
                      placeholder="Search languages..."
                      value={langSearch}
                      onChange={e => setLangSearch(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 h-40 overflow-y-auto p-2 bg-[var(--bg-light)] rounded-xl border border-[var(--border-color)]">
                    {LANGUAGES_LIST.filter(l => l.toLowerCase().includes(langSearch.toLowerCase())).map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => toggleArrayItem('languages', l)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition-all ${form.languages.includes(l) ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-white text-[var(--text-muted)]'}`}
                      >
                        {l} {form.languages.includes(l) && "✓"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => navigate("/teacher")} className="px-8 py-4 font-bold text-[var(--text-muted)]">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary px-12 py-4 rounded-2xl shadow-xl shadow-blue-200">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="lg:col-span-3 glass-card p-8 space-y-6 mt-4">
              <h3 className="text-xl font-bold border-b border-[var(--border-color)] pb-4">Account Settings</h3>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Dark Mode</h4>
                  <p className="text-[var(--text-muted)] text-sm">Toggle application theme</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
                    const newTheme = isDark ? "light" : "dark";
                    document.documentElement.setAttribute("data-theme", newTheme);
                    localStorage.setItem("theme", newTheme);
                    window.dispatchEvent(new Event('storage')); // Trigger update if needed
                  }}
                  className="px-6 py-2 bg-[var(--bg-light)] border border-[var(--border-color)] rounded-xl font-bold transition-all hover:bg-[var(--border-color)]"
                >
                  Toggle Theme
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                <div>
                  <h4 className="font-bold text-red-500">Log Out</h4>
                  <p className="text-[var(--text-muted)] text-sm">Sign out of your account</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    ["uniprof_token", "uniprof_role", "uniprof_name", "uniprof_gender"].forEach(k => localStorage.removeItem(k));
                    window.location.href = "/login";
                  }}
                  className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold transition-all hover:bg-red-100"
                >
                  Sign Out
                </button>
              </div>
            </div>

          </div>
        </form>

        <Alert message={error} />
        <Alert type="success" message={success} />
      </div>
    </AppShell>
  );
}
