import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import TeacherCard from "../../components/teachers/TeacherCard.jsx";
import { getTeacherSlots, getTeachers } from "../../services/teacherService";

export default function StudentDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slotsByTeacher, setSlotsByTeacher] = useState({});
  const [visibleSlotsByTeacher, setVisibleSlotsByTeacher] = useState({});
  const [loadingSlotsByTeacher, setLoadingSlotsByTeacher] = useState({});
  const [slotErrorByTeacher, setSlotErrorByTeacher] = useState({});

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  const [filterSubject, setFilterSubject] = useState("");
  const [filterRating, setFilterRating] = useState("");

  useEffect(() => {
    async function loadTeachers() {
      try {
        setLoading(true);
        setError("");
        const data = await getTeachers();
        setTeachers(Array.isArray(data) ? data : []);
      } catch (requestError) {
        setError(requestError.message || "Failed to load teachers");
      } finally {
        setLoading(false);
      }
    }
    loadTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        !searchQuery ||
        (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.subjects && t.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchSubject =
        !filterSubject || (t.subjects && t.subjects.includes(filterSubject));

      const matchRating =
        !filterRating || (t.rating && t.rating >= parseFloat(filterRating));

      return matchSearch && matchSubject && matchRating;
    });
  }, [teachers, searchQuery, filterSubject, filterRating]);

  // Extract unique subjects for the filter dropdown
  const allSubjects = useMemo(() => {
    const subs = new Set();
    teachers.forEach((t) => {
      if (t.subjects && Array.isArray(t.subjects)) {
        t.subjects.forEach((s) => subs.add(s));
      }
    });
    return Array.from(subs).sort();
  }, [teachers]);

  async function handleViewSlots(teacherId) {
    setVisibleSlotsByTeacher((prev) => ({ ...prev, [teacherId]: !prev[teacherId] }));
    if (visibleSlotsByTeacher[teacherId]) return; // Toggle off

    setLoadingSlotsByTeacher((prev) => ({ ...prev, [teacherId]: true }));
    setSlotErrorByTeacher((prev) => ({ ...prev, [teacherId]: "" }));
    try {
      const slots = await getTeacherSlots(teacherId);
      setSlotsByTeacher((prev) => ({
        ...prev,
        [teacherId]: Array.isArray(slots) ? slots : [],
      }));
    } catch (requestError) {
      setSlotErrorByTeacher((prev) => ({
        ...prev,
        [teacherId]: requestError.message || "Failed to load slots",
      }));
    } finally {
      setLoadingSlotsByTeacher((prev) => ({ ...prev, [teacherId]: false }));
    }
  }

  return (
    <AppShell title="Student Dashboard" subtitle="Explore teachers and book meeting slots.">
      <Alert message={error} />
      
      {/* Filters Section */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-[var(--card-light)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Subject</label>
          <select 
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-light)] px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {allSubjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Minimum Rating</label>
          <select 
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-light)] px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <option value="">Any Rating</option>
            <option value="4">4.0 & above</option>
            <option value="4.5">4.5 & above</option>
            <option value="5">5.0 Only</option>
          </select>
        </div>
      </div>

      {loading ? <EmptyState text="Loading teachers..." loading /> : null}
      {!loading && !filteredTeachers.length ? <EmptyState text="No teachers found matching your criteria." /> : null}
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredTeachers.map((teacher) => (
          <TeacherCard
            key={teacher.id}
            teacher={teacher}
            onViewSlots={handleViewSlots}
            slots={slotsByTeacher[teacher.id] || []}
            slotsVisible={Boolean(visibleSlotsByTeacher[teacher.id])}
            slotsLoading={Boolean(loadingSlotsByTeacher[teacher.id])}
            slotError={slotErrorByTeacher[teacher.id] || ""}
          />
        ))}
      </div>
    </AppShell>
  );
}
