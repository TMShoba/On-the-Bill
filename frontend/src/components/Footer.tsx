import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-extrabold tracking-tight text-slate-900">
            The LineUp
          </p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Book South African artists with clear status, payments, and support.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            to="/legal/terms"
            className="font-medium text-slate-600 hover:text-emerald-700"
          >
            Terms of use
          </Link>
          <Link
            to="/legal/privacy"
            className="font-medium text-slate-600 hover:text-emerald-700"
          >
            Privacy
          </Link>
          <Link
            to="/legal/cancellation"
            className="font-medium text-slate-600 hover:text-emerald-700"
          >
            Cancellation
          </Link>
          <Link
            to="/support"
            className="font-medium text-slate-600 hover:text-emerald-700"
          >
            Support
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} The LineUp. All rights reserved.
      </div>
    </footer>
  );
}
