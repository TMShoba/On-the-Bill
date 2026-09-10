import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ArtistDashboard from "./dashboards/ArtistDashboard";
import PromoterDashboard from "./dashboards/PromoterDashboard";
import NavBar from "../components/NavBar";

export default function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-dvh bg-slate-50 pb-mobile-nav">
      <NavBar />
      <div className="animate-fade-up">
        {user?.role === "artist" ? <ArtistDashboard /> : <PromoterDashboard />}
      </div>
    </div>
  );
}
