import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token = localStorage.getItem("uniprof_token") || "";
  const storedRole = localStorage.getItem("uniprof_role") || "";

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && storedRole !== role) {
    const route = storedRole === "teacher" ? "/teacher" : storedRole === "admin" ? "/admin" : "/student";
    return <Navigate to={route} replace />;
  }

  return children;
}
