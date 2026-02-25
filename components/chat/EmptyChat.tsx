import { MessageSquare } from "lucide-react";

export function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0f1720] text-center px-8">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-[#22d3a0]/10 flex items-center justify-center">
          <MessageSquare size={36} className="text-[#22d3a0]" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#22d3a0] rounded-full flex items-center justify-center">
          <span className="text-black text-xs font-bold">+</span>
        </div>
      </div>

      <h2
        className="text-2xl font-bold text-white mb-2"
        style={{ fontFamily: "Syne, sans-serif" }}
      >
        Your Messages
      </h2>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        get socialised now by creating a new message. Click the <span className="text-[#22d3a0]">+</span> icon to start chatting!
      </p>

      <div className="mt-8 grid grid-cols-3 gap-3 opacity-30">
        {["💬","✨"].map((emoji, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl"
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
