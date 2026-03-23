"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Check, CheckCheck, FileText, Download, X } from "lucide-react";

interface MessageBubbleProps {
  message: any;
  showAvatar: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

export function MessageBubble({ message, showAvatar, onDelete, isDeleting }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isMe = message.isMe;
  const isDeleted = message.isDeleted;
  const isEmoji =
    message.messageType === "emoji" ||
    (message.content?.match(/^\p{Emoji}/u) && message.content?.length <= 6);
  const isImage = message.messageType === "image" && !isDeleted;
  const isDocument = message.messageType === "document" && !isDeleted;
  const isVideo =
    isImage &&
    (message.content?.includes(".mp4") ||
      message.content?.includes(".webm") ||
      message.content?.includes(".mov"));
  const readByAll = message.readBy?.length > 1;

  const bubbleClass = isMe
    ? "bg-[#1a6b54] text-white rounded-tr-sm"
    : "bg-[#1e293b] text-slate-200 rounded-tl-sm";

  return (
    <>
      {/* Lightbox */}
      {lightboxOpen && isImage && !isVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
          <img
            src={message.content}
            alt="Full size"
            className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <a
            href={message.content}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={14} />
            Download
          </a>
        </div>
      )}

      {/* Message row */}
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
            {showAvatar &&
              (message.sender?.imageUrl ? (
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
              ))}
          </div>
        )}

        {/* Delete button */}
        {isMe && showActions && !isDeleted && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"
          >
            <Trash2 size={12} />
          </button>
        )}

        {/* Bubble content */}
        <div
          className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[65%]`}
        >
          {/* Sender name in group */}
          {!isMe && showAvatar && message.sender && (
            <span className="text-xs text-[#22d3a0] mb-1 ml-1 font-medium">
              {message.sender.name}
            </span>
          )}

          {/* Image */}
          {isImage && !isVideo && (
            <div
              className={`relative rounded-2xl overflow-hidden cursor-pointer ${
                isMe ? "rounded-tr-sm" : "rounded-tl-sm"
              }`}
              style={{ maxWidth: 260 }}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={message.content}
                alt="Image"
                className="w-full object-cover hover:opacity-90 transition"
                style={{ maxHeight: 220 }}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <span className="text-xs text-white/70 bg-black/40 px-1.5 py-0.5 rounded-full">
                  {format(new Date(message._creationTime), "HH:mm")}
                </span>
                {isMe &&
                  (readByAll ? (
                    <CheckCheck size={11} className="text-[#22d3a0]" />
                  ) : (
                    <Check size={11} className="text-white/60" />
                  ))}
              </div>
            </div>
          )}

          {/* Video */}
          {isVideo && (
            <div
              className={`relative rounded-2xl overflow-hidden ${
                isMe ? "rounded-tr-sm" : "rounded-tl-sm"
              }`}
              style={{ maxWidth: 280 }}
            >
              <video
                src={message.content}
                controls
                className="w-full rounded-2xl"
                style={{ maxHeight: 220 }}
              />
              <div className="absolute bottom-2 right-2">
                <span className="text-xs text-white/70 bg-black/40 px-1.5 py-0.5 rounded-full">
                  {format(new Date(message._creationTime), "HH:mm")}
                </span>
              </div>
            </div>
          )}

          {/* Document */}
          {isDocument && (
            <a
              href={message.content}
              download={message.fileName || "document"}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl no-underline hover:opacity-80 transition ${
                isMe ? "bg-[#1a6b54] rounded-tr-sm" : "bg-[#1e293b] rounded-tl-sm"
              }`}
              style={{ maxWidth: 260 }}
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {message.fileName || "Document"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Tap to download</p>
              </div>
              <Download size={14} className="text-slate-400 flex-shrink-0" />
            </a>
          )}

          {/* Text / Emoji */}
          {!isImage && !isDocument && (
            <div
              className={`relative rounded-2xl px-3 py-2 ${
                isEmoji && !isDeleted ? "bg-transparent px-0 py-0" : bubbleClass
              } ${isDeleted ? "opacity-60 italic" : ""}`}
            >
              <p
                className={`${
                  isEmoji && !isDeleted ? "text-4xl" : "text-sm leading-relaxed"
                } break-words`}
              >
                {message.content}
              </p>
            </div>
          )}

          {/* Timestamp — only for text/emoji/doc (image has it overlaid) */}
          {!isImage && !isVideo && (
            <div
              className={`flex items-center gap-1 mt-0.5 ${isMe ? "flex-row-reverse" : ""}`}
            >
              <span className="text-xs text-slate-600">
                {format(new Date(message._creationTime), "HH:mm")}
              </span>
              {isMe && !isDeleted &&
                (readByAll ? (
                  <CheckCheck size={12} className="text-[#22d3a0]" />
                ) : (
                  <Check size={12} className="text-slate-500" />
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}