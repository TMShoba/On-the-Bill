import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { mockMessagingApi } from "../Services/mockMessagingApi";

export default function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const { data: unread = 0 } = useQuery({
    queryKey: ["unread", user?.id],
    queryFn: () => mockMessagingApi.totalUnread(user!.id),
    enabled: Boolean(user),
    refetchInterval: 5000,
  });

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            OB
          </span>
          The LineUp
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/artists" className={linkClass}>
            Artists
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/dashboard" className={linkClass}>
                <span className="relative">
                  Messages
                  {unread > 0 && (
                    <span className="absolute -right-3 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </span>
              </NavLink>
            </>
          )}

          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="ml-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden text-xs text-slate-500 lg:inline">
                {user?.name} · {user?.role}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Log out
              </button>
            </div>
          )}
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link to="/artists" className="text-sm font-medium text-slate-600">
            Artists
          </Link>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              Dashboard
              {unread > 0 ? ` (${unread})` : ""}
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
