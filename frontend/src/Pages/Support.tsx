import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const SUPPORT_EMAIL = "support@thelineup.co.za";
const SUPPORT_WHATSAPP = "27600000000"; // replace with real number

export default function Support() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState("Report a problem");
  const [body, setBody] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = [
      subject,
      "",
      body,
      "",
      user ? `User: ${user.name} <${user.email}> (${user.role})` : "Guest",
      `Submitted: ${new Date().toISOString()}`,
    ].join("\n");

    // Demo: open mailto + store flag. Production would POST to your API / helpdesk.
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(text)}`;
    window.location.href = mailto;
    setSent(true);
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 pb-mobile-nav">
      <NavBar />
      <div className="flex-1 w-full mx-auto max-w-lg px-4 py-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Support
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
          We&apos;re here to help
        </h1>
        <p className="mt-2 text-slate-600">
          Report a problem on a booking or account. We aim to respond within{" "}
          <strong>24–48 hours</strong> on business days.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200"
          >
            <p className="text-xs font-bold uppercase text-slate-400">Email</p>
            <p className="mt-1 font-semibold text-slate-900">{SUPPORT_EMAIL}</p>
          </a>
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200"
          >
            <p className="text-xs font-bold uppercase text-slate-400">
              WhatsApp
            </p>
            <p className="mt-1 font-semibold text-slate-900">Company line</p>
            <p className="text-xs text-slate-500">
              For The LineUp support — not for booking the other party
            </p>
          </a>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-bold text-slate-900">Report a problem</h2>
          {sent && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Your email client should open. If it doesn&apos;t, write to{" "}
              {SUPPORT_EMAIL}. We&apos;ll get back within 24–48h.
            </p>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            >
              <option>Report a problem</option>
              <option>Payment issue</option>
              <option>No-show / cancellation</option>
              <option>Account / login</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              What happened?
            </label>
            <textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Booking ID, date, and what went wrong…"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Send to support
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/legal/cancellation" className="text-emerald-700">
            Cancellation rules
          </Link>
          {" · "}
          <Link to="/legal/terms" className="text-emerald-700">
            Terms
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}
