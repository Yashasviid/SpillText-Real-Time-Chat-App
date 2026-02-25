"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Smile } from "lucide-react";

const EMOJI_LIST = [
  "😀", "😂", "🥹", "😍", "🤩", "😎", "🥳", "😊", "👍", "❤️",
  "🔥", "✨", "🎉", "🙌", "💯", "🤔", "😅", "😭", "😤", "🫡",
];

interface ChatInputProps {
  onSend: (content: string, type?: "text" | "emoji") => void;
  onTyping?: (isTyping: boolean) => void;  // ← ADD
}

export function ChatInput({ onSend, onTyping }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    const content = message.trim();
    setMessage("");
    setIsSending(true);
    await onSend(content, "text");
    setIsSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = async (emoji: string) => {
    setShowEmoji(false);
    await onSend(emoji, "emoji");
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setMessage(value);
      if (onTyping && value.trim().length > 0) {
        onTyping(true);
      } else if (onTyping) {
        onTyping(false);
      }
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    
    // Typing logic
    if (onTyping) {
      onTyping(e.target.value.length > 0);
    }
  };

  return (
    <div className="relative px-4 py-3 border-t border-white/5 bg-[#111827]">
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-full left-4 mb-2 bg-[#1e293b] border border-white/10 rounded-2xl p-3 grid grid-cols-10 gap-1 shadow-2xl">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 flex items-center justify-center text-xl hover:bg-white/10 rounded-lg transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="message-input flex items-end gap-3 bg-white/5 border border-white/5 rounded-2xl px-4 py-2 transition focus-within:border-[#22d3a0]/30">
        {/* Emoji Button */}
        <button
          onClick={() => setShowEmoji((s) => !s)}
          className={`flex-shrink-0 mb-0.5 transition ${
            showEmoji ? "text-[#22d3a0]" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Smile size={20} />
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none max-h-28 py-1"
          style={{ lineHeight: "1.5" }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition mb-0.5 ${
            message.trim()
              ? "bg-[#22d3a0] hover:bg-[#16b88a] text-black"
              : "bg-white/5 text-slate-600 cursor-not-allowed"
          }`}
        >
          <Send size={15} />
        </button>
      </div>

      <p className="text-xs text-slate-700 text-center mt-1.5">
        Press <kbd className="px-1 py-0.5 bg-white/5 rounded text-slate-600">Enter</kbd> to send,{" "}
        <kbd className="px-1 py-0.5 bg-white/5 rounded text-slate-600">Shift+Enter</kbd> for newline
      </p>
    </div>
  );
}
