import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import TeacherCard from "../../components/teachers/TeacherCard.jsx";
import { getTeachers } from "../../services/teacherService";

export default function StudentDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [subject, setSubject] = useState(searchParams.get("subject") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [availability, setAvailability] = useState(searchParams.get("availability") || "");

  useEffect(() => {
    async function loadTeachers() {
      try {
        setLoading(true);
        const data = await getTeachers();
        setTeachers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load teachers");
      } finally {
        setLoading(false);
      }
    }
    loadTeachers();
  }, []);

  const allSubjects = useMemo(() => {
    const subs = new Set();
    teachers.forEach(t => t.subjects?.forEach(s => subs.add(s)));
    return Array.from(subs).sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase());
      const matchSubject = !subject || t.subjects?.includes(subject);
      const matchRating = !rating || (t.rating && t.rating >= parseFloat(rating));
      // Availability filter logic (simplified for now: if teacher has any slots)
      const matchAvailability = !availability || (t.availability && t.availability.length > 0);
      
      return matchSearch && matchSubject && matchRating && matchAvailability;
    });
  }, [teachers, search, subject, rating, availability]);

  return (
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- Unified Smart Search Bar --- */}
        <div className="glass-card p-2 flex flex-col md:flex-row items-stretch gap-2 shadow-xl border-blue-500/10">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
            <input 
              type="text"
              placeholder="Search by name..."
              className="w-full bg-transparent border-none px-10 py-4 outline-none text-lg font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="h-px md:h-10 w-full md:w-px bg-[var(--border-color)] my-auto opacity-50"></div>
          
          <div className="flex flex-wrap items-center gap-2 p-1">
            <select 
              className="bg-[var(--bg-light)] px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400 transition-all border-none"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">Subject</option>
              {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              className="bg-[var(--bg-light)] px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400 transition-all border-none"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="">Rating</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="5">5.0</option>
            </select>

            <select 
              className="bg-[var(--bg-light)] px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400 transition-all border-none"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="">Availability</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
            </select>
          </div>
        </div>

        {error && <Alert message={error} />}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-[var(--text-muted)] font-medium">Finding the best mentors for you...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <EmptyState text="No mentors match your search criteria. Try adjusting filters." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in">
            {filteredTeachers.map(teacher => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
      </div>
  );
}
