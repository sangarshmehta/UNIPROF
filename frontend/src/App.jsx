import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentProfilePage from "./pages/student/StudentProfilePage.jsx";
import TeacherDetailsPage from "./pages/student/TeacherDetailsPage.jsx";
import WishlistPage from "./pages/student/WishlistPage.jsx";
import StudentBookingsPage from "./pages/student/StudentBookingsPage.jsx";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import EditTeacherProfilePage from "./pages/teacher/EditTeacherProfilePage.jsx";
import TeacherSchedulePage from "./pages/teacher/TeacherSchedulePage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";

function DashboardRedirect() {
  const { role } = useAuth();
  return <Navigate to={role === "teacher" ? "/teacher" : role === "admin" ? "/admin" : "/student"} replace />;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="app-page">
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* --- Student Routes --- */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute role="student">
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/wishlist"
            element={
              <ProtectedRoute role="student">
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/bookings"
            element={
              <ProtectedRoute role="student">
                <StudentBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/:id"
            element={
              <ProtectedRoute role="student">
                <TeacherDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* --- Teacher Routes --- */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/bookings"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/schedule"
            element={
              <ProtectedRoute role="teacher">
                <TeacherSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/profile/edit"
            element={
              <ProtectedRoute role="teacher">
                <EditTeacherProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

