import { useMemo, useState } from "react";
import GigCalendar from "../../components/GigCalendar";
import GigDetailsModal from "../../components/GigDetailsModal";
import RemindersPanel from "../../components/RemindersPanel";
import MessagesPanel from "../../components/Messages/MessagesPanel";
import ArtistPhotoUpload from "../../components/ArtistPhotoUpload";
import EarningsStats from "../../components/EarningsStats";
import {
  getDemoGigs,
  toggleReminder,
  updateBookingStatus,
  DEMO_ARTIST,
} from "../../Services/demoStore";
import type { Booking } from "../../Types/Artist";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ArtistDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<Booking[]>(() => getDemoGigs());
  const [selected, setSelected] = useState<Booking | null>(null);
  const [dayGigs, setDayGigs] = useState<Booking[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [responding, setResponding] = useState(false);
  const artistId = user?.id || DEMO_ARTIST.id;

  const mine = useMemo(
    () => gigs.filter((g) => g.artistId === user?.id || true),
    [gigs, user]
  );

  const pendingRequests = useMemo(
    () => mine.filter((g) => g.status === "pending"),
    [mine]
  );

  const stats = useMemo(() => {
    return {
      confirmed: mine.filter((g) => g.status === "confirmed").length,
      pending: mine.filter((g) => g.status === "pending").length,
      declined: mine.filter((g) => g.status === "declined").length,
    };
  }, [mine]);

  function refresh() {
    setGigs(getDemoGigs());
  }

  function handleRespond(gigId: string, status: "confirmed" | "declined") {
    setResponding(true);
    const updated = updateBookingStatus(gigId, status);
    refresh();
    if (updated) {
      setSelected(updated);
    }
    setResponding(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Artist dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Hi {user?.name} — check availability, respond to requests, and manage
            gigs
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Log out
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Pending requests</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Declined</p>
          <p className="text-2xl font-bold text-rose-500">{stats.declined}</p>
        </div>
      </div>

      {/* Earnings & retention stats */}
      <EarningsStats gigs={mine} />

      {/* Profile photo upload for the artist's own dashboard */}
      <div className="mb-8">
        <ArtistPhotoUpload artistId={artistId} />
      </div>

      {/* Pending booking requests — accept / decline journey */}
      {pendingRequests.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Booking requests awaiting your response
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Promoters have requested these dates. Accept to confirm or decline if
            you are unavailable.
          </p>
          <ul className="mt-4 space-y-3">
            {pendingRequests.map((g) => (
              <li
                key={g.id}
                className="flex flex-col gap-3 rounded-xl border border-amber-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {g.venue || "Event"} · {g.eventDate}
                    {g.time ? ` · ${g.time}` : ""}
                  </p>
                  <p className="text-sm text-slate-500">
                    {g.promoterName || g.clientName}
                    {g.city ? ` · ${g.city}` : ""}
                    {typeof g.fee === "number"
                      ? ` · R${g.fee.toLocaleString()}`
                      : ""}
                  </p>
                  {g.message && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {g.message}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(g);
                      setModalOpen(true);
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    disabled={responding}
                    onClick={() => handleRespond(g.id, "declined")}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={responding}
                    onClick={() => handleRespond(g.id, "confirmed")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Accept
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              Availability calendar
            </h2>
            <p className="text-sm text-slate-500">
              Confirmed, pending and declined gigs on your schedule. Tap a day to
              review or respond.
            </p>
          </div>
          <GigCalendar
            gigs={mine}
            onSelectDay={(_date, list) => {
              setDayGigs(list);
              if (list.length === 1) {
                setSelected(list[0]);
                setModalOpen(true);
              } else if (list.length > 1) {
                setSelected(null);
                setModalOpen(false);
              }
            }}
            onSelectGig={(g) => {
              setSelected(g);
              setModalOpen(true);
            }}
          />

          {dayGigs.length > 1 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-bold text-slate-900">
                Gigs on this day
              </h3>
              <ul className="space-y-2">
                {dayGigs.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(g);
                        setModalOpen(true);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium">{g.venue}</span>
                      <span className="capitalize text-slate-500">
                        {g.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <RemindersPanel
            gigs={mine}
            onOpenGig={(g) => {
              setSelected(g);
              setModalOpen(true);
            }}
          />
        </div>
      </div>

      <div className="mt-8">
        <MessagesPanel />
      </div>

      <GigDetailsModal
        open={modalOpen}
        gig={selected}
        onClose={() => setModalOpen(false)}
        showReminderToggle
        canRespond
        responding={responding}
        onRespond={handleRespond}
        onToggleReminder={(id, value) => {
          toggleReminder(id, value);
          refresh();
          setSelected((prev) =>
            prev && prev.id === id ? { ...prev, reminderOptIn: value } : prev
          );
        }}
      />
    </div>
  );
}
