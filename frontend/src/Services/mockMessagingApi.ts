import type { Conversation, Message, MessageAttachment } from "../Types/Artist";
import { notifyNewMessage } from "./notificationStore";

const CONV_KEY = "otb_conversations";
const MSG_KEY = "otb_messages";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return crypto.randomUUID();
}

export const mockMessagingApi = {
  async listConversations(userId: string): Promise<Conversation[]> {
    const all = read<Conversation[]>(CONV_KEY, []);
    return all
      .filter((c) => c.artistId === userId || c.promoterId === userId)
      .map((c) => {
        const msgs = read<Message[]>(MSG_KEY, []).filter(
          (m) => m.conversationId === c.id
        );
        const unread = msgs.filter((m) => !m.read && m.senderId !== userId)
          .length;
        return { ...c, unreadCount: unread };
      })
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  },

  async getMessages(conversationId: string, userId: string): Promise<Message[]> {
    const msgs = read<Message[]>(MSG_KEY, [])
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const now = new Date().toISOString();
    const updated = read<Message[]>(MSG_KEY, []).map((m) =>
      m.conversationId === conversationId && m.senderId !== userId && !m.read
        ? { ...m, read: true, readAt: now }
        : m
    );
    write(MSG_KEY, updated);

    return msgs.map((m) =>
      m.senderId !== userId && !m.read ? { ...m, read: true, readAt: now } : m
    );
  },

  async sendMessage(input: {
    conversationId: string;
    senderId: string;
    senderName: string;
    body: string;
    attachment?: MessageAttachment;
    critical?: boolean;
  }): Promise<Message> {
    const preview = input.attachment
      ? `📎 ${input.attachment.name}${input.body ? ` — ${input.body}` : ""}`
      : input.body;

    const msg: Message = {
      id: uid(),
      conversationId: input.conversationId,
      senderId: input.senderId,
      senderName: input.senderName,
      body: input.body || (input.attachment ? `Sent ${input.attachment.name}` : ""),
      createdAt: new Date().toISOString(),
      read: false,
      critical: input.critical,
      attachment: input.attachment,
    };
    const msgs = read<Message[]>(MSG_KEY, []);
    msgs.push(msg);
    write(MSG_KEY, msgs);

    const convs = read<Conversation[]>(CONV_KEY, []);
    const idx = convs.findIndex((c) => c.id === input.conversationId);
    if (idx >= 0) {
      const conv = convs[idx];
      convs[idx] = {
        ...conv,
        lastMessageAt: msg.createdAt,
        lastMessagePreview: preview.slice(0, 80),
      };
      write(CONV_KEY, convs);

      // Notify the other party
      const recipientId =
        input.senderId === conv.artistId ? conv.promoterId : conv.artistId;
      if (recipientId && recipientId !== input.senderId) {
        notifyNewMessage({
          recipientId,
          senderName: input.senderName,
          preview: preview,
        });
      }
    }

    return msg;
  },

  async ensureConversationForBooking(input: {
    bookingId: string;
    artistId: string;
    artistName: string;
    promoterId: string;
    promoterName: string;
    initialMessage?: string;
  }): Promise<Conversation> {
    const convs = read<Conversation[]>(CONV_KEY, []);
    let existing = convs.find((c) => c.bookingId === input.bookingId);
    if (existing) return existing;

    const now = new Date().toISOString();
    const conv: Conversation = {
      id: uid(),
      bookingId: input.bookingId,
      artistId: input.artistId,
      artistName: input.artistName,
      promoterId: input.promoterId,
      promoterName: input.promoterName,
      lastMessageAt: now,
      lastMessagePreview: input.initialMessage?.slice(0, 80) || "Booking request",
      unreadCount: 0,
    };
    convs.push(conv);
    write(CONV_KEY, convs);

    if (input.initialMessage) {
      await this.sendMessage({
        conversationId: conv.id,
        senderId: input.promoterId,
        senderName: input.promoterName,
        body: input.initialMessage,
        critical: true,
      });
    }

    return conv;
  },

  async totalUnread(userId: string): Promise<number> {
    const convs = await this.listConversations(userId);
    return convs.reduce((sum, c) => sum + c.unreadCount, 0);
  },

  /** Find the conversation tied to a specific booking, if one exists yet. */
  getConversationByBooking(bookingId: string): Conversation | null {
    const all = read<Conversation[]>(CONV_KEY, []);
    return all.find((c) => c.bookingId === bookingId) || null;
  },

  /**
   * Post a system-generated, read-receipt-tracked message into a booking's
   * conversation — used for booking-critical events (accepted, declined,
   * paid, contract issued). Silently no-ops if no conversation exists yet
   * (e.g. a booking created outside the normal request flow).
   */
  async postSystemMessage(input: {
    bookingId: string;
    senderId: string;
    senderName: string;
    body: string;
  }): Promise<Message | null> {
    const conv = this.getConversationByBooking(input.bookingId);
    if (!conv) return null;
    return this.sendMessage({
      conversationId: conv.id,
      senderId: input.senderId,
      senderName: input.senderName,
      body: input.body,
      critical: true,
    });
  },
};

/** Read a File into a MessageAttachment (capped for localStorage demo) */
export function fileToAttachment(file: File): Promise<MessageAttachment> {
  const MAX = 1.5 * 1024 * 1024; // 1.5MB — localStorage is limited
  if (file.size > MAX) {
    return Promise.reject(
      new Error("File too large for demo storage (max ~1.5MB). Use PDF or a smaller file.")
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: String(reader.result),
      });
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
