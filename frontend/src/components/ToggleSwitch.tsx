type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
};

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: Props) {
  return (
    <label
      className={`flex items-center justify-between gap-4 ${
        disabled ? "opacity-60" : "cursor-pointer"
      }`}
    >
      {(label || description) && (
        <span className="min-w-0">
          {label && (
            <span className="block text-sm font-semibold text-slate-800">{label}</span>
          )}
          {description && (
            <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
          )}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed ${
          checked ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5.5" : "translate-x-1"
          }`}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </label>
  );
}
