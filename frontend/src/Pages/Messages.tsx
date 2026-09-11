import { Navigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import MessagesPanel from "../components/Messages/MessagesPanel";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 pb-mobile-nav">
      <NavBar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-0 py-0 sm:px-4 sm:py-6">
        <div className="hidden px-1 pb-3 sm:block">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Messages
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Chat with promoters and artists about bookings
          </p>
        </div>
        <MessagesPanel variant="page" />
      </div>
      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
}
