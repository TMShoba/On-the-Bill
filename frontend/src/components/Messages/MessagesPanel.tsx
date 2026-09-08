import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mockMessagingApi,
  fileToAttachment,
} from "../../Services/mockMessagingApi";
import { useAuth } from "../../context/AuthContext";
import type { MessageAttachment } from "../../Types/Artist";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MessagesPanel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [pendingFile, setPendingFile] = useState<MessageAttachment | null>(null);
  const [fileError, setFileError] = useState("");

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => mockMessagingApi.listConversations(user!.id),
    enabled: Boolean(user),
    refetchInterval: 5000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => mockMessagingApi.getMessages(activeId!, user!.id),
    enabled: Boolean(activeId && user),
  });

  const sendMut = useMutation({
    mutationFn: () =>
      mockMessagingApi.sendMessage({
        conversationId: activeId!,
        senderId: user!.id,
        senderName: user!.name,
        body: body.trim(),
        attachment: pendingFile || undefined,
      }),
    onSuccess: () => {
      setBody("");
      setPendingFile(null);
      setFileError("");
      if (fileRef.current) fileRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["messages", activeId] });
      qc.invalidateQueries({ queryKey: ["conversations", user?.id] });
      qc.invalidateQueries({ queryKey: ["unread", user?.id] });
    },
  });

  async function onFileChange(file: File | null) {
    setFileError("");
    if (!file) {
      setPendingFile(null);
      return;
    }
    try {
      const att = await fileToAttachment(file);
      setPendingFile(att);
    } catch (e) {
      setPendingFile(null);
      setFileError((e as Error).message);
    }
  }

  if (!user) return null;

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="grid min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-200 md:border-b-0 md:border-r">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-900">
          Messages
        </div>
        <ul className="max-h-64 overflow-y-auto md:max-h-[380px]">
          {conversations.length === 0 && (
            <li className="px-4 py-6 text-sm text-slate-500">
              No conversations yet.
            </li>
          )}
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-slate-50 ${
                  activeId === c.id ? "bg-slate-50" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900">
                    {user.role === "artist" ? c.promoterName : c.artistName}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <span className="truncate text-xs text-slate-500">
                  {c.lastMessagePreview}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-col">
        {!activeId ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
              {user.role === "artist"
                ? active?.promoterName
                : active?.artistName}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.map((m) => {
                const mine = m.senderId === user.id;
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {m.attachment && (
                        <a
                          href={m.attachment.dataUrl}
                          download={m.attachment.name}
                          className={`mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                            mine
                              ? "bg-white/10 hover:bg-white/20"
                              : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-base">📎</span>
                          <span className="min-w-0 flex-1 truncate">
                            {m.attachment.name}
                          </span>
                          <span className={mine ? "text-slate-300" : "text-slate-400"}>
                            {formatSize(m.attachment.size)}
                          </span>
                        </a>
                      )}
                      {m.body && <p>{m.body}</p>}
                      <p
                        className={`mt-1 text-[10px] ${
                          mine ? "text-slate-300" : "text-slate-400"
                        }`}
                      >
                        {new Date(m.createdAt).toLocaleString("en-ZA", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 p-3">
              {pendingFile && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  <span className="truncate font-medium">
                    📎 {pendingFile.name}
                  </span>
                  <span className="text-slate-400">
                    {formatSize(pendingFile.size)}
                  </span>
                  <button
                    type="button"
                    className="ml-auto text-slate-500 hover:text-slate-800"
                    onClick={() => {
                      setPendingFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              {fileError && (
                <p className="mb-2 text-xs text-red-600">{fileError}</p>
              )}
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!body.trim() && !pendingFile) return;
                  sendMut.mutate();
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.xls,.xlsx"
                  onChange={(e) =>
                    onFileChange(e.target.files?.[0] || null)
                  }
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  title="Attach document"
                >
                  📎
                </button>
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={
                    sendMut.isPending || (!body.trim() && !pendingFile)
                  }
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>
              <p className="mt-1.5 text-[10px] text-slate-400">
                Attach rider, invoice or contract (max ~1.5MB in demo)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
