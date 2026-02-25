"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

interface ChatWindowProps {
  conversationId: Id<"conversations">;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useUser();
  const messagesContainerRef = useRef<HTMLDivElement>(null);  // ✅ NEW for smart scroll
  const bottomRef = useRef<HTMLDivElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);  // ✅ NEW
  
  const markAsRead = useMutation(api.conversations.markAsRead);

  // Mark read when convo opens
  useEffect(() => {
    if (user && conversationId) {
      markAsRead({ conversationId, clerkId: user.id });
    }
  }, [conversationId, user?.id, markAsRead]);

  // Typing indicator
  const typingUser = useQuery(api.typing.getTyping, { conversationId });
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

  // Typing handler
  const handleTyping = useCallback((isTyping: boolean) => {
    setTyping({ conversationId, isTyping });
  }, [conversationId, setTyping]);

  // SMART SCROLL FUNCTIONS
  const scrollToBottom = useCallback(() => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth"
    });
    setShowNewMessagesButton(false);
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowNewMessagesButton(!isBottom);
  }, []);

  // SMART AUTO-SCROLL (only if near bottom)
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isBottom) {
      // Already at bottom → smooth scroll
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowNewMessagesButton(false);
    }
  }, [messages]);

  const handleSend = async (content: string, type: "text" | "emoji" = "text") => {
    if (!user || !content.trim()) return;
    await sendMessage({
      clerkId: user.id,
      conversationId,
      content,
      messageType: type,
    });
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
    const sameDay = prev && isSameDay(new Date(msg._creationTime), new Date(prev._creationTime));
    if (!sameDay) {
      groupedMessages.push({
        dateLabel: getDateLabel(msg._creationTime),
        messages: [msg],
      });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f1720]">
        <div className="w-8 h-8 border-2 border-[#22d3a0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f1720] h-full relative">
      <ChatHeader conversation={conversation} />
      
      {/* TYPING INDICATOR */}
      {typingUser && typingUser.user && "clerkId" in typingUser.user && typingUser.user.clerkId !== user?.id && (
        <div className="px-6 py-2 border-b border-white/5">
          <p className="text-xs text-slate-400 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="ml-1">{typingUser.user?.name || "Someone"} is typing...</span>
          </p>
        </div>
      )}

      {/* SMART SCROLL MESSAGES CONTAINER */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-1"
        onScroll={handleScroll}
      >
        {groupedMessages.map((group) => (
          <div key={group.dateLabel}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-slate-600 px-3 py-1 bg-white/3 rounded-full">
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

      {/* NEW MESSAGES BUTTON */}
      {showNewMessagesButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 right-6 w-12 h-12 bg-[#22d3a0] text-black rounded-full shadow-lg flex items-center justify-center text-lg font-bold hover:bg-[#16b88a] transition-all duration-200 z-50"
        >
          ↓
        </button>
      )}

      <ChatInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
}
