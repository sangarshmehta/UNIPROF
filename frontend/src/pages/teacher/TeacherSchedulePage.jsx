import { useEffect, useState } from "react";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { getMyTeacherSlots, publishSlot, deleteSlot } from "../../services/teacherService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TeacherSchedulePage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [newSlot, setNewSlot] = useState({ day: "Monday", start: "09:00", end: "10:00", recurring: true });

  async function loadSlots() {
    try {
      setError("");
      const data = await getMyTeacherSlots();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load schedule");
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      await loadSlots();
      setLoading(false);
    }
    init();
  }, []);

  async function handleAddSlot(e) {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      const timeSlotString = `${newSlot.day.slice(0, 3)} ${newSlot.start} - ${newSlot.end}${newSlot.recurring ? ' (Weekly)' : ''}`;
      await publishSlot({ time_slot: timeSlotString });
      setSuccess("Slot added to your schedule!");
      await loadSlots();
    } catch (err) {
      setError(err.message || "Failed to add slot");
    }
  }

  async function handleDeleteSlot(id) {
    try {
      setError("");
      setSuccess("");
      await deleteSlot(id);
      setSuccess("Slot removed");
      await loadSlots();
    } catch (err) {
      setError(err.message || "Failed to delete slot");
    }
  }

  return (
      <div className="max-w-5xl mx-auto space-y-10 fade-in">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left: Create Slot Form */}
          <div className="lg:col-span-1">
            <section className="glass-card p-8 sticky top-24">
              <h3 className="text-xl font-black mb-6">Add New Slot</h3>
              <form onSubmit={handleAddSlot} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Select Day</label>
                  <select 
                    className="w-full bg-[var(--bg-light)] border border-[var(--border-color)] rounded-xl px-4 py-3 outline-none font-bold"
                    value={newSlot.day}
                    onChange={e => setNewSlot(p => ({ ...p, day: e.target.value }))}
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Start Time</label>
                    <input 
                      type="time" 
                      className="w-full bg-[var(--bg-light)] border border-[var(--border-color)] rounded-xl px-4 py-3 outline-none font-bold"
                      value={newSlot.start}
                      onChange={e => setNewSlot(p => ({ ...p, start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">End Time</label>
                    <input 
                      type="time" 
                      className="w-full bg-[var(--bg-light)] border border-[var(--border-color)] rounded-xl px-4 py-3 outline-none font-bold"
                      value={newSlot.end}
                      onChange={e => setNewSlot(p => ({ ...p, end: e.target.value }))}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-4 bg-[var(--bg-light)] rounded-xl border border-[var(--border-color)]">
                   <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-blue-400 text-blue-600 focus:ring-blue-500"
                    checked={newSlot.recurring}
                    onChange={e => setNewSlot(p => ({ ...p, recurring: e.target.checked }))}
                   />
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--text-main)]">Weekly Recurring</span>
                      <span className="text-[10px] text-blue-600 font-medium">Auto-publish every week</span>
                   </div>
                </label>

                <button type="submit" className="w-full btn-primary py-4 rounded-2xl shadow-xl shadow-blue-500/20">
                   Publish Availability
                </button>
              </form>
            </section>
          </div>

          {/* Right: Existing Slots List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-black">Your Weekly Slots</h3>
            
            <Alert message={error} />
            <Alert type="success" message={success} />

            {loading ? (
              <EmptyState text="Loading slots..." loading />
            ) : slots.length === 0 ? (
              <EmptyState text="You haven't added any slots yet." actionText="Retry" onAction={loadSlots} />
            ) : (
              <div className="space-y-4">
                {slots.map(slot => (
                  <div key={slot.id} className="glass-card p-6 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-[var(--bg-light)] rounded-2xl border border-[var(--border-color)] flex items-center justify-center text-blue-600 text-xl">
                           📅
                        </div>
                        <div>
                           <h4 className="font-bold text-lg">{slot.time_slot}</h4>
                           <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Active</span>
                              {slot.time_slot.includes('Weekly') && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Recurring</span>
                              )}
                           </div>
                        </div>
                     </div>
                     <button 
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-3 text-red-500 hover:bg-[var(--bg-light)] rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete slot"
                     >
                        🗑️
                     </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
