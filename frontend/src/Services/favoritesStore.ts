import type { Artist } from "../Types/Artist";

const KEY = "otb_favorites";

export type SavedArtist = {
  id: string;
  stageName: string;
  genre: string;
  location: string;
  rate: number;
  imageUrl: string;
  savedAt: string;
};

function readMap(): Record<string, SavedArtist[]> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, SavedArtist[]>) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, SavedArtist[]>) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getFavorites(userId: string): SavedArtist[] {
  const map = readMap();
  return (map[userId] || []).sort((a, b) =>
    b.savedAt.localeCompare(a.savedAt)
  );
}

export function isFavorite(userId: string, artistId: string): boolean {
  return getFavorites(userId).some((a) => a.id === artistId);
}

export function toggleFavorite(
  userId: string,
  artist: Pick<
    Artist,
    "id" | "stageName" | "genre" | "location" | "rate" | "imageUrl"
  >
): boolean {
  const map = readMap();
  const list = map[userId] || [];
  const idx = list.findIndex((a) => a.id === artist.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    map[userId] = list;
    writeMap(map);
    return false;
  }
  list.unshift({
    id: artist.id,
    stageName: artist.stageName,
    genre: artist.genre,
    location: artist.location,
    rate: artist.rate,
    imageUrl: artist.imageUrl,
    savedAt: new Date().toISOString(),
  });
  map[userId] = list;
  writeMap(map);
  return true;
}

export function removeFavorite(userId: string, artistId: string): void {
  const map = readMap();
  map[userId] = (map[userId] || []).filter((a) => a.id !== artistId);
  writeMap(map);
}
