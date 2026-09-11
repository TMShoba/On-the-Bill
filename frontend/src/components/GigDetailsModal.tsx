import { useState } from "react";
import type { Booking } from "../Types/Artist";
import { getBankingDetails } from "../Services/artistProfileStore";
import { getFeeBreakdown } from "../Services/platformFees";
import { getReceiptsForBooking } from "../Services/receiptStore";
import { getContract } from "../Services/contractStore";
import { getRebookingInfo } from "../Services/reputationStore";
import { getVerification } from "../Services/verificationStore";
import VerificationBadge from "./VerificationBadge";

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
  /** Which side is looking at this modal — drives check-in button and the
   * artist-verification badge shown to the promoter. */
  viewerRole?: "artist" | "promoter";
  onCheckIn?: (gigId: string, role: "artist" | "promoter") => void;
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
  const active = Math.max(0, order.indexOf(status));

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
  viewerRole,
  onCheckIn,
}: Props) {
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [contractOpen, setContractOpen] = useState(false);

  if (!open || !gig) return null;

  const showActions = canRespond && gig.status === "pending" && onRespond;
  const banking =
    showArtistBanking &&
    (gig.status === "confirmed" || gig.status === "paid")
      ? getBankingDetails(gig.artistId)
      : null;

  const payment = gig.paymentStatus || (gig.status === "paid" ? "paid" : "unpaid");
  const isLive = gig.status === "confirmed" || gig.status === "paid";
  const fees = getFeeBreakdown(gig.fee || 0);
  const receipts = isLive ? getReceiptsForBooking(gig.id) : [];
  const totalPaid = receipts
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.amount, 0);
  const contract = isLive ? getContract(gig.id) : null;
  const rebooking = getRebookingInfo(gig.artistId, gig.clientEmail, gig.id);
  const artistVerification = getVerification(gig.artistId);

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
          {viewerRole === "promoter" && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Artist</dt>
              <dd>
                <VerificationBadge status={artistVerification.status} hideIfUnverified />
              </dd>
            </div>
          )}
          {rebooking.isRepeat && (
            <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
              🔁 {viewerRole === "artist" ? "This promoter" : "You"} booked{" "}
              {viewerRole === "artist" ? "you" : "this artist"} before —{" "}
              {rebooking.priorCount} prior {rebooking.priorCount === 1 ? "booking" : "bookings"}{" "}
              together on The LineUp.
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

        {isLive && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900">Money trail</p>
              <span className="text-xs font-semibold text-slate-500">
                R{totalPaid.toLocaleString()} of R{fees.fullTotal.toLocaleString()} paid
              </span>
            </div>
            <dl className="mt-2 space-y-1.5 text-slate-600">
              <div className="flex justify-between gap-2">
                <dt>Performance fee</dt>
                <dd className="font-medium text-slate-900">
                  R{fees.performanceFee.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Platform fee (promoter pays)</dt>
                <dd className="font-medium text-slate-900">
                  R{fees.platformFee.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-t border-slate-100 pt-1.5 font-semibold text-slate-900">
                <dt>Total</dt>
                <dd>R{fees.fullTotal.toLocaleString()}</dd>
              </div>
            </dl>

            {receipts.length > 0 ? (
              <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                {receipts.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span>
                      <span className="block text-xs font-semibold capitalize text-slate-800">
                        {r.kind} · {r.method.toUpperCase()}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {r.paidAt
                          ? new Date(r.paidAt).toLocaleString("en-ZA")
                          : "Pending"}{" "}
                        · Receipt {r.id.slice(-8)}
                      </span>
                    </span>
                    <span className="flex flex-col items-end">
                      <span className="font-bold text-slate-900">
                        R{r.amount.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase ${
                          r.status === "paid" ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                No payments recorded yet — nothing has changed hands on The
                LineUp for this booking.
              </p>
            )}
          </div>
        )}

        {isLive && contract && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setContractOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              📄 Written booking terms
              <span className="text-xs font-normal text-slate-400">
                {contractOpen ? "Hide" : "View"}
              </span>
            </button>
            {contractOpen && (
              <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-[11px] leading-relaxed text-slate-700">
                {contract.text}
              </pre>
            )}
          </div>
        )}

        {isLive && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <p className="font-bold text-slate-900">Day-of check-in</p>
            <p className="mt-0.5 text-xs text-slate-500">
              A timestamped record that the gig actually happened — useful if
              anything is ever disputed.
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs font-medium text-slate-700">Artist checked in</span>
                {gig.artistCheckedInAt ? (
                  <span className="text-xs font-semibold text-emerald-600">
                    ✓ {new Date(gig.artistCheckedInAt).toLocaleString("en-ZA")}
                  </span>
                ) : viewerRole === "artist" && onCheckIn ? (
                  <button
                    type="button"
                    onClick={() => onCheckIn(gig.id, "artist")}
                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Check in
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Not yet</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs font-medium text-slate-700">Promoter confirmed arrival</span>
                {gig.promoterCheckedInAt ? (
                  <span className="text-xs font-semibold text-emerald-600">
                    ✓ {new Date(gig.promoterCheckedInAt).toLocaleString("en-ZA")}
                  </span>
                ) : viewerRole === "promoter" && onCheckIn ? (
                  <button
                    type="button"
                    onClick={() => onCheckIn(gig.id, "promoter")}
                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Confirm arrival
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Not yet</span>
                )}
              </div>
            </div>
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
