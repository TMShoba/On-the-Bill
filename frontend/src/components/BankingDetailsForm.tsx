import { useState, type FormEvent } from "react";
import {
  getBankingDetails,
  saveBankingDetails,
  type BankingDetails,
} from "../Services/artistProfileStore";

type Props = {
  artistId: string;
  onSaved?: () => void;
};

const empty: BankingDetails = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  branchCode: "",
  accountType: "",
  referenceHint: "",
};

export default function BankingDetailsForm({ artistId, onSaved }: Props) {
  const [form, setForm] = useState<BankingDetails>(
    () => getBankingDetails(artistId) || empty
  );
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(() => !getBankingDetails(artistId));

  function update<K extends keyof BankingDetails>(key: K, value: BankingDetails[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveBankingDetails(artistId, form);
    setSaved(true);
    setOpen(false);
    onSaved?.();
  }

  const hasSaved = Boolean(getBankingDetails(artistId));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Banking details</h2>
          <p className="mt-1 text-sm text-slate-500">
            Shared with promoters only after a booking is <strong>confirmed</strong>,
            so they can pay you by EFT.
          </p>
        </div>
        {hasSaved && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
        )}
      </div>

      {!open && hasSaved ? (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">Banking on file</p>
          <p className="mt-1 text-emerald-800/80">
            {form.bankName} · {form.accountName} · ****
            {form.accountNumber.slice(-4)}
          </p>
          <p className="mt-1 text-xs text-emerald-700/70">
            Full details appear to the promoter once they confirm a gig with you.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bank name
              </label>
              <input
                required
                value={form.bankName}
                onChange={(e) => update("bankName", e.target.value)}
                placeholder="e.g. FNB, Standard Bank"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account type
              </label>
              <select
                value={form.accountType}
                onChange={(e) =>
                  update(
                    "accountType",
                    e.target.value as BankingDetails["accountType"]
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              >
                <option value="">Select…</option>
                <option value="cheque">Cheque / current</option>
                <option value="savings">Savings</option>
                <option value="transmission">Transmission</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account holder name
              </label>
              <input
                required
                value={form.accountName}
                onChange={(e) => update("accountName", e.target.value)}
                placeholder="As registered at the bank"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account number
              </label>
              <input
                required
                inputMode="numeric"
                value={form.accountNumber}
                onChange={(e) => update("accountNumber", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Branch code
              </label>
              <input
                required
                inputMode="numeric"
                value={form.branchCode}
                onChange={(e) => update("branchCode", e.target.value)}
                placeholder="6 digits"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preferred payment reference (optional)
              </label>
              <input
                value={form.referenceHint || ""}
                onChange={(e) => update("referenceHint", e.target.value)}
                placeholder="e.g. LINEUP + your stage name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Demo stores this on your device only. In production it would be
            encrypted server-side and never shown until a booking is confirmed.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95"
            >
              Save banking details
            </button>
            {hasSaved && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
            )}
          </div>
          {saved && (
            <p className="text-sm font-medium text-emerald-700">Saved ✓</p>
          )}
        </form>
      )}
    </section>
  );
}
