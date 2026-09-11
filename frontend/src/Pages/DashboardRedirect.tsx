import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ArtistDashboard from "./dashboards/ArtistDashboard";
import PromoterDashboard from "./dashboards/PromoterDashboard";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 pb-mobile-nav">
      <NavBar />
      <div className="flex-1 w-full animate-fade-up">
        {user?.role === "artist" ? <ArtistDashboard /> : <PromoterDashboard />}
      </div>
      <Footer />
    </div>
  );
}
