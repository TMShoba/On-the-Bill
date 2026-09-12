import { useMemo, useState } from "react";
import type { Booking } from "../Types/Artist";

type Props = {
  /** Confirmed (busy) dates only — no pending/declined detail for public view */
  busyDates: string[];
  /** Optional label under the calendar */
  caption?: string;
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function toKey(y: number, m: number, day: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Lighter public-facing availability calendar for the artist profile.
 * Shows only busy (confirmed) days so promoters can see open dates
 * without internal booking details.
 */
export default function PublicAvailabilityCalendar({
  busyDates,
  caption = "Green = available · Grey = already booked",
}: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const busySet = useMemo(() => {
    const s = new Set<string>();
    for (const d of busyDates) s.add(d.slice(0, 10));
    return s;
  }, [busyDates]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = startOfMonth(cursor).getDay();
  const total = daysInMonth(cursor);
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = cursor.toLocaleString("en-ZA", {
    month: "long",
    year: "numeric",
  });

  const todayKey = (() => {
    const n = new Date();
    return toKey(n.getFullYear(), n.getMonth(), n.getDate());
  })();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">{monthLabel}</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm hover:bg-slate-50"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm hover:bg-slate-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm hover:bg-slate-50"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-slate-400">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}-${i}`} className="py-0.5">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} className="aspect-square" />;
          }
          const key = toKey(year, month, day);
          const isBusy = busySet.has(key);
          const isPast = key < todayKey;
          const isToday = key === todayKey;

          return (
            <div
              key={key}
              title={isBusy ? "Unavailable" : isPast ? "Past" : "Available"}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs sm:text-sm ${
                isToday ? "ring-1 ring-slate-900 ring-offset-1" : ""
              } ${
                isBusy
                  ? "bg-slate-200 text-slate-500"
                  : isPast
                    ? "text-slate-300"
                    : "bg-emerald-50 text-emerald-800 font-medium"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-500">{caption}</p>
    </div>
  );
}

/** Helper: extract confirmed event dates from a list of bookings */
export function confirmedDatesFromGigs(gigs: Booking[]): string[] {
  return gigs
    .filter((g) => g.status === "confirmed")
    .map((g) => g.eventDate.slice(0, 10));
}
