import { Outlet, useLocation } from "react-router-dom";
import AppShell from "./AppShell.jsx";

function getTitle(pathname) {
  if (pathname.startsWith("/student/bookings")) return "My Bookings";
  if (pathname.startsWith("/student/wishlist")) return "My Wishlist";
  if (pathname.startsWith("/student/profile")) return "Profile Settings";
  if (pathname.startsWith("/student")) return "Search Teachers";
  if (pathname.startsWith("/teacher/schedule")) return "Manage Schedule";
  if (pathname.startsWith("/teacher/profile/edit")) return "Profile Settings";
  if (pathname.startsWith("/teacher")) return "Mentor Dashboard";
  if (pathname.startsWith("/admin")) return "Admin Dashboard";
  return "Dashboard";
}

export default function AppLayout() {
  const location = useLocation();
  return (
    <AppShell title={getTitle(location.pathname)}>
      <Outlet />
    </AppShell>
  );
}
