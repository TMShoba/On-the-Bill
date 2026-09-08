import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBookings } from "../Services/bookingService";
import { getStoredUser } from "../Services/authService";
import type { Booking } from "../Types/Artist";

export default function Dashboard() {
  const user = getStoredUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Dashboard
      </h1>
      <p className="mt-1 text-slate-500">
        {user
          ? `Welcome back, ${user.name}.`
          : "Welcome back. Here's an overview of your activity."}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pending requests</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {loading ? "—" : pending}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Confirmed bookings
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {loading ? "—" : confirmed}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total requests</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {loading ? "—" : bookings.length}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Recent requests</h2>

        {loading && (
          <p className="mt-3 text-sm text-slate-500">Loading...</p>
        )}

        {!loading && bookings.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">
            No requests yet.{" "}
            <Link to="/artists" className="font-medium text-emerald-600">
              Browse artists
            </Link>{" "}
            and send a booking request.
          </p>
        )}

        {!loading && bookings.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100">
            {bookings
              .slice()
              .reverse()
              .map((b) => (
                <li
                  key={b.id}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {b.artistName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {b.clientName} · {b.eventDate}
                      {b.venue ? ` · ${b.venue}` : ""}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      b.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700"
                        : b.status === "declined"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
