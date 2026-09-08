import ArtistCard from "../components/ArtistCard";
import NavBar from "../components/NavBar";
import { useArtists } from "../hooks/useArtists";

export default function Artists() {
  const { data: artists, isLoading, isError, error } = useArtists();

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Browse Artists
          </h1>
          <p className="mt-2 text-slate-600">
            Verified DJs and producers ready for your next event
          </p>
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
            <p className="font-medium text-red-800">
              Could not load artists
            </p>
            <p className="mt-1 text-sm text-red-600">
              {(error as Error)?.message ||
                "Make sure the API is running on http://localhost:4000"}
            </p>
          </div>
        )}

        {artists && artists.length === 0 && (
          <p className="text-center text-slate-500">No artists found.</p>
        )}

        {artists && artists.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
