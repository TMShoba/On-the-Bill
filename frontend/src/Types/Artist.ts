export type Artist = {
  id: string;
  stageName: string;
  genre: string;
  location: string;
  rate: number;
  imageUrl: string;
  bio?: string;
};

export type BookingStatus = "pending" | "confirmed" | "declined" | "paid";

export type PaymentStatus = "unpaid" | "deposit" | "paid" | "disputed";

export type Booking = {
  id: string;
  artistId: string;
  artistName: string;
  clientName: string;
  clientEmail: string;
  eventDate: string;
  venue: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
  address?: string;
  city?: string;
  time?: string;
  fee?: number;
  promoterName?: string;
  notes?: string;
  reminderOptIn?: boolean;
  /** Money trail — separate from lifecycle status for clarity */
  paymentStatus?: PaymentStatus;
  paidAt?: string;
  disputeReason?: string;
  disputedAt?: string;
  /** On-the-day proof trail — set once each side checks in */
  artistCheckedInAt?: string;
  promoterCheckedInAt?: string;
};

export type UserRole = "artist" | "promoter" | "client";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type MessageAttachment = {
  name: string;
  type: string;
  size: number;
  /** data URL for demo; real apps would use cloud storage URLs */
  dataUrl: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Timestamp the recipient actually opened this message — powers "Seen at" */
  readAt?: string;
  /** System-generated booking events (request/accept/decline/paid/contract) get
   * a read receipt shown to the sender, and render distinctly in the thread. */
  critical?: boolean;
  attachment?: MessageAttachment;
};

export type Conversation = {
  id: string;
  bookingId: string;
  artistId: string;
  artistName: string;
  promoterId: string;
  promoterName: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
};
