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
    <AppShell title="Teacher Details" subtitle="Book slots and submit rating.">
      <button className="mb-4 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition" onClick={() => navigate(-1)}>
        Back
      </button>
      <Alert message={error} />
      <Alert type="success" message={success} />
      {loading ? <EmptyState text="Loading teacher..." /> : null}
      {teacher ? (
        <div className="space-y-4">
          <section className="glass-card rounded-2xl border border-white/70 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{teacher.name}</h2>
            <p className="text-sm text-slate-600 mt-1">{teacher.department}</p>
            <p className="text-sm text-slate-600 mt-1">Room: {teacher.room_number || "-"}</p>
            <p className="text-sm text-slate-600 mt-2">{teacher.bio || "No bio available."}</p>
          </section>

          <section className="glass-card rounded-2xl border border-white/70 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Book a slot</h3>
            <input
              className={`mb-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 ${
                fieldErrors.studentName ? "border-red-400" : "border-slate-300 focus:border-indigo-400"
              }`}
              placeholder="Enter your name"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
            />
            {fieldErrors.studentName ? <p className="input-error-text mb-2">{fieldErrors.studentName}</p> : null}
            <SlotList
              slots={slots}
              onBook={handleBook}
              bookingSlot={bookingSlot}
              disableBook={!studentName.trim()}
            />
            {!studentName.trim() ? (
              <p className="text-xs text-amber-700 mt-2">Enter your name to enable booking.</p>
            ) : null}
          </section>

          <section className="glass-card rounded-2xl border border-white/70 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Rate teacher</h3>
            <form className="flex items-center gap-2" onSubmit={handleRate}>
              <select
                className={`rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 ${
                  fieldErrors.rating ? "border-red-400" : "border-slate-300 focus:border-indigo-400"
                }`}
                value={rating}
                onChange={(event) => setRating(event.target.value)}
              >
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 transition">
                Submit
              </button>
            </form>
            {fieldErrors.rating ? <p className="input-error-text">{fieldErrors.rating}</p> : null}
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
