type Props = {
  label?: string | null;
  count?: number;
  size?: "sm" | "md";
};

/** Stronger trust badge unlocked after first successful gig on The LineUp */
export default function CompletedBadge({
  label,
  count = 0,
  size = "sm",
}: Props) {
  if (!label && count < 1) return null;
  const text =
    label ||
    (count === 1
      ? "Completed booking on The LineUp"
      : `${count} completed bookings on The LineUp`);

  const pad = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 font-semibold text-emerald-800 shadow-sm ${pad}`}
      title="This artist has completed at least one booking on The LineUp"
    >
      <svg
        className="h-3.5 w-3.5 text-emerald-600"
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
      {text}
    </span>
  );
}
