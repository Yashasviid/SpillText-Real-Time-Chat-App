"use client";

import { Sidebar } from "@/components/chat/Sidebar";
import { EmptyChat } from "@/components/chat/EmptyChat";

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-[#0d1424] overflow-hidden">
      {/* Sidebar: always visible */}
      <div className="w-full md:w-[320px]">
        <Sidebar />
      </div>

      {/* Empty state: desktop only */}
      <main className="hidden md:flex flex-1 flex-col">
        <EmptyChat />
      </main>
    </div>
  );
}