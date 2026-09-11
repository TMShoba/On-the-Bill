import { useState } from "react";
import {
  getVerification,
  submitVerification,
  demoApproveFully,
  type ClaimType,
  type VerificationRecord,
} from "../Services/verificationStore";
import VerificationBadge from "./VerificationBadge";

type Props = {
  userId: string;
  artistProfileId?: string;
  onUpdated?: (rec: VerificationRecord) => void;
};

export default function ArtistVerificationPanel({
  userId,
  artistProfileId,
  onUpdated,
}: Props) {
  const [rec, setRec] = useState(() => getVerification(userId));
  const [claimType, setClaimType] = useState<ClaimType>(rec.claimType || "");
  const [legalName, setLegalName] = useState(rec.legalName);
  const [idLast4, setIdLast4] = useState(rec.idNumberLast4);
  const [idDocLabel, setIdDocLabel] = useState(rec.idDocLabel);
  const [selfieLabel, setSelfieLabel] = useState(rec.selfieLabel);
  const [authorityNote, setAuthorityNote] = useState(rec.authorityNote);
  const [socialProofUrl, setSocialProofUrl] = useState(rec.socialProofUrl);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function refresh(next: VerificationRecord) {
    setRec(next);
    onUpdated?.(next);
  }

  function onPickFile(
    kind: "id" | "selfie",
    file: File | null
  ) {
    if (!file) return;
    const label = `${file.name} (${Math.round(file.size / 1024)}KB)`;
    if (kind === "id") setIdDocLabel(label);
    else setSelfieLabel(label);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const next = submitVerification(userId, {
        claimType,
        legalName,
        idNumberLast4: idLast4,
        idDocLabel: idDocLabel || "id-document",
        selfieLabel: selfieLabel || "selfie",
        authorityNote,
        socialProofUrl,
        artistProfileId,
      });
      refresh(next);
      if (next.status === "fully_verified") {
        setMsg("You're fully verified — promoters will see a Verified badge.");
      } else if (next.status === "identity_verified") {
        setMsg("Identity verified. Add social proof or authority details for full claim verification.");
      } else if (next.status === "rejected") {
        setMsg(next.rejectionReason || "Could not verify — check the form.");
      } else {
        setMsg("Submitted for review.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Artist verification
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Confirm who you are and that you can represent this act. Required
            before accepting paid bookings.
          </p>
        </div>
        <VerificationBadge status={rec.status} size="md" />
      </div>

      <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-3">
        <p>
          <span className="font-semibold text-slate-800">1. Identity</span> —
          legal name, ID & selfie
        </p>
        <p>
          <span className="font-semibold text-slate-800">2. Claim</span> — you
          are the artist or an authorised manager
        </p>
        <p>
          <span className="font-semibold text-slate-800">3. Proof</span> —
          social link or authority note
        </p>
      </div>

      {(rec.status === "fully_verified" ||
        rec.status === "identity_verified") && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
          {rec.status === "fully_verified"
            ? "Verification complete. You can accept bookings and save banking details for payouts."
            : "Identity verified. You can accept bookings; finish claim proof for a full Verified badge."}
          {rec.reviewedAt && (
            <span className="mt-1 block text-xs text-emerald-700/80">
              Reviewed {new Date(rec.reviewedAt).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {rec.status === "rejected" && rec.rejectionReason && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {rec.rejectionReason}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">
            I am booking as
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["self", "I am the artist"],
                ["manager", "I manage this artist"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setClaimType(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  claimType === value
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Legal name</span>
            <input
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="As on your ID"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">
              ID number (last 4 digits)
            </span>
            <input
              value={idLast4}
              onChange={(e) =>
                setIdLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="e.g. 1234"
              inputMode="numeric"
              required
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">
              ID document (demo upload)
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="mt-1 block w-full text-xs text-slate-600"
              onChange={(e) => onPickFile("id", e.target.files?.[0] || null)}
            />
            {idDocLabel && (
              <span className="mt-1 block text-xs text-emerald-700">
                ✓ {idDocLabel}
              </span>
            )}
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">
              Selfie / liveness (demo)
            </span>
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="mt-1 block w-full text-xs text-slate-600"
              onChange={(e) =>
                onPickFile("selfie", e.target.files?.[0] || null)
              }
            />
            {selfieLabel && (
              <span className="mt-1 block text-xs text-emerald-700">
                ✓ {selfieLabel}
              </span>
            )}
          </label>
        </div>

        {claimType === "manager" && (
          <label className="block text-sm">
            <span className="font-medium text-slate-700">
              Authority to represent
            </span>
            <textarea
              value={authorityNote}
              onChange={(e) => setAuthorityNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Describe your role and authorisation (agency agreement, letter from the artist, etc.)"
              required
            />
          </label>
        )}

        <label className="block text-sm">
          <span className="font-medium text-slate-700">
            Social / press proof (optional but recommended)
          </span>
          <input
            value={socialProofUrl}
            onChange={(e) => setSocialProofUrl(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Instagram, Spotify, or official site URL"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={busy || !claimType}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit verification"}
          </button>
          {rec.status !== "fully_verified" && (
            <button
              type="button"
              onClick={() => {
                const next = demoApproveFully(userId);
                setClaimType(next.claimType || "self");
                refresh(next);
                setMsg("Demo: marked fully verified.");
              }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Demo: mark verified
            </button>
          )}
        </div>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
        <p className="text-[11px] leading-relaxed text-slate-400">
          Demo only — files stay on this device. Production would use a SA KYC
          provider (ID + face match) and POPIA-compliant storage. Managers
          should also get artist OTP confirmation.
        </p>
      </form>
    </section>
  );
}
