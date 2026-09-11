import type { VerificationStatus } from "../Services/verificationStore";
import { verificationLabel } from "../Services/verificationStore";

type Props = {
  status: VerificationStatus;
  size?: "sm" | "md";
  /** When true, hide if unverified (public cards) */
  hideIfUnverified?: boolean;
};

export default function VerificationBadge({
  status,
  size = "sm",
  hideIfUnverified = false,
}: Props) {
  if (hideIfUnverified && (status === "unverified" || status === "pending_review" || status === "rejected")) {
    return null;
  }

  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";

  const styles: Record<VerificationStatus, string> = {
    fully_verified:
      "border-sky-200 bg-sky-50 text-sky-800",
    identity_verified:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    pending_review:
      "border-amber-200 bg-amber-50 text-amber-800",
    rejected:
      "border-rose-200 bg-rose-50 text-rose-800",
    unverified:
      "border-slate-200 bg-slate-50 text-slate-500",
  };

  const showCheck =
    status === "fully_verified" || status === "identity_verified";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${pad} ${styles[status]}`}
      title={
        status === "fully_verified"
          ? "Identity checked and artist claim confirmed on The LineUp"
          : status === "identity_verified"
            ? "Identity checked — artist claim still in progress"
            : verificationLabel(status)
      }
    >
      {showCheck && (
        <svg
          className="h-3 w-3 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {verificationLabel(status)}
    </span>
  );
}
