export default function SlotList({ slots = [], onBook, bookingSlot = "", disableBook = false }) {
  const MAX_CAPACITY = 10;

  if (!slots.length) {
    return (
      <div className="p-8 text-center glass-card border-dashed">
        <p className="text-[var(--text-muted)] font-medium italic">No availability slots published yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {slots.map((slot) => {
        const bookedCount = slot.booked_count || 0;
        const remaining = Math.max(0, MAX_CAPACITY - bookedCount);
        const isFull = remaining <= 0;
        const isBooking = bookingSlot === slot.time_slot;

        return (
          <div 
            key={slot.time_slot} 
            className={`glass-card p-4 flex items-center justify-between transition-all ${isFull ? 'opacity-60 grayscale' : 'hover:border-blue-500/30'}`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                📅 {slot.time_slot}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-24 h-2 bg-[var(--bg-light)] rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div 
                      className={`h-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${(bookedCount / MAX_CAPACITY) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">
                    {bookedCount}/{MAX_CAPACITY}
                  </span>
                </div>
                {remaining > 0 && remaining <= 3 && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Only {remaining} left!
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onBook(slot)}
              disabled={isFull || disableBook || isBooking}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isFull 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed' 
                  : isBooking
                    ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20 animate-pulse'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isFull ? "Full" : isBooking ? "Processing..." : "Reserve Slot"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
