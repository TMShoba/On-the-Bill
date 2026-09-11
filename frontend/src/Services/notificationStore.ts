export type NotificationType =
  | "booking_accepted"
  | "booking_declined"
  | "booking_request"
  | "message"
  | "booking_paid"
  | "system";

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Optional link path e.g. /dashboard */
  href?: string;
  createdAt: string;
  read: boolean;
  /** Simulated email delivery flag for demo */
  emailSent?: boolean;
};

const KEY = "otb_notifications";

function read(): AppNotification[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function write(list: AppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getNotifications(userId: string): AppNotification[] {
  return read()
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnreadCount(userId: string): number {
  return getNotifications(userId).filter((n) => !n.read).length;
}

export function markNotificationRead(id: string): void {
  const list = read().map((n) => (n.id === id ? { ...n, read: true } : n));
  write(list);
}

export function markAllNotificationsRead(userId: string): void {
  const list = read().map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  write(list);
}

export function pushNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  /** Demo: pretend an email was also sent */
  email?: boolean;
}): AppNotification {
  const n: AppNotification = {
    id: crypto.randomUUID(),
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href,
    createdAt: new Date().toISOString(),
    read: false,
    emailSent: Boolean(input.email),
  };
  const list = read();
  list.unshift(n);
  // Cap store size for localStorage
  write(list.slice(0, 100));
  return n;
}

/** Notify promoter when artist accepts/declines; notify artist on new request */
export function notifyBookingStatusChange(input: {
  promoterId: string;
  artistId: string;
  artistName: string;
  venue: string;
  eventDate: string;
  status: "confirmed" | "declined";
}) {
  const accepted = input.status === "confirmed";
  pushNotification({
    userId: input.promoterId,
    type: accepted ? "booking_accepted" : "booking_declined",
    title: accepted ? "Booking accepted" : "Booking declined",
    body: accepted
      ? `${input.artistName} accepted your request for ${input.venue} on ${input.eventDate}.`
      : `${input.artistName} declined your request for ${input.venue} on ${input.eventDate}.`,
    href: "/dashboard",
    email: true,
  });
}

export function notifyNewBookingRequest(input: {
  artistId: string;
  promoterName: string;
  venue: string;
  eventDate: string;
}) {
  pushNotification({
    userId: input.artistId,
    type: "booking_request",
    title: "New booking request",
    body: `${input.promoterName} wants to book you for ${input.venue} on ${input.eventDate}.`,
    href: "/dashboard",
    email: true,
  });
}

export function notifyNewMessage(input: {
  recipientId: string;
  senderName: string;
  preview: string;
}) {
  pushNotification({
    userId: input.recipientId,
    type: "message",
    title: `Message from ${input.senderName}`,
    body: input.preview.slice(0, 120),
    href: "/messages",
    email: true,
  });
}

export function notifyPaymentReceived(input: {
  artistId: string;
  promoterId: string;
  amount: number;
  venue: string;
  kind: "deposit" | "full";
}) {
  const label = input.kind === "deposit" ? "Deposit" : "Payment";
  const amt = `R${input.amount.toLocaleString()}`;
  pushNotification({
    userId: input.artistId,
    type: "booking_paid",
    title: `${label} received`,
    body: `${label} of ${amt} for ${input.venue} was marked paid. (Email sent)`,
    href: "/dashboard",
    email: true,
  });
  pushNotification({
    userId: input.promoterId,
    type: "booking_paid",
    title: `${label} confirmed`,
    body: `Your ${label.toLowerCase()} of ${amt} for ${input.venue} is on record. Receipt is in the booking.`,
    href: "/dashboard",
    email: true,
  });
}

/** Demo helper — surfaces that email would be sent for key events */
export function describeEmailEvents(): string[] {
  return [
    "New booking request → email to artist",
    "Booking accepted / declined → email to promoter",
    "Deposit or full payment marked → email to both",
    "New message → email to recipient",
  ];
}
