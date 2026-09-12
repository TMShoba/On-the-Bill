import { api } from "./api";
import type { Conversation, Message, MessageAttachment } from "../Types/Artist";

export async function listConversationsApi(): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>("/messages/conversations");
  return data;
}

export async function getMessagesApi(
  conversationId: string
): Promise<Message[]> {
  const { data } = await api.get<Message[]>(
    `/messages/conversations/${conversationId}/messages`
  );
  return data;
}

export async function sendMessageApi(input: {
  conversationId: string;
  senderName: string;
  body: string;
  attachment?: MessageAttachment;
}): Promise<Message> {
  const { data } = await api.post<Message>(
    `/messages/conversations/${input.conversationId}/messages`,
    {
      body: input.body,
      senderName: input.senderName,
      attachment: input.attachment,
    }
  );
  return data;
}

export async function ensureConversationApi(input: {
  bookingId: string;
  artistId: string;
  artistName: string;
  promoterId: string;
  promoterName: string;
  initialMessage?: string;
}): Promise<Conversation> {
  const { data } = await api.post<Conversation>("/messages/conversations", input);
  return data;
}

export async function totalUnreadApi(): Promise<number> {
  const { data } = await api.get<{ count: number }>("/messages/unread-count");
  return data.count;
}
