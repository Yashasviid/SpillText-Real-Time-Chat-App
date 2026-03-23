"use client";
import { useState, useEffect } from "react";
import { Users, ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";

interface ChatHeaderProps { conversation: any }
const ONLINE_TIMEOUT = 25000;

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [, setTick] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 8000);
    return () => clearInterval(interval);
  }, []);

  if (!conversation) return null;

  const router = useRouter();
  const isGroup = conversation.isGroup ?? false;
  const otherUserFromConv = !isGroup ? conversation.otherUsers?.[0] : null;

  // ✅ Live query for other user's presence — always fresh
  const liveOtherUser = useQuery(
    api.users.getMe,
    otherUserFromConv?.clerkId ? { clerkId: otherUserFromConv.clerkId } : "skip"
  );

  // Use live data if available, fall back to conversation data
  const otherUser = liveOtherUser ?? otherUserFromConv;

  const name = isGroup ? (conversation.groupName ?? "Group") : (otherUser?.name ?? "Unknown");
  const imageUrl = isGroup ? null : otherUser?.imageUrl;
  const lastSeenRaw = !isGroup && typeof otherUser?.lastSeen === "number" ? otherUser.lastSeen : null;
  const isOnline = !isGroup && otherUser?.isOnline && lastSeenRaw && (Date.now() - lastSeenRaw < ONLINE_TIMEOUT);
  const statusText = isGroup
    ? `${conversation.otherUsers?.length ?? 1} members`
    : isOnline ? "Online"
    : lastSeenRaw ? `Last seen ${formatDistanceToNow(lastSeenRaw, { addSuffix: true })}`
    : "Offline";

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#111827]">
        <button
          onClick={() => router.push("/chat")}
          className="w-8 h-8 rounded-lg hover:bg-white/5 text-slate-400 flex items-center justify-center transition"
        >
          <ArrowLeft size={16} />
        </button>

        <button
          onClick={() => setShowProfile(true)}
          className="relative flex-shrink-0 hover:opacity-80 transition"
        >
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22d3a0]/30 to-blue-500/30 flex items-center justify-center">
              {isGroup
                ? <Users size={16} className="text-[#22d3a0]" />
                : <span className="text-white font-semibold">{name?.[0]?.toUpperCase()}</span>}
            </div>
          )}
          {!isGroup && (
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#111827] ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
            }`} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-white truncate" style={{ fontFamily: "Syne, sans-serif" }}>
            {name}
          </h2>
          <p className={`text-xs ${isOnline ? "text-emerald-400" : "text-slate-500"}`}>
            {statusText}
          </p>
        </div>
      </div>

      {/* Profile modal */}
      {showProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="relative bg-[#111827] border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl max-w-xs w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center transition"
            >
              <X size={14} />
            </button>

            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-28 h-28 rounded-full object-cover border-2 border-white/10" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#22d3a0]/30 to-blue-500/30 flex items-center justify-center">
                {isGroup
                  ? <Users size={40} className="text-[#22d3a0]" />
                  : <span className="text-white text-4xl font-bold">{name?.[0]?.toUpperCase()}</span>}
              </div>
            )}

            <div className="text-center">
              <h3 className="text-white font-bold text-lg">{name}</h3>
              <p className={`text-sm mt-1 ${isOnline ? "text-emerald-400" : "text-slate-500"}`}>
                {statusText}
              </p>
              {!isGroup && otherUser?.email && (
                <p className="text-xs text-slate-600 mt-1">
                  {otherUser.email.replace(/(.{2}).+(@.+)/, "$1***$2")}
                </p>
              )}
            </div>

            {isGroup && conversation.otherUsers?.length > 0 && (
              <div className="w-full border-t border-white/5 pt-4">
                <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Members</p>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {conversation.otherUsers.map((u: any) => (
                    <div key={u._id} className="flex items-center gap-3">
                      {u.imageUrl ? (
                        <img src={u.imageUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22d3a0]/20 to-blue-500/20 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">{u.name?.[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <span className="text-sm text-slate-300">{u.name}</span>
                      <span className={`ml-auto w-2 h-2 rounded-full ${u.isOnline ? "bg-emerald-500" : "bg-slate-600"}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}