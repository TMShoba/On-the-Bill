import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">
              OB
            </span>
            The LineUp
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            South Africa&apos;s live-music booking platform — clear requests,
            availability, payments, and support for promoters and artists.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:flex sm:flex-wrap sm:gap-x-6">
          <Link
            to="/artists"
            className="font-medium text-slate-600 hover:text-emerald-700"
          >
            Browse artists
          </Link>
          <Link
            to="/support"
            className="font-medium text-slate-600 hover:text-emerald-700"
          >
            Support
          </Link>
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
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} The LineUp. All rights reserved.
      </div>
    </footer>
  );
}
