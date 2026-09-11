import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 pb-mobile-nav">
      <NavBar />
      <article className="flex-1 w-full mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
          Privacy policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: September 2026</p>

        <div className="mt-8 space-y-6 text-sm text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-slate-900">What we collect</h2>
            <p className="mt-2">
              Account details (name, email, role), profile content (bio, photos,
              demos, banking details you choose to store), booking and message
              records, and basic technical logs needed to run the service.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">How we use it</h2>
            <p className="mt-2">
              To operate bookings, payments, notifications, fraud prevention, and
              customer support. We do not sell your personal information.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">Banking details</h2>
            <p className="mt-2">
              Artist banking details are shared with a promoter only after a
              booking is confirmed, so they can pay you. Treat payout details as
              sensitive.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">Retention</h2>
            <p className="mt-2">
              We keep booking records as long as needed for disputes, legal
              obligations, and platform integrity. You may request access or
              deletion subject to those needs.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900">Contact</h2>
            <p className="mt-2">
              Privacy questions:{" "}
              <a
                href="mailto:privacy@thelineup.co.za"
                className="font-semibold text-emerald-700"
              >
                privacy@thelineup.co.za
              </a>
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm">
          <Link to="/legal/terms" className="font-semibold text-emerald-700">
            Terms of use
          </Link>
        </p>
      </article>
      <Footer />
    </div>
  );
}
