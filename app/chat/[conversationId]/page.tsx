"use client";

import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { PresenceSync } from "@/components/PresenceSync";
import { Id } from "@/convex/_generated/dataModel";

interface ChatPageProps {
  params: {
    conversationId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <div className="flex h-screen bg-[#0d1424] overflow-hidden">
      <PresenceSync />
      <div className="hidden md:block md:w-[320px]">
        <Sidebar />
      </div>
      <main className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          conversationId={params.conversationId as Id<"conversations">}
        />
      </main>
    </div>
  );
}