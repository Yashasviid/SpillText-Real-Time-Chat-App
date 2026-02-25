"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: any;
  showAvatar: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

export function MessageBubble({
  message,
  showAvatar,
  onDelete,
  isDeleting,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const isMe = message.isMe;
  const isDeleted = message.isDeleted;
  const isEmoji =
    message.messageType === "emoji" ||
    (message.content.match(/^\p{Emoji}/u) && message.content.length <= 6);

  const readByAll = message.readBy?.length > 1;

  return (
    <div
      className={`flex items-end gap-2 group message-appear ${
        isMe ? "flex-row-reverse" : "flex-row"
      } ${showAvatar ? "mt-3" : "mt-0.5"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isMe && (
        <div className="w-7 flex-shrink-0">
          {showAvatar && (
            <>
              {message.sender?.imageUrl ? (
                <img
                  src={message.sender.imageUrl}
                  alt={message.sender.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#22d3a0]/20 to-blue-500/20 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {message.sender?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Actions (delete) */}
      {isMe && showActions && !isDeleted && (
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"
        >
          <Trash2 size={12} />
        </button>
      )}

      <div
        className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}
      >
        {/* Sender name (group chat) */}
        {!isMe && showAvatar && message.sender && (
          <span className="text-xs text-[#22d3a0] mb-1 ml-1 font-medium">
            {message.sender.name}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`relative rounded-2xl px-3 py-2 ${
            isEmoji && !isDeleted
              ? "bg-transparent text-4xl px-0 py-0"
              : isMe
              ? "bg-[#1a6b54] text-white rounded-tr-sm"
              : "bg-[#1e293b] text-slate-200 rounded-tl-sm"
          } ${isDeleted ? "opacity-60 italic" : ""}`}
        >
          <p
            className={`${isEmoji && !isDeleted ? "text-4xl" : "text-sm leading-relaxed"} break-words`}
          >
            {message.content}
          </p>
        </div>

        {/* Timestamp + read receipts */}
        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "flex-row-reverse" : ""}`}>
          <span className="text-xs text-slate-600">
            {format(new Date(message._creationTime), "HH:mm")}
          </span>
          {isMe && !isDeleted && (
            <span className="text-xs text-slate-600">
              {readByAll ? (
                <CheckCheck size={12} className="text-[#22d3a0]" />
              ) : (
                <Check size={12} className="text-slate-500" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
