import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function Cancellation() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 pb-mobile-nav">
      <NavBar />
      <article className="flex-1 w-full mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
          Cancellation rules
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: September 2026</p>

        <div className="mt-8 space-y-6 text-sm text-slate-700">
          <p>
            Default rules apply unless the promoter and artist agree different
            terms in the booking notes (in writing on The LineUp).
          </p>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong>More than 14 days before the event:</strong> either party
              may cancel; deposit may be refundable minus non-recoverable costs
              already incurred, unless otherwise agreed.
            </li>
            <li>
              <strong>7–14 days before:</strong> deposit is typically
              non-refundable; remaining balance is not due if the event does not
              proceed by mutual agreement.
            </li>
            <li>
              <strong>Less than 7 days:</strong> cancelling party should expect
              limited or no refund of amounts already paid, except where the
              other party is in material breach (e.g. confirmed no-show without
              cause).
            </li>
            <li>
              <strong>Artist no-show without covered reason:</strong> promoter
              may request a refund of amounts paid for that performance via
              dispute.
            </li>
            <li>
              <strong>Promoter non-payment:</strong> artist may decline to
              perform and open a dispute; unpaid confirmed bookings harm
              promoter reputation on the platform.
            </li>
          </ul>
          <p>
            Force majeure (severe weather shutdowns, government orders, etc.)
            should be handled in good faith; event insurance is recommended for
            larger productions.
          </p>
        </div>

        <p className="mt-10 text-sm">
          <Link to="/legal/terms" className="font-semibold text-emerald-700">
            Terms of use
          </Link>
          {" · "}
          <Link to="/support" className="font-semibold text-emerald-700">
            Report a problem
          </Link>
        </p>
      </article>
      <Footer />
    </div>
  );
}
