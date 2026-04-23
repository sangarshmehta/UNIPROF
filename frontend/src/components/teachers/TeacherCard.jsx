import { Link } from "react-router-dom";

export default function TeacherCard({ teacher }) {
  const { id, name, subjects, rating, profile_image, availability, timetable_image } = teacher;

  return (
    <div className="glass-card flex flex-col overflow-hidden group border border-[var(--border-color)]">
      {/* --- Header / Image --- */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="text-white text-xs font-bold">{rating || "New"}</span>
          </div>
          {availability && availability.length > 0 && (
            <div className="bg-green-500/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-green-400/30">
               <span className="text-white text-[10px] font-bold uppercase tracking-wider">Available</span>
            </div>
          )}
        </div>
      </div>

      {/* --- Content --- */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors text-[var(--text-main)]">{name}</h3>
        <p className="text-[var(--text-muted)] text-sm font-medium mb-4 line-clamp-1">
          {subjects?.join(", ") || "No subjects specified"}
        </p>

        {/* --- Availability Preview --- */}
        <div className="space-y-2 mb-6">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] opacity-60">Next Slots</div>
          <div className="flex flex-wrap gap-1.5">
            {availability && availability.length > 0 ? (
              availability.slice(0, 2).map((slot, i) => (
                <span key={i} className="text-[10px] font-semibold bg-[var(--bg-light)] px-2 py-1 rounded-md border border-[var(--border-color)] text-[var(--text-main)]">
                  {slot}
                </span>
              ))
            ) : (
              <span className="text-[10px] font-medium text-[var(--text-muted)] italic">No upcoming slots</span>
            )}
          </div>
        </div>

        <Link 
          to={`/teachers/${id}`}
          className="mt-auto btn-primary w-full group-hover:shadow-lg transition-all"
        >
          {timetable_image ? "View Timetable & Book" : "Book Session"}
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
