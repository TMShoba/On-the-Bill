import { Link } from "react-router-dom";
import { resolveArtistImage } from "../utils/imageCdn";

type Artist = {
  id: string;
  stageName: string;
  genre: string;
  location: string;
  rate: number;
  imageUrl: string;
};

interface ArtistCardProps {
  artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const src = resolveArtistImage(artist.imageUrl, artist.id, "card");

  return (
    <Link
      to={`/artists/${artist.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <img
          src={src}
          alt={artist.stageName}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur">
          {artist.genre}
        </span>
      </div>

      <div className="p-5 text-left">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700">
          {artist.stageName}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{artist.location}</p>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-base font-bold text-emerald-600">
            R{artist.rate.toLocaleString()}
            <span className="text-sm font-medium text-slate-400">+</span>
          </p>
          <span className="text-sm font-medium text-slate-400 transition group-hover:text-slate-900">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
