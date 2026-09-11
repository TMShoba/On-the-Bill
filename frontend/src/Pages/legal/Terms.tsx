import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function Terms() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 pb-mobile-nav">
      <NavBar />
      <article className="flex-1 w-full mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
          Terms of use
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: September 2026</p>

        <div className="prose-sm mt-8 space-y-6 text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. The LineUp</h2>
            <p>
              The LineUp is a marketplace that connects event promoters with
              artists for live performances. We provide tooling to request,
              accept, and track bookings. We are not the employer of artists and
              not the organiser of your event unless we explicitly say so in
              writing.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">
              2. Who owns the booking relationship
            </h2>
            <p>
              The booking agreement is between the <strong>promoter</strong> and
              the <strong>artist</strong>. The LineUp facilitates discovery,
              messaging, status, and optional payment collection. Contractual
              performance obligations (show up, pay, venue access) sit with those
              two parties.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">3. Accounts</h2>
            <p>
              You must provide accurate information. You are responsible for
              activity under your account. Do not impersonate another artist or
              organiser.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">4. Fees</h2>
            <p>
              Performance fees are set by artists (or agreed in the booking).
              Platform fees, when charged, are paid by the promoter on top of the
              performance fee so the artist receives the agreed amount. Fee
              breakdowns are shown before you pay.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">5. Acceptable use</h2>
            <p>
              No scams, harassment, fake profiles, or off-platform pressure to
              bypass safety features for fraudulent purposes. We may suspend
              accounts that harm other users.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">6. Disputes</h2>
            <p>
              Use in-app dispute tools first. We may help mediate using booking
              records; we are not a court or arbitration body.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm">
          <Link to="/legal/privacy" className="font-semibold text-emerald-700">
            Privacy policy
          </Link>
          {" · "}
          <Link
            to="/legal/cancellation"
            className="font-semibold text-emerald-700"
          >
            Cancellation rules
          </Link>
          {" · "}
          <Link to="/support" className="font-semibold text-emerald-700">
            Support
          </Link>
        </p>
      </article>
      <Footer />
    </div>
  );
}
