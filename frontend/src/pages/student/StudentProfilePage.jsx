import { useEffect, useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { getMyStudentProfile, updateMyStudentProfile } from "../../services/studentService";
import { uploadProfileImage } from "../../services/uploadService";

export default function StudentProfilePage() {
  const [form, setForm] = useState({ name: "", gender: "Male", profile_image: "", phone_number: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getMyStudentProfile();
        setForm({
          name: data?.name || "",
          gender: data?.gender || "Male",
          profile_image: data?.profile_image || "",
          phone_number: data?.phone_number || "",
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
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await updateMyStudentProfile(form);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Update failed");
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
            
            {/* Left: Image Card */}
            <div className="lg:col-span-1">
               <div className="glass-card p-8 flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                     <img 
                       src={form.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&size=256`} 
                       className="w-32 h-32 rounded-3xl object-cover shadow-lg border-4 border-white"
                       alt="Profile"
                     />
                     <label className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs">
                        {uploading ? "..." : "Replace"}
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                     </label>
                  </div>
                  <h3 className="font-bold text-xl">{form.name}</h3>
                  <p className="text-[var(--text-muted)] text-sm font-medium">Student Profile</p>
               </div>
            </div>

            {/* Right: Info Card */}
            <div className="lg:col-span-2 space-y-6">
               <div className="glass-card p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-60">Full Name</label>
                        <input 
                          className="w-full bg-[var(--bg-light)] border border-[var(--border-color)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-60">Gender</label>
                        <select 
                          className="w-full bg-[var(--bg-light)] border border-[var(--border-color)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                          value={form.gender}
                          onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest opacity-60">Phone Number (Private)</label>
                     <input 
                       className="w-full bg-[var(--bg-light)] border border-[var(--border-color)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                       value={form.phone_number}
                       onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                       placeholder="+1 (555) 000-0000"
                     />
                  </div>
               </div>

               <div className="flex justify-end gap-4">
                  <button type="submit" disabled={saving} className="btn-primary px-12 py-4 rounded-2xl shadow-xl shadow-blue-200">
                     {saving ? "Saving..." : "Save Profile"}
                  </button>
               </div>

               <Alert message={error} />
               <Alert type="success" message={success} />
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
      </div>
    </AppShell>
  );
}
