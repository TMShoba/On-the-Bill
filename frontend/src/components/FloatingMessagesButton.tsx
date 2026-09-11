import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { mockMessagingApi } from "../Services/mockMessagingApi";

/**
 * Desktop/tablet floating Messages pill (Instagram-style).
 * Hidden on mobile (bottom nav owns Messages) and on the /messages page itself.
 */
export default function FloatingMessagesButton() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const { data: unread = 0 } = useQuery({
    queryKey: ["unread", user?.id],
    queryFn: () => mockMessagingApi.totalUnread(user!.id),
    enabled: Boolean(user),
    refetchInterval: 5000,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => mockMessagingApi.listConversations(user!.id),
    enabled: Boolean(user),
    refetchInterval: 5000,
  });

  if (!isAuthenticated) return null;
  if (location.pathname.startsWith("/messages")) return null;
  if (location.pathname === "/login" || location.pathname === "/register")
    return null;

  const avatars = conversations.slice(0, 3).map((c) => {
    const name =
      user?.role === "artist" ? c.promoterName : c.artistName;
    return name?.charAt(0)?.toUpperCase() || "?";
  });

  return (
    <Link
      to="/messages"
      className="fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white py-2.5 pl-3.5 pr-2 shadow-lg shadow-slate-900/10 transition hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] sm:flex"
      aria-label={unread > 0 ? `Messages, ${unread} unread` : "Messages"}
    >
      <svg
        className="h-5 w-5 text-slate-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <span className="text-sm font-semibold text-slate-800">Messages</span>
      {unread > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
      {avatars.length > 0 && (
        <span className="ml-0.5 flex -space-x-1.5">
          {avatars.map((letter, i) => (
            <span
              key={`${letter}-${i}`}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-[10px] font-bold text-white"
            >
              {letter}
            </span>
          ))}
        </span>
      )}
    </Link>
  );
}
