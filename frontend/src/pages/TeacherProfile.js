import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { clearAuthSession, getAuthHeaders } from "../utils/auth";

function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function defaultAvatarDataUri(name) {
  const text = initials(name) || "T";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#61dafb" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#8b5cf6" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="22" fill="url(#g)"/>
  <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="#0b1020" font-weight="800">${text}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const teacherId = Number(id);

  const [teacher, setTeacher] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [studentName, setStudentName] = useState("");
  const [activeSlot, setActiveSlot] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  const [ratingValue, setRatingValue] = useState("5");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingError, setRatingError] = useState("");

  const apiBaseUrl = useMemo(() => {
    return process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTeacher() {
      if (!Number.isFinite(teacherId)) {
        setError("Invalid teacher id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const [teacherRes, slotsRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/teachers/${teacherId}`),
          axios.get(`${apiBaseUrl}/api/slots/${teacherId}`),
        ]);
        if (cancelled) return;
        setTeacher(teacherRes.data || null);
        setSlots(Array.isArray(slotsRes.data) ? slotsRes.data : []);
        setActiveSlot("");
        setBookingMessage("");
        setBookingError("");
        setRatingMessage("");
        setRatingError("");
      } catch (e) {
        if (cancelled) return;
        setError("Teacher not found (or backend not running).");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    loadTeacher();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, teacherId]);

  async function refreshSlots(targetTeacherId) {
    const slotsRes = await axios.get(`${apiBaseUrl}/api/slots/${targetTeacherId}`);
    const nextSlots = Array.isArray(slotsRes.data) ? slotsRes.data : [];
    setSlots(nextSlots);
    return nextSlots;
  }

  async function submitBooking(slot) {
    const name = studentName.trim();
    const selectedSlot = String(slot || "").trim();

    setBookingMessage("");
    setBookingError("");

    if (!name || !selectedSlot || !teacher) {
      setBookingError("Please enter your name and choose an available time slot.");
      return;
    }

    try {
      setBookingLoading(true);
      setActiveSlot(selectedSlot);

      // Always verify latest slot availability before booking.
      const latestSlots = await refreshSlots(teacher.id);
      const latestSlot = latestSlots.find((s) => s.time_slot === selectedSlot);
      if (!latestSlot || latestSlot.status === "Full" || latestSlot.remaining_slots <= 0) {
        setBookingError("Slot Full");
        return;
      }

      const res = await axios.post(`${apiBaseUrl}/api/book`, {
        student_name: name,
        teacher_id: teacher.id,
        time_slot: selectedSlot,
      }, { headers: getAuthHeaders() });
      setBookingMessage(`Booked successfully (Booking ID: ${res.data?.id ?? "—"})`);
      await refreshSlots(teacher.id);
    } catch (err) {
      const status = err?.response?.status;
      const msg = status === 401
        ? "Session expired. Please login again."
        : status === 403
          ? "You are not allowed to book this slot."
          : status === 409
            ? "Slot Full"
            : err?.response?.data?.message || "Booking failed. Please try again.";
      setBookingError(msg);
    } finally {
      setActiveSlot("");
      setBookingLoading(false);
    }
  }

  async function submitRating(e) {
    e.preventDefault();

    if (!teacher) return;

    const rating = Number(ratingValue);
    const isValidRating =
      Number.isFinite(rating) && Number.isInteger(rating) && rating >= 1 && rating <= 5;

    setRatingMessage("");
    setRatingError("");

    if (!isValidRating) {
      setRatingError("Please select a rating between 1 and 5.");
      return;
    }

    const prevTeacher = teacher;
    const prevReviews = Number(prevTeacher.total_reviews) || 0;
    const prevAvg = Number(prevTeacher.rating) || 0;
    const nextTotal = prevReviews + 1;
    const nextAvg = (prevAvg * prevReviews + rating) / nextTotal;
    const nextRounded = Math.round(nextAvg * 10) / 10;

    setTeacher({
      ...prevTeacher,
      total_reviews: nextTotal,
      rating: nextRounded,
    });

    try {
      setRatingLoading(true);
      const res = await axios.post(`${apiBaseUrl}/api/rate`, {
        teacher_id: prevTeacher.id,
        rating,
      }, { headers: getAuthHeaders() });
      setTeacher(res.data || prevTeacher);
      setRatingMessage("Thanks! Your rating was submitted.");
    } catch (err) {
      setTeacher(prevTeacher);
      setRatingError(err?.response?.data?.message || "Rating failed. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  }

  function onLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Teacher Profile</h1>
            <p className="text-sm text-slate-500">ID: {id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              to="/"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Loading...
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {teacher ? (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  className="h-20 w-20 rounded-full object-cover border border-slate-200 bg-slate-100"
                  src={teacher.profile_image || defaultAvatarDataUri(teacher.name)}
                  alt={teacher?.name ? `${teacher.name} avatar` : "Teacher avatar"}
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatarDataUri(teacher.name);
                  }}
                />
                <div>
                  <h2 className="text-xl font-semibold">{teacher.name}</h2>
                  <p className="text-sm text-slate-600">
                    {teacher.department} • Room {teacher.room_number}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Book a slot
              </h3>
              <div className="grid gap-3">
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Student name"
                  autoComplete="name"
                />

                <div className="grid gap-2">
                  {slots.map((slot) => {
                    const isFull = slot.status === "Full";
                    const isFew = slot.status === "Few slots left";
                    const isBusy = bookingLoading && activeSlot === slot.time_slot;
                    return (
                      <div
                        key={slot.time_slot}
                        className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${
                          isFew
                            ? "border-amber-200 bg-amber-50"
                            : isFull
                              ? "border-slate-200 bg-slate-50"
                              : "border-slate-200 bg-white"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">{slot.time_slot}</div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            Remaining slots: {slot.remaining_slots}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                              isFew
                                ? "bg-amber-100 text-amber-800"
                                : isFull
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {slot.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => submitBooking(slot.time_slot)}
                            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isFull || bookingLoading}
                          >
                            {isBusy ? "Booking..." : "Book"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {bookingMessage ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {bookingMessage}
                  </div>
                ) : null}
                {bookingError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {bookingError}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Rate teacher
              </h3>
              <form onSubmit={submitRating} className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                  <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    value={ratingValue}
                    onChange={(e) => setRatingValue(e.target.value)}
                  >
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    disabled={ratingLoading}
                  >
                    {ratingLoading ? "Submitting..." : "Submit"}
                  </button>
                </div>
                {ratingMessage ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {ratingMessage}
                  </div>
                ) : null}
                {ratingError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {ratingError}
                  </div>
                ) : null}
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
                Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">Subjects</div>
                  <div>{Array.isArray(teacher.subjects) ? teacher.subjects.join(", ") : "—"}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Experience</div>
                  <div>
                    {typeof teacher.experience_years === "number"
                      ? `${teacher.experience_years} years`
                      : "—"}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-slate-500 mb-1">Bio</div>
                  <div>{teacher.bio || "—"}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Achievements</div>
                  {Array.isArray(teacher.achievements) && teacher.achievements.length ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {teacher.achievements.map((a, idx) => (
                        <li key={`${idx}-${a}`}>{a}</li>
                      ))}
                    </ul>
                  ) : (
                    <div>—</div>
                  )}
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Availability</div>
                  {Array.isArray(teacher.availability) && teacher.availability.length ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {teacher.availability.map((slot, idx) => (
                        <li key={`${idx}-${slot}`}>{slot}</li>
                      ))}
                    </ul>
                  ) : (
                    <div>—</div>
                  )}
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Rating</div>
                  <div>
                    {typeof teacher.rating === "number" ? teacher.rating.toFixed(1) : "—"} (
                    {teacher.total_reviews ?? 0} reviews)
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

