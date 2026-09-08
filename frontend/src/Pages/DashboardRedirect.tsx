import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ArtistDashboard from "./dashboards/ArtistDashboard";
import PromoterDashboard from "./dashboards/PromoterDashboard";

export default function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "artist") {
    return <ArtistDashboard />;
  }

  return <PromoterDashboard />;
}
