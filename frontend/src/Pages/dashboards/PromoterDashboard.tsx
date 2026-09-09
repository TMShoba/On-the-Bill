import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import MessagesPanel from "../../components/Messages/MessagesPanel";
import { getDemoGigs } from "../../Services/demoStore";
import { useAuth } from "../../context/AuthContext";
import type { Booking } from "../../Types/Artist";
import GigDetailsModal from "../../components/GigDetailsModal";

export default function PromoterDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [tick, setTick] = useState(0);
  const gigs = useMemo(
    () =>
      getDemoGigs().filter(
        (g) =>
          g.clientEmail === user?.email ||
          g.promoterName === user?.name
      ),
    [user, tick]
  );

  useEffect(() => {
    const onFocus = () => setTick((t) => t + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Promoter dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Hi {user?.name} — manage requests and messages
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/artists"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Browse Artists
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Your booking requests</h2>
        {gigs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No requests yet.{" "}
            <Link to="/artists" className="font-medium text-emerald-600">
              Find an artist
            </Link>{" "}
            and send a booking.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {gigs.map((g) => (
              <li
                key={g.id}
                className="flex cursor-pointer flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                onClick={() => setSelected(g)}
              >
                <div>
                  <p className="font-medium text-slate-900">{g.artistName}</p>
                  <p className="text-sm text-slate-500">
                    {g.eventDate} · {g.venue}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    g.status === "confirmed"
                      ? "bg-emerald-50 text-emerald-700"
                      : g.status === "declined"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {g.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <MessagesPanel />

      <GigDetailsModal
        open={Boolean(selected)}
        gig={selected}
        onClose={() => setSelected(null)}
        showReminderToggle={false}
      />
    </div>
  );
}
