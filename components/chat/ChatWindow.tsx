"use client";
import chatBg from "@/assets/background.png";
import { useEffect, useRef, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

interface ChatWindowProps {
  conversationId: Id<"conversations">;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useUser();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);

  const markAsRead = useMutation(api.conversations.markAsRead);

  useEffect(() => {
    if (user && conversationId) {
      markAsRead({ conversationId, clerkId: user.id });
    }
  }, [conversationId, user?.id, markAsRead]);

  const typingData = useQuery(
    api.typing.getTyping,
    user ? { conversationId, clerkId: user.id } : "skip"
  );
  const setTyping = useMutation(api.typing.setTyping);

  const conversation = useQuery(
    api.conversations.getConversation,
    user ? { clerkId: user.id, conversationId } : "skip"
  );
  const messages = useQuery(
    api.messages.getMessages,
    user ? { clerkId: user.id, conversationId } : "skip"
  );
  const sendMessage = useMutation(api.messages.sendMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (user) setTyping({ conversationId, isTyping, clerkId: user.id });
    },
    [conversationId, setTyping, user]
  );

  const scrollToBottom = useCallback(() => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
    setShowNewMessagesButton(false);
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowNewMessagesButton(!isBottom);
  }, []);

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (isBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowNewMessagesButton(false);
    }
  }, [messages]);

  const handleSend = async (content: string, type: "text" | "emoji" = "text") => {
    if (!user || !content.trim()) return;
    await sendMessage({ clerkId: user.id, conversationId, content, messageType: type });
    handleTyping(false);
  };

  const handleDelete = async (messageId: Id<"messages">) => {
    if (!user) return;
    setDeletingId(String(messageId));
    await deleteMessage({ clerkId: user.id, messageId });
    setDeletingId(null);
  };

  const getDateLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const groupedMessages: { dateLabel: string; messages: any[] }[] = [];
  messages?.forEach((msg, i) => {
    const prev = messages[i - 1];
    const sameDay =
      prev && isSameDay(new Date(msg._creationTime), new Date(prev._creationTime));
    if (!sameDay) {
      groupedMessages.push({ dateLabel: getDateLabel(msg._creationTime), messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "#0a1020" }}>
        <div className="w-8 h-8 border-2 border-[#22d3a0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full" style={{ background: "#0a1020", position: "relative", minWidth: 0 }}>
      {/* Background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `url(${chatBg.src})`,
        backgroundSize: "cover", backgroundPosition: "center",
        backgroundRepeat: "no-repeat", opacity: 0.05,
      }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
        <ChatHeader conversation={conversation} />
      </div>

      {/* Typing indicator */}
      {typingData && typingData.user && (
        <div className="px-4 sm:px-6 py-2 border-b border-white/5"
          style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-slate-400 rounded-full inline-block"
                  style={{ animation: `typingBounce 1.2s ${i * 0.2}s ease-in-out infinite` }}
                />
              ))}
            </span>
            <span>{typingData.user.name || "Someone"} is typing...</span>
          </p>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{ position: "relative", zIndex: 1, flex: 1, overflowY: "auto", padding: "16px" }}
        className="sm:px-6 space-y-1"
      >
        {groupedMessages.map((group) => (
          <div key={group.dateLabel}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-slate-500 px-3 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                {group.dateLabel}
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-1">
              {group.messages.map((msg, i) => {
                const prev = group.messages[i - 1];
                const showAvatar = !prev || prev.senderId !== msg.senderId;
                return (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    showAvatar={showAvatar}
                    onDelete={() => handleDelete(msg._id)}
                    isDeleting={deletingId === msg._id}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {messages?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-slate-500 text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* New messages button */}
      {showNewMessagesButton && (
        <button
          onClick={scrollToBottom}
          style={{ zIndex: 50 }}
          className="fixed bottom-28 right-4 sm:right-6 w-11 h-11 bg-[#22d3a0] text-black rounded-full shadow-lg flex items-center justify-center text-lg font-bold hover:bg-[#16b88a] transition-all"
        >↓</button>
      )}

      {/* Input */}
      <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
        <ChatInput onSend={handleSend} onTyping={handleTyping} conversationId={conversationId} />
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}