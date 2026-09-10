import { useState } from "react";

/**
 * Lightweight insurance / COI education — builds trust without clutter.
 * Not a hard sell; checklist + partner-style guidance for SA events.
 */
export default function TrustEducation({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(!compact);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Trust & protection
          </p>
          <h2 className="text-lg font-bold text-slate-900">
            Before you lock the date
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Simple checks that protect artists, promoters, and the venue.
          </p>
        </div>
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              <span>
                <strong className="text-slate-800">Confirm on The LineUp</strong>{" "}
                — status (pending → confirmed → paid) is the shared record, not
                WhatsApp screenshots.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              <span>
                <strong className="text-slate-800">Public liability</strong> —
                many venues ask for a Certificate of Insurance (COI). Artists
                and organisers should know who is covering the room.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              <span>
                <strong className="text-slate-800">Outdoor / festivals</strong> —
                weather and cancellation cover are separate products; ask a SA
                event broker early if the budget is material.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              <span>
                <strong className="text-slate-800">Headliner risk</strong> —
                non-appearance insurance protects the promoter if a key act
                cannot perform for covered reasons (illness, travel, etc.).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              <span>
                <strong className="text-slate-800">Payment</strong> — mark
                deposit / paid on the booking so both sides see the same money
                trail. Open a dispute in-app if something goes wrong.
              </span>
            </li>
          </ul>
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            The LineUp does not sell insurance. For quotes, speak to a licensed
            SA event / entertainment broker (e.g. specialists in event liability
            and cancellation). This checklist is educational only.
          </p>
        </div>
      )}
    </section>
  );
}
