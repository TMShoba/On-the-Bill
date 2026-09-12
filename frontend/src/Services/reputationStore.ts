import { getDemoGigs } from "./demoStore";

const KEY = "otb_reputation";

export type UserReputation = {
  userId: string;
  completedBookings: number;
  /** Unlocked after first successful (paid or confirmed past) gig */
  hasCompletedBadge: boolean;
  badgeUnlockedAt?: string;
};

function readAll(): Record<string, UserReputation> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, UserReputation>) : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, UserReputation>) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

/** Count completed gigs for an artist from demo bookings */
export function countCompletedForArtist(artistId: string): number {
  return getDemoGigs().filter(
    (g) =>
      g.artistId === artistId &&
      (g.status === "paid" ||
        (g.status === "confirmed" && g.paymentStatus === "paid"))
  ).length;
}

export function getReputation(userId: string): UserReputation {
  const map = readAll();
  if (map[userId]) return map[userId];
  const completed = countCompletedForArtist(userId);
  const base: UserReputation = {
    userId,
    completedBookings: completed,
    hasCompletedBadge: completed >= 1,
    badgeUnlockedAt: completed >= 1 ? new Date().toISOString() : undefined,
  };
  map[userId] = base;
  writeAll(map);
  return base;
}

/** Call after a booking is marked paid / fully completed */
export function recordSuccessfulGig(artistId: string): UserReputation {
  const map = readAll();
  const prev = map[artistId] || {
    userId: artistId,
    completedBookings: 0,
    hasCompletedBadge: false,
  };
  const completed = Math.max(
    prev.completedBookings + 1,
    countCompletedForArtist(artistId)
  );
  const unlocked = completed >= 1;
  const next: UserReputation = {
    userId: artistId,
    completedBookings: completed,
    hasCompletedBadge: unlocked,
    badgeUnlockedAt:
      unlocked && !prev.hasCompletedBadge
        ? new Date().toISOString()
        : prev.badgeUnlockedAt,
  };
  map[artistId] = next;
  writeAll(map);
  return next;
}

export function getArtistBadges(artistId: string): {
  verifiedStyle: boolean;
  completedBooking: boolean;
  completedCount: number;
  label: string | null;
} {
  const rep = getReputation(artistId);
  const count = Math.max(rep.completedBookings, countCompletedForArtist(artistId));
  return {
    verifiedStyle: count >= 1,
    completedBooking: count >= 1,
    completedCount: count,
    label:
      count >= 1
        ? count === 1
          ? "Completed booking on The LineUp"
          : `${count} completed bookings on The LineUp`
        : null,
  };
}
