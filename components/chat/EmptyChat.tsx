"use client";

import { MessageSquare, Plus } from "lucide-react";

export function EmptyChat() {
  const handleClick = () => {
    const btn = document.querySelector<HTMLButtonElement>(".sidebar-new-chat-btn");
    btn?.click();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a1020] text-center px-8">
      <button onClick={handleClick} className="relative mb-6 group">
        <div className="w-20 h-20 rounded-2xl bg-[#22d3a0]/10 group-hover:bg-[#22d3a0]/20 flex items-center justify-center transition">
          <MessageSquare size={36} className="text-[#22d3a0]" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#22d3a0] rounded-full flex items-center justify-center">
          <Plus size={12} className="text-black" />
        </div>
      </button>

      <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
        Your Messages
      </h2>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        Start a conversation. Click the{" "}
        <span className="text-[#22d3a0] font-semibold">+</span> icon above to begin.
      </p>
    </div>
  );
}