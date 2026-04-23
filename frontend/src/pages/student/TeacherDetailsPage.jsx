import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../../components/ui/Alert.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import SlotList from "../../components/slots/SlotList.jsx";
import { createBooking, getMyBookings } from "../../services/bookingService";
import { rateTeacher, toggleWishlist, getWishlist } from "../../services/studentService";
import { getTeacherById, getTeacherSlots } from "../../services/teacherService";
import { useAuth } from "../../context/AuthContext.jsx";

export default function TeacherDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const teacherId = Number(id);

  const [teacher, setTeacher] = useState(null);
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState("");
  const [rating, setRating] = useState("5");
  const [review, setReview] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    const [teacherData, slotData] = await Promise.all([
      getTeacherById(teacherId),
      getTeacherSlots(teacherId)
    ]);
    setTeacher(teacherData);
    setSlots(Array.isArray(slotData) ? slotData : []);

    if (role === "student") {
      const [bookingsResult, wishlistResult] = await Promise.allSettled([
        getMyBookings(),
        getWishlist()
      ]);

      if (bookingsResult.status === "fulfilled") {
        const bookings = bookingsResult.value;
        setMyBookings(Array.isArray(bookings) ? bookings : []);
      } else {
        setMyBookings([]);
      }

      if (wishlistResult.status === "fulfilled") {
        const wishlist = Array.isArray(wishlistResult.value) ? wishlistResult.value : [];
        setIsInWishlist(wishlist.some((item) => item.teacher_id === teacherId));
      } else {
        setIsInWishlist(false);
      }
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        await loadData();
      } catch (err) {
        setError(err.message || "Unable to load teacher");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teacherId]);

  const hasCompletedBooking = myBookings.some(
    (b) => b.teacher_id === teacherId && b.status === "completed"
  );

  async function handleBook(slot) {
    try {
      setBookingSlot(slot.time_slot);
      await createBooking({
        teacher_id: teacherId,
        time_slot: slot.time_slot,
      });
      setSuccess("Booking requested! Waiting for teacher approval.");
      await loadData();
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setBookingSlot("");
    }
  }

  async function handleRate(e) {
    e.preventDefault();
    try {
      await rateTeacher({ 
        teacher_id: teacherId, 
        rating: Number(rating),
        review: review.trim()
      });
      setSuccess("Thank you for your feedback!");
      await loadData();
    } catch (err) {
      setError(err.message || "Rating failed");
    }
  }

  async function handleToggleWishlist() {
    try {
      await toggleWishlist(teacherId);
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      setError("Failed to update wishlist");
    }
  }

  if (loading) return <EmptyState text="Loading profile..." loading />;
  if (!teacher) return <EmptyState text="Mentor not found." />;

  return (
      <div className="max-w-6xl mx-auto space-y-8 fade-in">
        
        {/* --- Top Profile Header --- */}
        <div className="glass-card overflow-hidden border-none shadow-2xl">
          <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
             <button 
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-bold hover:bg-white/30 transition-all"
             >
                ← Back
             </button>
             <button 
                onClick={handleToggleWishlist}
                className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md border border-white/20 transition-all ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}
             >
                {isInWishlist ? '❤️' : '🤍'}
             </button>
          </div>
          <div className="px-10 pb-10 relative">
            <div className="w-32 h-32 rounded-3xl bg-white p-1 absolute -top-16 shadow-xl overflow-hidden">
               <img 
                 src={teacher.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&size=256`} 
                 className="w-full h-full object-cover rounded-2xl"
                 alt={teacher.name}
               />
            </div>
            
            <div className="pt-20 flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight">{teacher.name}</h1>
                <p className="text-blue-600 font-bold text-lg">{teacher.department}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                    🎓 {teacher.education_level || "Academic"}
                  </span>
                  {teacher.specialization?.map(s => (
                    <span key={s} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                      ✨ {s}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="glass-card p-4 bg-yellow-50/30 border-yellow-200/50 flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-yellow-600">{teacher.rating?.toFixed(1) || "N/A"}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rating</div>
                </div>
                <div className="w-px h-10 bg-yellow-200/50"></div>
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-600">{teacher.total_reviews || 0}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Bio & Details */}
          <div className="lg:col-span-1 space-y-8">
             <section className="glass-card p-8 space-y-4">
                <h3 className="text-lg font-bold">About Mentor</h3>
                <p className="text-[var(--text-muted)] leading-relaxed font-medium">
                  {teacher.bio || "This mentor hasn't provided a bio yet."}
                </p>
                
                <div className="pt-4 space-y-4">
                   <div className="space-y-2">
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] opacity-60">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {teacher.languages?.map(lang => (
                          <span key={lang} className="text-xs font-bold bg-[var(--bg-light)] px-3 py-1 rounded-lg border border-[var(--border-color)]">
                            {lang}
                          </span>
                        )) || "English"}
                      </div>
                   </div>
                </div>
             </section>

             {/* Rating Section - ONLY visible after completion */}
             {hasCompletedBooking && (
                <section className="glass-card p-8 bg-blue-600 text-white border-none shadow-blue-200 shadow-xl">
                  <h3 className="text-lg font-bold mb-4">Rate your Experience</h3>
                  <form onSubmit={handleRate} className="space-y-4">
                    <select 
                      className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white outline-none font-bold"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                      <option value="4">⭐⭐⭐⭐ Good</option>
                      <option value="3">⭐⭐⭐ Average</option>
                      <option value="2">⭐⭐ Poor</option>
                      <option value="1">⭐ Terrible</option>
                    </select>
                    <textarea 
                      placeholder="Write a brief review..."
                      className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 outline-none text-sm min-h-[100px]"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    />
                    <button type="submit" className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all">
                      Submit Review
                    </button>
                  </form>
                </section>
             )}
          </div>

          {/* Right: Availability & Booking */}
          <div className="lg:col-span-2 space-y-8">
             <Alert message={error} />
             <Alert type="success" message={success} />
             
             <section className="glass-card p-8">
                <div className="flex justify-between items-end mb-8">
                   <div>
                      <h3 className="text-2xl font-black">Available Slots</h3>
                      <p className="text-[var(--text-muted)] font-medium">Select a slot to request a 1-on-1 session.</p>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-tighter bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                        Capacity: 10 students / slot
                      </span>
                   </div>
                </div>

                <SlotList 
                  slots={slots} 
                  onBook={handleBook} 
                  bookingSlot={bookingSlot} 
                />
             </section>

             <section className="glass-card p-8">
                <h3 className="text-2xl font-black mb-3">Timetable</h3>
                {teacher.timetable_image ? (
                  <div className="space-y-3">
                    <img src={teacher.timetable_image} alt={`${teacher.name} timetable`} className="w-full rounded-2xl border border-[var(--border-color)] max-h-[480px] object-contain bg-[var(--bg-light)]" />
                    <a href={teacher.timetable_image} target="_blank" rel="noreferrer" className="btn-primary">
                      View Timetable
                    </a>
                  </div>
                ) : (
                  <p className="text-[var(--text-muted)]">Timetable not uploaded yet.</p>
                )}
             </section>
          </div>
        </div>
      </div>
  );
}
