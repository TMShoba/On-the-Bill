import { useState } from "react";
import type { Booking } from "../Types/Artist";
import { getBankingDetails } from "../Services/artistProfileStore";

type Props = {
  gig: Booking | null;
  open: boolean;
  onClose: () => void;
  onToggleReminder?: (gigId: string, value: boolean) => void;
  showReminderToggle?: boolean;
  canRespond?: boolean;
  onRespond?: (gigId: string, status: "confirmed" | "declined") => void;
  responding?: boolean;
  showArtistBanking?: boolean;
  /** Promoter can mark deposit/paid; either side can dispute */
  canManagePayment?: boolean;
  onMarkPaid?: (gigId: string, mode: "deposit" | "paid") => void;
  onDispute?: (gigId: string, reason: string) => void;
};

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  declined: "bg-rose-50 text-rose-700",
  paid: "bg-sky-50 text-sky-700",
};

const paymentStyles: Record<string, string> = {
  unpaid: "bg-slate-100 text-slate-600",
  deposit: "bg-amber-50 text-amber-700",
  paid: "bg-sky-50 text-sky-700",
  disputed: "bg-rose-50 text-rose-700",
};

function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { key: "pending", label: "Requested" },
    { key: "confirmed", label: "Confirmed" },
    { key: "paid", label: "Paid" },
  ];
  if (status === "declined") {
    return (
      <p className="mt-3 text-sm font-medium text-rose-600">
        Booking declined
      </p>
    );
  }
  const order = ["pending", "confirmed", "paid"];
  const idx = Math.max(0, order.indexOf(status === "confirmed" ? "confirmed" : status));
  // confirmed with unpaid still sits on confirmed step
  const active =
    status === "paid" ? 2 : status === "confirmed" ? 1 : 0;

  return (
    <ol className="mt-4 flex items-center gap-1">
      {steps.map((s, i) => (
        <li key={s.key} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={`h-2 w-full rounded-full ${
              i <= active ? "bg-emerald-500" : "bg-slate-200"
            }`}
          />
          <span
            className={`text-[10px] font-semibold ${
              i <= active ? "text-emerald-700" : "text-slate-400"
            }`}
          >
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function GigDetailsModal({
  gig,
  open,
  onClose,
  onToggleReminder,
  showReminderToggle = true,
  canRespond = false,
  onRespond,
  responding = false,
  showArtistBanking = false,
  canManagePayment = false,
  onMarkPaid,
  onDispute,
}: Props) {
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  if (!open || !gig) return null;

  const showActions = canRespond && gig.status === "pending" && onRespond;
  const banking =
    showArtistBanking &&
    (gig.status === "confirmed" || gig.status === "paid")
      ? getBankingDetails(gig.artistId)
      : null;

  const payment = gig.paymentStatus || (gig.status === "paid" ? "paid" : "unpaid");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[gig.status] || statusStyles.pending}`}
              >
                {gig.status}
              </span>
              {(gig.status === "confirmed" || gig.status === "paid") && (
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${paymentStyles[payment] || paymentStyles.unpaid}`}
                >
                  payment: {payment}
                </span>
              )}
            </div>
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

        <StatusTimeline status={gig.status} />

        <dl className="mt-4 space-y-3 text-sm">
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
          {gig.disputeReason && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-rose-800">
              <p className="text-xs font-bold uppercase">Dispute open</p>
              <p className="mt-1">{gig.disputeReason}</p>
            </div>
          )}
        </dl>

        {showArtistBanking &&
          (gig.status === "confirmed" || gig.status === "paid") && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm">
              <p className="font-bold text-emerald-900">Pay the artist (EFT)</p>
              {banking ? (
                <dl className="mt-2 space-y-1.5 text-emerald-950/90">
                  <div className="flex justify-between gap-2">
                    <dt className="text-emerald-800/70">Bank</dt>
                    <dd className="font-medium">{banking.bankName}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-emerald-800/70">Account name</dt>
                    <dd className="font-medium">{banking.accountName}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-emerald-800/70">Account no.</dt>
                    <dd className="font-mono font-medium">
                      {banking.accountNumber}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-emerald-800/70">Branch</dt>
                    <dd className="font-mono font-medium">
                      {banking.branchCode}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-1 text-emerald-800/80">
                  Artist hasn&apos;t added banking yet — message them for
                  payment details.
                </p>
              )}
            </div>
          )}

        {canManagePayment &&
          (gig.status === "confirmed" || gig.status === "paid") &&
          payment !== "disputed" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {payment !== "deposit" && payment !== "paid" && onMarkPaid && (
                <button
                  type="button"
                  onClick={() => onMarkPaid(gig.id, "deposit")}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"
                >
                  Mark deposit paid
                </button>
              )}
              {payment !== "paid" && onMarkPaid && (
                <button
                  type="button"
                  onClick={() => onMarkPaid(gig.id, "paid")}
                  className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  Mark fully paid
                </button>
              )}
            </div>
          )}

        {(gig.status === "confirmed" || gig.status === "paid") &&
          payment !== "disputed" &&
          onDispute && (
            <div className="mt-3">
              {!disputeOpen ? (
                <button
                  type="button"
                  onClick={() => setDisputeOpen(true)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Report a problem / open dispute
                </button>
              ) : (
                <div className="space-y-2 rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                  <textarea
                    rows={2}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="What went wrong? (payment, no-show, venue…)"
                    className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDispute(gig.id, disputeReason);
                        setDisputeOpen(false);
                        setDisputeReason("");
                      }}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Submit dispute
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisputeOpen(false)}
                      className="text-xs font-medium text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        {showReminderToggle &&
          onToggleReminder &&
          gig.status !== "declined" && (
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

        {showActions && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={responding}
              onClick={() => onRespond!(gig.id, "declined")}
              className="rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            >
              Decline
            </button>
            <button
              type="button"
              disabled={responding}
              onClick={() => onRespond!(gig.id, "confirmed")}
              className="rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              Accept
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className={`mt-3 w-full rounded-xl py-2.5 text-sm font-semibold ${
            showActions
              ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
