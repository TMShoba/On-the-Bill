import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import MessagesPanel from "../../components/Messages/MessagesPanel";
import { getDemoGigs } from "../../Services/demoStore";
import { useAuth } from "../../context/AuthContext";
import type { Booking } from "../../Types/Artist";
import GigDetailsModal from "../../components/GigDetailsModal";
import {
  getFavorites,
  removeFavorite,
  type SavedArtist,
} from "../../Services/favoritesStore";
import { resolveArtistImage } from "../../utils/imageCdn";

export default function PromoterDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [tick, setTick] = useState(0);
  const [favorites, setFavorites] = useState<SavedArtist[]>([]);

  const gigs = useMemo(
    () =>
      getDemoGigs().filter(
        (g) =>
          g.clientEmail === user?.email || g.promoterName === user?.name
      ),
    [user, tick]
  );

  useEffect(() => {
    const onFocus = () => setTick((t) => t + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (user) setFavorites(getFavorites(user.id));
  }, [user, tick]);

  function refreshFavorites() {
    if (user) setFavorites(getFavorites(user.id));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Promoter dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Hi {user?.name} — manage requests, shortlist, and messages
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Saved artists</h2>
            <p className="text-sm text-slate-500">
              Your shortlist for the next event — browse today, book later
            </p>
          </div>
          <Link
            to="/artists"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            + Add from browse
          </Link>
        </div>
        {favorites.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No saved artists yet. Tap the heart on any artist card while browsing
            to build your shortlist.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
              >
                <Link
                  to={`/artists/${a.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <img
                    src={resolveArtistImage(a.imageUrl, a.id, "card")}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {a.stageName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {a.genre} · {a.location}
                    </p>
                    <p className="text-xs font-semibold text-emerald-600">
                      R{a.rate.toLocaleString()}+
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  title="Remove from saved"
                  onClick={() => {
                    if (user) {
                      removeFavorite(user.id, a.id);
                      refreshFavorites();
                    }
                  }}
                  className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                >
                  ♥
                </button>
              </li>
            ))}
          </ul>
        )}
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
