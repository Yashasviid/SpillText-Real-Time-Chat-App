"use client";

import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Id } from "@/convex/_generated/dataModel";

interface ChatPageProps {
  params: {
    conversationId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const conversationId = params.conversationId as Id<"conversations">;

  return (
    <div className="flex h-screen bg-[#0d1424] overflow-hidden">
      {/* Sidebar: desktop only */}
      <div className="hidden md:block w-[320px]">
        <Sidebar />
      </div>

      {/* Chat: fullscreen on mobile */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatWindow conversationId={conversationId} />
      </main>
    </div>
  );
}