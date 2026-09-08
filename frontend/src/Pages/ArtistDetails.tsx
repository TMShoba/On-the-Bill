import { useState, type FormEvent } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useArtist } from "../hooks/useArtists";
import { useAuth } from "../context/AuthContext";
import { addPromoterBooking } from "../Services/demoStore";
import { mockMessagingApi } from "../Services/mockMessagingApi";
import { DEMO_ARTIST, DEMO_PROMOTER } from "../Services/demoStore";
import { createBooking } from "../Services/bookingService";
import { resolveArtistImage } from "../utils/imageCdn";

export default function ArtistDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: artist, isLoading, isError } = useArtist(id);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!artist) return;
    setSubmitting(true);
    setFormError("");
    const form = new FormData(e.currentTarget);

    const payload = {
      artistId: artist.id,
      artistName: artist.stageName,
      eventDate: String(form.get("eventDate") || ""),
      venue: String(form.get("venue") || ""),
      address: String(form.get("address") || ""),
      city: String(form.get("city") || ""),
      time: String(form.get("time") || "20:00"),
      fee: Number(form.get("fee") || artist.rate),
      message: String(form.get("message") || ""),
    };

    try {
      // Demo flow: store locally + open conversation
      if (user?.role === "promoter" || user?.email === DEMO_PROMOTER.email) {
        const gig = addPromoterBooking({
          ...payload,
          artistId: DEMO_ARTIST.id, // demo calendar uses demo artist id
          artistName: artist.stageName,
        });

        await mockMessagingApi.ensureConversationForBooking({
          bookingId: gig.id,
          artistId: DEMO_ARTIST.id,
          artistName: artist.stageName,
          promoterId: user?.id || DEMO_PROMOTER.id,
          promoterName: user?.name || DEMO_PROMOTER.name,
          initialMessage:
            payload.message ||
            `Hi! I'd like to book you for ${payload.venue} on ${payload.eventDate}.`,
        });

        setSuccess(true);
        setShowForm(false);
      } else {
        // Real API path
        await createBooking({
          artistId: artist.id,
          clientName: user?.name || String(form.get("clientName") || ""),
          clientEmail: user?.email || String(form.get("clientEmail") || ""),
          eventDate: payload.eventDate,
          venue: payload.venue,
          message: payload.message,
        });
        setSuccess(true);
        setShowForm(false);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to send booking request";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (isError || !artist) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Artist not found</h1>
          <Link to="/artists" className="mt-6 inline-block text-emerald-600">
            ← Back to artists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <Link
              to="/artists"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              All artists
            </Link>
          </div>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Log out
            </button>
          )}
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
            <img
              src={resolveArtistImage(artist.imageUrl, artist.id, "full")}
              alt={artist.stageName}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="text-left">
            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {artist.genre}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {artist.stageName}
            </h1>
            <p className="mt-2 text-slate-500">{artist.location}</p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Starting from</p>
              <p className="mt-1 text-3xl font-extrabold text-emerald-600">
                R{artist.rate.toLocaleString()}+
              </p>
            </div>

            {artist.bio && (
              <div className="mt-8">
                <h2 className="text-lg font-bold text-slate-900">Biography</h2>
                <p className="mt-2 leading-relaxed text-slate-600">
                  {artist.bio}
                </p>
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Booking request sent!{" "}
                {user?.role === "promoter" && (
                  <>
                    Switch to the artist account to see it on the calendar and in
                    Messages.{" "}
                    <button
                      type="button"
                      className="font-semibold underline"
                      onClick={() => navigate("/dashboard")}
                    >
                      Go to dashboard
                    </button>
                  </>
                )}
              </div>
            )}

            {!showForm ? (
              <button
                type="button"
                className="mt-8 w-full rounded-xl bg-slate-900 px-8 py-4 text-base font-semibold text-white hover:bg-slate-800 sm:w-auto"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login");
                    return;
                  }
                  setShowForm(true);
                  setSuccess(false);
                }}
              >
                Request Booking
              </button>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  Request booking
                </h3>
                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Event date
                    </label>
                    <input
                      name="eventDate"
                      type="date"
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Time
                    </label>
                    <input
                      name="time"
                      type="time"
                      defaultValue="20:00"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Venue
                  </label>
                  <input
                    name="venue"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                    placeholder="Sandton Convention Centre"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Address
                    </label>
                    <input
                      name="address"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                      placeholder="161 Maude St"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      City
                    </label>
                    <input
                      name="city"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                      placeholder="Johannesburg"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Fee (ZAR)
                  </label>
                  <input
                    name="fee"
                    type="number"
                    defaultValue={artist.rate}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                    placeholder="Tell them about your event..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
