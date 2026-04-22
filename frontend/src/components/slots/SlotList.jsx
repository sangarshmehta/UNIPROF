const MAX_STUDENTS_PER_SLOT = 10;

function normalizeSlot(slot) {
  const bookedCount = Math.max(0, Number(slot?.booked_count) || 0);
  const remainingFromApi = Number(slot?.remaining_slots);
  const remainingSlots = Number.isFinite(remainingFromApi)
    ? Math.max(0, Math.min(MAX_STUDENTS_PER_SLOT, remainingFromApi))
    : Math.max(0, MAX_STUDENTS_PER_SLOT - bookedCount);

  const isFull = remainingSlots <= 0 || bookedCount >= MAX_STUDENTS_PER_SLOT;
  const isAlmostFull = !isFull && remainingSlots <= 3;

  return {
    ...slot,
    bookedCount: Math.min(MAX_STUDENTS_PER_SLOT, bookedCount),
    remainingSlots,
    isFull,
    isAlmostFull,
  };
}

export default function SlotList({ slots = [], onBook, bookingSlot = "", disableBook = false }) {
  if (!slots.length) {
    return <p className="text-xs text-slate-600">No slots available.</p>;
  }

  return (
    <ul className="space-y-2">
      {slots.map((rawSlot) => {
        const slot = normalizeSlot(rawSlot);
        return (
          <li key={slot.time_slot} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-slate-800">{slot.time_slot}</div>
                <div className="text-xs text-slate-600">
                  Booked: {slot.bookedCount}/{MAX_STUDENTS_PER_SLOT} | Remaining: {slot.remainingSlots}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide ${
                    slot.isFull
                      ? "bg-red-100 text-red-700"
                      : slot.isAlmostFull
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {slot.isFull ? "FULL" : slot.isAlmostFull ? "Few slots left" : "Available"}
                </span>
                {onBook ? (
                  <button
                    type="button"
                    onClick={() => onBook(slot)}
                    disabled={slot.isFull || disableBook || bookingSlot === slot.time_slot}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingSlot === slot.time_slot ? "Booking..." : "Book"}
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
