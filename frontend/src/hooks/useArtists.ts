import { useQuery } from "@tanstack/react-query";
import { getArtists, getArtistById } from "../Services/artistService";

export function useArtists(params?: {
  q?: string;
  genre?: string;
  location?: string;
}) {
  return useQuery({
    queryKey: ["artists", params],
    queryFn: () => getArtists(params),
  });
}

export function useArtist(id: string | undefined) {
  return useQuery({
    queryKey: ["artist", id],
    queryFn: () => getArtistById(id!),
    enabled: Boolean(id),
  });
}
