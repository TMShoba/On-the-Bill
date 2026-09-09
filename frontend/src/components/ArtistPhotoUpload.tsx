import { useRef, useState, type ChangeEvent } from "react";

const PHOTO_KEY_PREFIX = "otb_artist_photo_";

export function getStoredArtistPhoto(artistId: string): string | null {
  try {
    return localStorage.getItem(`${PHOTO_KEY_PREFIX}${artistId}`);
  } catch {
    return null;
  }
}

export function setStoredArtistPhoto(artistId: string, dataUrl: string | null) {
  const key = `${PHOTO_KEY_PREFIX}${artistId}`;
  if (dataUrl) localStorage.setItem(key, dataUrl);
  else localStorage.removeItem(key);
}

type Props = {
  artistId: string;
  currentImageUrl?: string;
  onPhotoChange?: (dataUrl: string | null) => void;
};

/**
 * Photo upload control for the artist's own dashboard.
 * Stores a data-URL preview in localStorage for the demo;
 * a production app would upload to object storage / CDN.
 */
export default function ArtistPhotoUpload({
  artistId,
  currentImageUrl,
  onPhotoChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(() =>
    getStoredArtistPhoto(artistId)
  );
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const displaySrc = preview || currentImageUrl;

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setStoredArtistPhoto(artistId, dataUrl);
      setPreview(dataUrl);
      onPhotoChange?.(dataUrl);
      setUploading(false);
    };
    reader.onerror = () => {
      setError("Could not read that file.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    setStoredArtistPhoto(artistId, null);
    setPreview(null);
    onPhotoChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Profile photo</h2>
      <p className="mt-1 text-sm text-slate-500">
        Upload a square or landscape photo promoters will see on your profile.
      </p>

      <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
          {displaySrc ? (
            <img
              src={displaySrc}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No photo
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            {uploading ? "Uploading…" : preview ? "Change photo" : "Upload photo"}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={uploading}
              onChange={handleFile}
            />
          </label>
          {preview && (
            <button
              type="button"
              onClick={clearPhoto}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      <p className="mt-3 text-xs text-slate-400">
        JPG, PNG or WebP · max 5 MB. Demo stores the image locally in your
        browser.
      </p>
    </div>
  );
}
