import type { Booking } from "../Types/Artist";

type Props = {
  gig: Booking | null;
  open: boolean;
  onClose: () => void;
  onToggleReminder?: (gigId: string, value: boolean) => void;
  showReminderToggle?: boolean;
};

const statusStyles = {
  confirmed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  declined: "bg-rose-50 text-rose-700",
};

export default function GigDetailsModal({
  gig,
  open,
  onClose,
  onToggleReminder,
  showReminderToggle = true,
}: Props) {
  if (!open || !gig) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[gig.status]}`}
            >
              {gig.status}
            </span>
            <h3 className="mt-2 text-xl font-bold text-slate-900">
              {gig.venue || "Gig"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Date</dt>
            <dd className="font-medium text-slate-900">{gig.eventDate}</dd>
          </div>
          {gig.time && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Time</dt>
              <dd className="font-medium text-slate-900">{gig.time}</dd>
            </div>
          )}
          {gig.address && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Address</dt>
              <dd className="text-right font-medium text-slate-900">
                {gig.address}
              </dd>
            </div>
          )}
          {gig.city && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">City</dt>
              <dd className="font-medium text-slate-900">{gig.city}</dd>
            </div>
          )}
          {(gig.promoterName || gig.clientName) && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Promoter</dt>
              <dd className="font-medium text-slate-900">
                {gig.promoterName || gig.clientName}
              </dd>
            </div>
          )}
          {typeof gig.fee === "number" && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Fee</dt>
              <dd className="font-bold text-emerald-600">
                R{gig.fee.toLocaleString()}
              </dd>
            </div>
          )}
          {(gig.notes || gig.message) && (
            <div>
              <dt className="text-slate-500">Notes</dt>
              <dd className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-700">
                {gig.notes || gig.message}
              </dd>
            </div>
          )}
        </dl>

        {showReminderToggle && onToggleReminder && gig.status !== "declined" && (
          <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={Boolean(gig.reminderOptIn)}
              onChange={(e) => onToggleReminder(gig.id, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-800">
              Remind me about this gig
            </span>
          </label>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}
