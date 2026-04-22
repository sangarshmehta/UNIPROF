import { useEffect, useState } from "react";
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

  async function handleViewSlots(teacherId) {
    setVisibleSlotsByTeacher((prev) => ({ ...prev, [teacherId]: true }));
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
      {loading ? <EmptyState text="Loading teachers..." loading /> : null}
      {!loading && !teachers.length ? <EmptyState text="No teachers found." /> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teachers.map((teacher) => (
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
