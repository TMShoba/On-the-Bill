/**
 * Simple local receipts for demo — both sides can view payment status + history.
 */

export type Receipt = {
  id: string;
  bookingId: string;
  artistId: string;
  artistName: string;
  promoterName: string;
  promoterEmail?: string;
  amount: number;
  platformFee: number;
  artistPayout: number;
  /** deposit | full */
  kind: "deposit" | "full";
  method: "payfast" | "eft" | "manual";
  status: "pending" | "paid" | "refunded";
  createdAt: string;
  paidAt?: string;
};

const KEY = "otb_receipts";

function read(): Receipt[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Receipt[]) : [];
  } catch {
    return [];
  }
}

function write(list: Receipt[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getReceiptsForBooking(bookingId: string): Receipt[] {
  return read().filter((r) => r.bookingId === bookingId);
}

export function getReceiptsForUser(opts: {
  artistId?: string;
  email?: string;
}): Receipt[] {
  return read().filter(
    (r) =>
      (opts.artistId && r.artistId === opts.artistId) ||
      (opts.email && r.promoterEmail === opts.email)
  );
}

export function createReceipt(
  input: Omit<Receipt, "id" | "createdAt" | "status"> & { status?: Receipt["status"] }
): Receipt {
  const receipt: Receipt = {
    ...input,
    id: `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: input.status || "pending",
  };
  const list = read();
  list.unshift(receipt);
  write(list.slice(0, 200));
  return receipt;
}

export function markReceiptPaid(id: string): Receipt | null {
  const list = read();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  list[idx] = {
    ...list[idx],
    status: "paid",
    paidAt: new Date().toISOString(),
  };
  write(list);
  return list[idx];
}
