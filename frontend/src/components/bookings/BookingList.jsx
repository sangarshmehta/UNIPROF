export default function BookingList({ bookings, onAccept, acceptingId }) {
  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <div key={booking.id} className="glass-card rounded-xl border border-white/70 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{booking.student_name}</p>
              <p className="text-sm text-slate-600">{booking.time_slot}</p>
              <p className="text-xs text-slate-500 mt-1">Status: {booking.status}</p>
            </div>
            {booking.status === "pending" ? (
              <button
                type="button"
                onClick={() => onAccept(booking.id)}
                disabled={acceptingId === booking.id}
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60 hover:bg-slate-800 transition"
              >
                {acceptingId === booking.id ? "Accepting..." : "Accept"}
              </button>
            ) : null}
          </div>
          {booking.student?.phone_number ? (
            <p className="text-xs text-slate-600 mt-2">Student phone: {booking.student.phone_number}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
