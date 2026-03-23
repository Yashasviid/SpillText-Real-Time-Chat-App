"use client";
import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Send, Smile, Paperclip, Image, FileText } from "lucide-react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const EMOJI_CATEGORIES = {
  "😀 Faces": ["😀","😂","🥹","😍","🤩","😎","🥳","😊","😅","😭","😤","🫡","😏","🤔","😴","🥺","😇","🤯","🥸","😈"],
  "👋 Gestures": ["👍","👎","👏","🙌","🤝","✌️","🤞","💪","🫶","❤️","🔥","✨","💯","🎉","🎊","💫","⭐","🌟","💥","🎯"],
  "🐶 Animals": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐸","🦁","🐯","🐮","🐷","🐙","🦋","🐝","🦄","🐲","🦅","🐬"],
  "🍕 Food": ["🍕","🍔","🌮","🍜","🍣","🍩","🎂","☕","🧋","🍺","🥂","🍎","🍊","🍋","🍇","🍓","🍑","🥑","🌽","🥦"],
};

interface ChatInputProps {
  onSend: (content: string, type?: "text" | "emoji") => void;
  onTyping?: (isTyping: boolean) => void;
  conversationId: Id<"conversations">;
}

export function ChatInput({ onSend, onTyping, conversationId }: ChatInputProps) {
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState("😀 Faces");
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const sendFileMessage = useMutation(api.messages.sendFileMessage);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTyping?.(false);
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    const content = message.trim();
    setMessage("");
    setIsSending(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onTyping?.(false);
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

    if (value.trim().length > 0) {
      onTyping?.(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping?.(false);
      }, 3000);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTyping?.(false);
    }

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleFileUpload = async (file: File, type: "image" | "document") => {
    if (!user) return;
    setShowAttach(false);
    setUploadProgress(`Uploading ${type}...`);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await sendFileMessage({
        clerkId: user.id,
        conversationId,
        storageId,
        fileType: type,
        fileName: file.name,
      });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadProgress(null);
    }
  };

  return (
    <div className="relative px-3 sm:px-4 py-3 border-t border-white/5 bg-[#111827]">

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-full left-2 sm:left-4 mb-2 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-[300px] sm:w-[360px] z-50">
          <div className="flex border-b border-white/5 overflow-x-auto">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setEmojiCategory(cat)}
                className={`px-3 py-2 text-xs whitespace-nowrap transition flex-shrink-0 ${
                  emojiCategory === cat
                    ? "text-[#22d3a0] border-b-2 border-[#22d3a0]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-1 p-3 max-h-44 overflow-y-auto">
            {EMOJI_CATEGORIES[emojiCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment menu */}
      {showAttach && (
        <div className="absolute bottom-full left-2 sm:left-4 mb-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1 min-w-[160px] z-50">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 text-sm transition"
          >
            <Image size={16} className="text-blue-400" />
            Send Image
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 text-sm transition"
          >
            <FileText size={16} className="text-orange-400" />
            Send Document
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*,video/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "image"); e.target.value = ""; }}
      />
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx,.csv" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "document"); e.target.value = ""; }}
      />

      {/* Upload progress */}
      {uploadProgress && (
        <div className="mb-2 px-3 py-1.5 bg-[#22d3a0]/10 border border-[#22d3a0]/20 rounded-lg text-xs text-[#22d3a0] flex items-center gap-2">
          <div className="w-3 h-3 border border-[#22d3a0] border-t-transparent rounded-full animate-spin" />
          {uploadProgress}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 bg-white/5 border border-white/5 rounded-2xl px-3 py-2 transition focus-within:border-[#22d3a0]/30">
        <button
          onClick={() => { setShowEmoji((s) => !s); setShowAttach(false); }}
          className={`flex-shrink-0 mb-0.5 transition ${showEmoji ? "text-[#22d3a0]" : "text-slate-500 hover:text-slate-300"}`}
        >
          <Smile size={20} />
        </button>

        <button
          onClick={() => { setShowAttach((s) => !s); setShowEmoji(false); }}
          className={`flex-shrink-0 mb-0.5 transition ${showAttach ? "text-[#22d3a0]" : "text-slate-500 hover:text-slate-300"}`}
        >
          <Paperclip size={18} />
        </button>

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

      <p className="text-xs text-slate-700 text-center mt-1.5 hidden sm:block">
        Press <kbd className="px-1 py-0.5 bg-white/5 rounded text-slate-600">Enter</kbd> to send,{" "}
        <kbd className="px-1 py-0.5 bg-white/5 rounded text-slate-600">Shift+Enter</kbd> for newline
      </p>
    </div>
  );
}