import { useEffect, useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Alert from "../../components/ui/Alert.jsx";
import TeacherCard from "../../components/teachers/TeacherCard.jsx";
import { getWishlist } from "../../services/studentService";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getWishlist();
        // The wishlist items have a teacher relation
        setWishlist(Array.isArray(data) ? data.map(item => item.teacher) : []);
      } catch (err) {
        setError("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppShell title="My Wishlist">
      <div className="max-w-5xl mx-auto space-y-8 fade-in">
        <Alert message={error} />

        {loading ? (
          <EmptyState text="Loading your favorites..." loading />
        ) : wishlist.length === 0 ? (
          <EmptyState 
            text="Your wishlist is empty. Start exploring mentors!" 
            actionText="Browse Teachers" 
            onAction={() => window.location.href = '/student'} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map(teacher => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
