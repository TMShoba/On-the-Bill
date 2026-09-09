import { useMemo, useState } from "react";
import ArtistCard from "../components/ArtistCard";
import NavBar from "../components/NavBar";
import { useArtists } from "../hooks/useArtists";

export default function Artists() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");

  // Text search hits the API; genre / location / rate filtered client-side so
  // dropdown options stay complete.
  const apiParams = useMemo(() => {
    if (!q.trim()) return undefined;
    return { q: q.trim() };
  }, [q]);

  const { data: artists, isLoading, isError, error } = useArtists(apiParams);

  const filtered = useMemo(() => {
    if (!artists) return [];
    let list = artists;
    if (genre.trim()) {
      list = list.filter(
        (a) => a.genre.toLowerCase() === genre.trim().toLowerCase()
      );
    }
    if (location.trim()) {
      list = list.filter((a) =>
        a.location.toLowerCase().includes(location.trim().toLowerCase())
      );
    }
    const min = minRate ? Number(minRate) : null;
    const max = maxRate ? Number(maxRate) : null;
    if (min !== null && !Number.isNaN(min)) {
      list = list.filter((a) => a.rate >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      list = list.filter((a) => a.rate <= max);
    }
    return list;
  }, [artists, genre, location, minRate, maxRate]);

  const genreOptions = useMemo(() => {
    if (!artists) return [];
    return Array.from(new Set(artists.map((a) => a.genre))).sort();
  }, [artists]);

  const locationOptions = useMemo(() => {
    if (!artists) return [];
    return Array.from(new Set(artists.map((a) => a.location))).sort();
  }, [artists]);

  function clearFilters() {
    setQ("");
    setGenre("");
    setLocation("");
    setMinRate("");
    setMaxRate("");
  }

  const hasActiveFilters =
    Boolean(q.trim()) ||
    Boolean(genre.trim()) ||
    Boolean(location.trim()) ||
    Boolean(minRate) ||
    Boolean(maxRate);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Browse Artists
          </h1>
          <p className="mt-2 text-slate-600">
            Verified DJs and producers ready for your next event
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, genre, or city…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-emerald-500/30 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="">All genres</option>
                {genreOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="">All locations</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Min rate
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={minRate}
                  onChange={(e) => setMinRate(e.target.value)}
                  placeholder="R0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Max rate
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  placeholder="Any"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-500">
              {isLoading
                ? "Loading…"
                : `${filtered.length} artist${filtered.length === 1 ? "" : "s"}`}
              {hasActiveFilters ? " matching filters" : ""}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-800">Could not load artists</p>
            <p className="mt-1 text-sm text-red-600">
              {(error as Error)?.message ||
                "Make sure the API is running on http://localhost:4000"}
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            No artists match your filters. Try clearing search or widening rate
            range.
          </p>
        )}

        {filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
