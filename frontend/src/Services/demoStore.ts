import { recordSuccessfulGig } from "./reputationStore";
import { notifyPaymentReceived } from "./notificationStore";
import type { Booking } from "../Types/Artist";
import {
  notifyBookingStatusChange,
  notifyNewBookingRequest,
} from "./notificationStore";
import { getFeeBreakdown } from "./platformFees";
import { createReceipt, markReceiptPaid } from "./receiptStore";
import { ensureContract } from "./contractStore";
import { mockMessagingApi } from "./mockMessagingApi";
import { SYSTEM_SENDER_ID, SYSTEM_SENDER_NAME } from "./systemSender";

const GIGS_KEY = "otb_demo_gigs";

/** Demo artist / promoter accounts */
export const DEMO_ARTIST = {
  id: "artist-demo-1",
  name: "DJ Maphorisa",
  email: "artist@thelineup.co.za",
  role: "artist" as const,
  createdAt: new Date().toISOString(),
};

export const DEMO_PROMOTER = {
  id: "promoter-demo-1",
  name: "Thabo Events",
  email: "promoter@thelineup.co.za",
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
      paymentStatus: "paid",
      paidAt: new Date().toISOString(),
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
      paymentStatus: "unpaid",
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
      paymentStatus: "deposit",
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

  notifyNewBookingRequest({
    artistId: gig.artistId,
    promoterName: gig.promoterName || gig.clientName,
    venue: gig.venue || "an event",
    eventDate: gig.eventDate,
  });

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
  const prev = gigs[idx];
  gigs[idx] = {
    ...prev,
    status,
    paymentStatus:
      status === "confirmed" ? prev.paymentStatus || "unpaid" : prev.paymentStatus,
  };
  writeGigs(gigs);

  const promoterId =
    prev.clientEmail === DEMO_PROMOTER.email
      ? DEMO_PROMOTER.id
      : prev.clientEmail;
  notifyBookingStatusChange({
    promoterId,
    artistId: prev.artistId,
    artistName: prev.artistName,
    venue: prev.venue || "your event",
    eventDate: prev.eventDate,
    status,
  });

  if (status === "confirmed") {
    const contract = ensureContract(gigs[idx]);
    void mockMessagingApi.postSystemMessage({
      bookingId: gigId,
      senderId: SYSTEM_SENDER_ID,
      senderName: SYSTEM_SENDER_NAME,
      body: `Booking confirmed by ${prev.artistName}. Written terms generated (contract v. ${contract.generatedAt.slice(
        0,
        10
      )}) — view them from the booking's details.`,
    });
  } else {
    void mockMessagingApi.postSystemMessage({
      bookingId: gigId,
      senderId: SYSTEM_SENDER_ID,
      senderName: SYSTEM_SENDER_NAME,
      body: `Booking declined by ${prev.artistName}.`,
    });
  }

  return gigs[idx];
}

/** Promoter marks payment sent / complete. Records a receipt so both sides
 * share the exact same money trail instead of relying on chat/WhatsApp. */
export function markBookingPaid(
  gigId: string,
  mode: "deposit" | "paid" = "paid",
  method: "payfast" | "eft" | "manual" = "manual"
): Booking | null {
  const gigs = getDemoGigs();
  const idx = gigs.findIndex((g) => g.id === gigId);
  if (idx < 0) return null;
  const prev = gigs[idx];
  if (prev.status !== "confirmed" && prev.status !== "paid") return prev;
  gigs[idx] = {
    ...prev,
    status: mode === "paid" ? "paid" : "confirmed",
    paymentStatus: mode,
    paidAt: new Date().toISOString(),
    disputeReason: undefined,
    disputedAt: undefined,
  };
  writeGigs(gigs);

  const fees = getFeeBreakdown(prev.fee || 0);
  const receipt = createReceipt({
    bookingId: prev.id,
    artistId: prev.artistId,
    artistName: prev.artistName,
    promoterName: prev.promoterName || prev.clientName,
    promoterEmail: prev.clientEmail,
    amount: mode === "deposit" ? fees.depositTotal : fees.fullTotal,
    platformFee: mode === "deposit" ? fees.depositPlatformFee : fees.fullPlatformFee,
    artistPayout: mode === "deposit" ? fees.depositAmount : fees.artistPayout,
    kind: mode === "deposit" ? "deposit" : "full",
    method,
  });
  markReceiptPaid(receipt.id);

  try {
    if (mode === "paid") recordSuccessfulGig(prev.artistId);
    const promoterId =
      prev.clientEmail === DEMO_PROMOTER.email
        ? DEMO_PROMOTER.id
        : prev.clientEmail;
    notifyPaymentReceived({
      artistId: prev.artistId,
      promoterId,
      amount: prev.fee || 0,
      venue: prev.venue || "your event",
      kind: mode === "deposit" ? "deposit" : "full",
    });
  } catch {
    /* ignore */
  }

  void mockMessagingApi.postSystemMessage({
    bookingId: gigId,
    senderId: SYSTEM_SENDER_ID,
    senderName: SYSTEM_SENDER_NAME,
    body:
      mode === "paid"
        ? `Payment complete — R${fees.fullTotal.toLocaleString()} paid in full. Receipt ${receipt.id}.`
        : `Deposit received — R${fees.depositTotal.toLocaleString()}. Receipt ${receipt.id}. Balance of R${(
            fees.fullTotal - fees.depositTotal
          ).toLocaleString()} due before the event.`,
  });

  return gigs[idx];
}

/** Either side checks in on the day of the gig — a lightweight, timestamped
 * "yes, this happened" record for both parties, useful if a dispute ever
 * comes down to "did the artist actually show up". */
export function checkInToGig(
  gigId: string,
  role: "artist" | "promoter"
): Booking | null {
  const gigs = getDemoGigs();
  const idx = gigs.findIndex((g) => g.id === gigId);
  if (idx < 0) return null;
  const prev = gigs[idx];
  if (prev.status !== "confirmed" && prev.status !== "paid") return prev;

  const now = new Date().toISOString();
  gigs[idx] =
    role === "artist"
      ? { ...prev, artistCheckedInAt: prev.artistCheckedInAt || now }
      : { ...prev, promoterCheckedInAt: prev.promoterCheckedInAt || now };
  writeGigs(gigs);

  void mockMessagingApi.postSystemMessage({
    bookingId: gigId,
    senderId: SYSTEM_SENDER_ID,
    senderName: SYSTEM_SENDER_NAME,
    body:
      role === "artist"
        ? `${prev.artistName} checked in on-site for ${prev.venue || "the event"}.`
        : `${prev.promoterName || prev.clientName} confirmed the artist arrived at ${
            prev.venue || "the event"
          }.`,
  });

  return gigs[idx];
}

/** Either party opens a dispute on a booking */
export function openBookingDispute(
  gigId: string,
  reason: string
): Booking | null {
  const gigs = getDemoGigs();
  const idx = gigs.findIndex((g) => g.id === gigId);
  if (idx < 0) return null;
  const prev = gigs[idx];
  gigs[idx] = {
    ...prev,
    paymentStatus: "disputed",
    disputeReason: reason.trim() || "Issue reported",
    disputedAt: new Date().toISOString(),
  };
  writeGigs(gigs);
  return gigs[idx];
}
