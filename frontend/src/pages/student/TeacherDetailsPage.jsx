import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import SlotList from "../../components/slots/SlotList.jsx";
import { createBooking } from "../../services/bookingService";
import { rateTeacher } from "../../services/studentService";
import { getTeacherById, getTeacherSlots } from "../../services/teacherService";

export default function TeacherDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const teacherId = Number(id);
  const [teacher, setTeacher] = useState(null);
  const [slots, setSlots] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [rating, setRating] = useState("5");
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    const [teacherData, slotData] = await Promise.all([getTeacherById(teacherId), getTeacherSlots(teacherId)]);
    setTeacher(teacherData);
    setSlots(Array.isArray(slotData) ? slotData : []);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        await loadData();
      } catch (requestError) {
        setError(requestError.message || "Unable to load teacher");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teacherId]);

  async function handleBook(slot) {
    setError("");
    setSuccess("");
    setFieldErrors((prev) => ({ ...prev, studentName: "" }));
    if (!studentName.trim()) {
      setFieldErrors((prev) => ({ ...prev, studentName: "Student name is required before booking." }));
      return;
    }
    try {
      setBookingSlot(slot.time_slot);
      const response = await createBooking({
        student_name: studentName.trim(),
        teacher_id: teacherId,
        time_slot: slot.time_slot,
      });
      setSuccess(`Booking created successfully. Booking ID: ${response.id}`);
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Booking failed");
    } finally {
      setBookingSlot("");
    }
  }

  async function handleRate(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors((prev) => ({ ...prev, rating: "" }));
    if (!rating) {
      setFieldErrors((prev) => ({ ...prev, rating: "Please choose a rating." }));
      return;
    }
    try {
      await rateTeacher({ teacher_id: teacherId, rating: Number(rating) });
      setSuccess("Rating submitted successfully.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Rating failed");
    }
  }

  return (
    <AppShell>
      <div className="mb-6 slide-up">
        <button 
          className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-blue-600 transition-colors" 
          onClick={() => navigate(-1)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Teachers
        </button>
      </div>

      <Alert message={error} />
      <Alert type="success" message={success} />
      
      {loading ? <EmptyState text="Loading teacher profile..." loading /> : null}
      
      {teacher ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 slide-up" style={{ animationDelay: "100ms" }}>
          
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <section className="glass-card bg-[var(--card-light)] border border-[var(--border-color)] overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="px-6 pb-6 relative">
                <div className="w-24 h-24 rounded-full border-4 border-[var(--card-light)] bg-white absolute -top-12 overflow-hidden flex items-center justify-center">
                  {teacher.profile_image ? (
                    <img src={teacher.profile_image} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-blue-600">
                      {teacher.name ? teacher.name.charAt(0).toUpperCase() : "?"}
                    </span>
                  )}
                </div>
                
                <div className="pt-14">
                  <h2 className="text-2xl font-bold text-[var(--text-main)]">{teacher.name}</h2>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{teacher.department || "Department TBA"}</p>
                  
                  <div className="flex items-center gap-4 mt-4 text-sm text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      {typeof teacher.rating === "number" ? teacher.rating.toFixed(1) : "New"} ({teacher.total_reviews || 0} reviews)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      {teacher.room_number || "TBA"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-card bg-[var(--card-light)] border border-[var(--border-color)] p-6">
              <h3 className="text-base font-bold text-[var(--text-main)] mb-3">About</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{teacher.bio || "No bio available."}</p>
              
              <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mt-6 mb-3">Subjects</h4>
              <div className="flex flex-wrap gap-2">
                {(teacher.subjects || []).length > 0 ? (
                  teacher.subjects.map((subject) => (
                    <span key={subject} className="px-3 py-1 bg-[var(--bg-light)] border border-[var(--border-color)] text-[var(--text-muted)] rounded-md text-xs font-medium">
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--text-muted)]">No subjects listed.</span>
                )}
              </div>
            </section>

            <section className="glass-card bg-[var(--card-light)] border border-[var(--border-color)] p-6">
              <h3 className="text-base font-bold text-[var(--text-main)] mb-3">Rate Teacher</h3>
              <form className="flex items-center gap-3" onSubmit={handleRate}>
                <select
                  className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-light)] px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Terrible</option>
                </select>
                <button type="submit" className="btn-primary py-2.5 px-5 text-sm">
                  Rate
                </button>
              </form>
              {fieldErrors.rating ? <p className="input-error-text mt-2">{fieldErrors.rating}</p> : null}
            </section>
          </div>

          {/* Right Column: Booking */}
          <div className="lg:col-span-2 space-y-6">
            <section className="glass-card bg-[var(--card-light)] border border-[var(--border-color)] p-6">
              <div className="mb-6 pb-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)]">Book a slot</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Select an available time to schedule a meeting.</p>
                </div>
              </div>

              <div className="mb-6 max-w-sm">
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-muted)]">Your Name</label>
                <input
                  className={`w-full rounded-xl border bg-[var(--bg-light)] px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 ${
                    fieldErrors.studentName ? "border-red-400" : "border-[var(--border-color)]"
                  }`}
                  placeholder="Enter your name"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                />
                {fieldErrors.studentName ? <p className="input-error-text mt-1">{fieldErrors.studentName}</p> : null}
              </div>

              <div className={!studentName.trim() ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
                <SlotList
                  slots={slots}
                  onBook={handleBook}
                  bookingSlot={bookingSlot}
                  disableBook={!studentName.trim()}
                />
              </div>

              {!studentName.trim() ? (
                <div className="mt-4 p-3 rounded-lg bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                  Please enter your name above to enable booking.
                </div>
              ) : null}
            </section>
          </div>

        </div>
      ) : null}
    </AppShell>
  );
}
