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
    <article className="glass-card flex flex-col h-full bg-[var(--card-light)] p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-blue-200 dark:border-blue-800">
          {teacher.profile_image ? (
            <img src={teacher.profile_image} alt={teacher.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {teacher.name ? teacher.name.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[var(--text-main)] truncate" title={teacher.name}>{teacher.name}</h3>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{teacher.department || "Department TBA"}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              {typeof teacher.rating === "number" ? teacher.rating.toFixed(1) : "New"}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              {teacher.room_number || "TBA"}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5">
          {(teacher.subjects || []).slice(0, 3).map((subject) => (
            <span key={subject} className="px-2 py-0.5 bg-[var(--bg-light)] border border-[var(--border-color)] text-[var(--text-muted)] rounded-md text-[11px] font-medium uppercase tracking-wide">
              {subject}
            </span>
          ))}
          {(teacher.subjects || []).length > 3 && (
            <span className="px-2 py-0.5 bg-[var(--bg-light)] border border-[var(--border-color)] text-[var(--text-muted)] rounded-md text-[11px] font-medium uppercase tracking-wide">
              +{teacher.subjects.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex gap-2">
        <button
          type="button"
          onClick={() => onViewSlots(teacher.id)}
          className="flex-1 text-center py-2 text-sm font-medium border border-[var(--border-color)] text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-light)] transition-colors"
        >
          {slotsVisible ? "Hide Slots" : "Quick View"}
        </button>
        <Link
          to={`/teachers/${teacher.id}`}
          className="flex-1 text-center py-2 text-sm font-medium btn-primary rounded-xl"
        >
          View Profile
        </Link>
      </div>

      {slotsVisible ? (
        <div className="mt-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-light)] slide-up">
          <h4 className="text-sm font-semibold mb-3">Available Slots</h4>
          {slotsLoading ? <p className="text-xs text-[var(--text-muted)]">Loading slots...</p> : null}
          {slotError ? <p className="text-xs text-[var(--danger)]">{slotError}</p> : null}
          {!slotsLoading && !slotError ? <SlotList slots={slots} /> : null}
        </div>
      ) : null}
    </article>
  );
}
