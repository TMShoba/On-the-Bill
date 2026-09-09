import { useEffect, useMemo } from "react";
import type { Booking } from "../Types/Artist";

type Props = {
  gigs: Booking[];
  onOpenGig: (gig: Booking) => void;
};

function daysUntil(dateStr: string) {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export default function RemindersPanel({ gigs, onOpenGig }: Props) {
  const upcoming = useMemo(() => {
    return gigs
      .filter((g) => g.reminderOptIn && g.status !== "declined")
      .map((g) => ({ ...g, days: daysUntil(g.eventDate) }))
      .filter((g) => g.days >= 0 && g.days <= 7)
      .sort((a, b) => a.days - b.days);
  }, [gigs]);

  // Best-effort browser notification (session only — needs open tab)
  useEffect(() => {
    if (upcoming.length === 0) return;
    if (!("Notification" in window)) return;

    const notify = async () => {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (Notification.permission === "granted") {
        const next = upcoming[0];
        new Notification("The LineUp — upcoming gig", {
          body: `${next.venue} in ${next.days === 0 ? "today" : `${next.days} day(s)`}`,
          silent: true,
        });
      }
    };

    // Only once per mount for demo
    const key = "otb_notified_session";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      notify().catch(() => {});
    }
  }, [upcoming]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Reminders</h2>
        <span className="text-xs text-slate-400">Next 7 days</span>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Browser notifications are session-only while this tab is open. True push
        needs a backend.
      </p>

      {upcoming.length === 0 ? (
        <p className="text-sm text-slate-500">
          No opted-in gigs in the next week. Open a gig and toggle &quot;Remind
          me&quot;.
        </p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => onOpenGig(g)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {g.venue}
                  </p>
                  <p className="text-xs text-slate-500">
                    {g.eventDate}
                    {g.time ? ` · ${g.time}` : ""} · {g.city || ""}
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {g.days === 0 ? "Today" : `${g.days}d`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
