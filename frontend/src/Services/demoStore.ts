import type { Booking } from "../Types/Artist";

const GIGS_KEY = "otb_demo_gigs";

/** Demo artist / promoter accounts */
export const DEMO_ARTIST = {
  id: "artist-demo-1",
  name: "DJ Maphorisa",
  email: "artist@onthebill.co.za",
  role: "artist" as const,
  createdAt: new Date().toISOString(),
};

export const DEMO_PROMOTER = {
  id: "promoter-demo-1",
  name: "Thabo Events",
  email: "promoter@onthebill.co.za",
  role: "promoter" as const,
  createdAt: new Date().toISOString(),
};

function readGigs(): Booking[] {
  try {
    const raw = localStorage.getItem(GIGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGigs(gigs: Booking[]) {
  localStorage.setItem(GIGS_KEY, JSON.stringify(gigs));
}

function isoDateOffset(days: number, time = "21:00") {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return { date: `${y}-${m}-${day}`, time };
}

/** Seed sample gigs for the demo artist so the calendar isn't empty */
export function ensureDemoGigs() {
  if (readGigs().length > 0) return;

  const g1 = isoDateOffset(2);
  const g2 = isoDateOffset(5);
  const g3 = isoDateOffset(12);
  const g4 = isoDateOffset(-3);

  const seed: Booking[] = [
    {
      id: "gig-1",
      artistId: DEMO_ARTIST.id,
      artistName: DEMO_ARTIST.name,
      clientName: "Sandton Lifestyle",
      clientEmail: "events@sandton.co.za",
      eventDate: g1.date,
      time: g1.time,
      venue: "Sandton Convention Centre",
      address: "161 Maude St",
      city: "Sandton",
      fee: 18000,
      promoterName: "Sandton Lifestyle",
      notes: "Main room, 2-hour set. Load-in 18:00.",
      message: "Amapiano night — confirmed",
      status: "confirmed",
      reminderOptIn: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "gig-2",
      artistId: DEMO_ARTIST.id,
      artistName: DEMO_ARTIST.name,
      clientName: DEMO_PROMOTER.name,
      clientEmail: DEMO_PROMOTER.email,
      eventDate: g2.date,
      time: "22:00",
      venue: "The Great Dane",
      address: "5 Keyes Ave",
      city: "Rosebank",
      fee: 15000,
      promoterName: DEMO_PROMOTER.name,
      notes: "Club set until 02:00. Guest list 10.",
      message: "Pending confirmation",
      status: "pending",
      reminderOptIn: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "gig-3",
      artistId: DEMO_ARTIST.id,
      artistName: DEMO_ARTIST.name,
      clientName: "Durban July Events",
      clientEmail: "bookings@durbanjuly.co.za",
      eventDate: g3.date,
      time: "20:00",
      venue: "Greyville Racecourse",
      address: "165 Avondale Rd",
      city: "Durban",
      fee: 25000,
      promoterName: "Durban July Events",
      notes: "Outdoor stage. Soundcheck 16:00.",
      message: "Festival booking",
      status: "confirmed",
      reminderOptIn: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "gig-4",
      artistId: DEMO_ARTIST.id,
      artistName: DEMO_ARTIST.name,
      clientName: "Private client",
      clientEmail: "private@example.com",
      eventDate: g4.date,
      time: "19:00",
      venue: "Private residence",
      address: "Confidential",
      city: "Pretoria",
      fee: 12000,
      promoterName: "Private client",
      notes: "Client cancelled last minute.",
      message: "Declined",
      status: "declined",
      reminderOptIn: false,
      createdAt: new Date().toISOString(),
    },
  ];

  writeGigs(seed);
}

export function getDemoGigs(): Booking[] {
  ensureDemoGigs();
  return readGigs();
}

export function upsertDemoGig(gig: Booking) {
  const gigs = getDemoGigs();
  const idx = gigs.findIndex((g) => g.id === gig.id);
  if (idx >= 0) gigs[idx] = gig;
  else gigs.push(gig);
  writeGigs(gigs);
}

export function toggleReminder(gigId: string, value: boolean): Booking | null {
  const gigs = getDemoGigs();
  const idx = gigs.findIndex((g) => g.id === gigId);
  if (idx < 0) return null;
  gigs[idx] = { ...gigs[idx], reminderOptIn: value };
  writeGigs(gigs);
  return gigs[idx];
}

export function addPromoterBooking(input: {
  artistId: string;
  artistName: string;
  eventDate: string;
  venue: string;
  address?: string;
  city?: string;
  time?: string;
  fee?: number;
  message?: string;
  clientName?: string;
  clientEmail?: string;
}): Booking {
  const gig: Booking = {
    id: crypto.randomUUID(),
    artistId: input.artistId,
    artistName: input.artistName,
    clientName: input.clientName || DEMO_PROMOTER.name,
    clientEmail: input.clientEmail || DEMO_PROMOTER.email,
    eventDate: input.eventDate,
    time: input.time || "20:00",
    venue: input.venue,
    address: input.address || "",
    city: input.city || "",
    fee: input.fee,
    promoterName: input.clientName || DEMO_PROMOTER.name,
    notes: input.message || "",
    message: input.message || "Booking request",
    status: "pending",
    reminderOptIn: false,
    createdAt: new Date().toISOString(),
  };
  upsertDemoGig(gig);
  return gig;
}

/** Artist accepts or declines a pending booking request */
export function updateBookingStatus(
  gigId: string,
  status: "confirmed" | "declined"
): Booking | null {
  const gigs = getDemoGigs();
  const idx = gigs.findIndex((g) => g.id === gigId);
  if (idx < 0) return null;
  gigs[idx] = { ...gigs[idx], status };
  writeGigs(gigs);
  return gigs[idx];
}
