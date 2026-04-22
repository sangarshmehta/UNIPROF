import { Link } from "react-router-dom";
import SlotList from "../slots/SlotList.jsx";

export default function TeacherCard({
  teacher,
  onViewSlots,
  slots = [],
  slotsVisible = false,
  slotsLoading = false,
  slotError = "",
}) {
  return (
    <article className="glass-card rounded-2xl border border-white/70 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <h3 className="text-lg font-semibold">{teacher.name}</h3>
      <p className="text-sm text-slate-600 mt-1">{teacher.department || "Department not available"}</p>
      <p className="text-sm text-slate-600 mt-1">Room: {teacher.room_number || "-"}</p>
      <p className="text-sm text-slate-600 mt-1">
        Rating: {typeof teacher.rating === "number" ? teacher.rating.toFixed(1) : "-"} ({teacher.total_reviews || 0})
      </p>
      <p className="text-sm text-slate-600 mt-2 line-clamp-3">{teacher.bio || "No bio available."}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(teacher.subjects || []).map((subject) => (
          <span key={subject} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs">
            {subject}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onViewSlots(teacher.id)}
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 hover:bg-slate-50 transition"
        >
          {slotsVisible ? "Refresh Slots" : "View Slots"}
        </button>
        <Link
          to={`/teachers/${teacher.id}`}
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 transition"
        >
          Book Slot
        </Link>
      </div>

      {slotsVisible ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">Available Slots</h4>
          {slotsLoading ? <p className="text-xs text-slate-600">Loading slots...</p> : null}
          {slotError ? <p className="text-xs text-red-600">{slotError}</p> : null}
          {!slotsLoading && !slotError ? <SlotList slots={slots} /> : null}
        </div>
      ) : null}
    </article>
  );
}
