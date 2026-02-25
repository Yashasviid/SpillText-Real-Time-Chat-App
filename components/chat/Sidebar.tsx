"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import {
  Search,
  Plus,
  MessageSquare,
  Users,
  X,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
const isUserOnline = (user: any) => {
  if (!user?.isOnline) return false
  return Date.now() - (user.lastSeen ?? 0) < 30000
}

export function Sidebar() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const conversations = useQuery(
    api.conversations.getMyConversations,
    user ? { clerkId: user.id } : "skip"
  );

  const searchedUsers = useQuery(
    api.users.searchUsers,
    user && userSearch ? { clerkId: user.id, search: userSearch } : "skip"
  );

  const allUsers = useQuery(
    api.users.getAllUsers,
    user && !userSearch ? { clerkId: user.id } : "skip"
  );

  const displayUsers = userSearch ? searchedUsers : allUsers;

  const createConversation = useMutation(
    api.conversations.getOrCreateConversation
  );
  const createGroup = useMutation(api.conversations.createGroupConversation);

  const handleStartChat = async (userId: string) => {
    if (!user) return;
    const conversationId = await createConversation({
      clerkId: user.id,
      otherUserId: userId as Id<"users">,
    });
    router.push(`/chat/${conversationId}`);
    setShowNewChat(false);
    setUserSearch("");
    setSelectedUsers([]);
  };

  const handleCreateGroup = async () => {
    if (!user || selectedUsers.length < 2 || !groupName.trim()) return;
    const conversationId = await createGroup({
      clerkId: user.id,
      groupName: groupName.trim(),
      memberIds: selectedUsers as Id<"users">[],
    });
    router.push(`/chat/${conversationId}`);
    setShowNewChat(false);
    setSelectedUsers([]);
    setGroupName("");
    setIsGroup(false);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getConversationName = (conv: any) => {
    if (conv.isGroup) return conv.groupName;
    return conv.otherUsers[0]?.name ?? "Unknown";
  };
  
  const getConversationImage = (conv: any) => {
    if (conv.isGroup) return null;
    return conv.otherUsers[0]?.imageUrl;
  };
  const isUserOnline = (user: {
  isOnline: boolean;
  lastSeen: number;
  }) => {
    if (!user?.isOnline) return false;
    return Date.now() - user.lastSeen < 30_000; // 30 seconds
  };


  const filteredConversations = conversations?.filter((conv: any) => {
    const name = getConversationName(conv)?.toLowerCase() ?? "";
    return name.includes(searchQuery.toLowerCase());
  });

  const activeConvId = pathname?.split("/chat/")[1];

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#111827]">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Spill<span className="text-[#22d3a0]">Text</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewChat(true)}
              className="w-8 h-8 rounded-lg bg-[#22d3a0]/10 hover:bg-[#22d3a0]/20 text-[#22d3a0] flex items-center justify-center transition"
            >
              <Plus size={16} />
            </button>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#22d3a0]/30 transition"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <MessageSquare size={24} className="text-slate-600 mb-2" />
            <p className="text-slate-500 text-sm">No conversations yet</p>
            <button
              onClick={() => setShowNewChat(true)}
              className="text-[#22d3a0] text-xs mt-1 hover:underline"
            >
              Start a new chat
            </button>
          </div>
        )}

        {filteredConversations?.map((conv: any) => (
          <div
            key={conv._id}
            onClick={() => router.push(`/chat/${conv._id}`)}
            className={`conversation-item flex items-center gap-3 px-4 py-3 cursor-pointer transition border-l-2 ${
              activeConvId === conv._id
                ? "bg-[#22d3a0]/10 border-[#22d3a0]"
                : "border-transparent hover:bg-white/3"
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {getConversationImage(conv) ? (
                <img
                  src={getConversationImage(conv)}
                  alt={getConversationName(conv)}
                  className="w-11 h-11 rounded-full object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#22d3a0]/30 to-blue-500/30 flex items-center justify-center">
                  {conv.isGroup ? (
                    <Users size={18} className="text-[#22d3a0]" />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {getConversationName(conv)?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              {!conv.isGroup && isUserOnline(conv.otherUsers[0]) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22d3a0] rounded-full border-2 border-[#111827] online-pulse" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white truncate">
                  {getConversationName(conv)}
                </span>
                {conv.lastMessage && (
                  <span className="text-xs text-slate-600 flex-shrink-0 ml-2">
                    {formatDistanceToNow(conv.lastMessage._creationTime, {
                      addSuffix: false,
                    })}
                  </span>
                )}
              </div>
              {conv.lastMessage && (
                <p
                  className={`text-xs truncate mt-0.5 ${
                    conv.lastMessage.isDeleted
                      ? "italic text-slate-600"
                      : "text-slate-500"
                  }`}
                >
                  {conv.lastMessage.isDeleted
                    ? "Message deleted"
                    : conv.lastMessage.content}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-96 max-h-[80vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2
                className="text-lg font-semibold text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                New Conversation
              </h2>
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setSelectedUsers([]);
                  setUserSearch("");
                  setGroupName("");
                  setIsGroup(false);
                }}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* Toggle Group */}
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg">
                <button
                  onClick={() => {
                    setIsGroup(false);
                    setSelectedUsers([]);
                  }}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
                    !isGroup
                      ? "bg-[#22d3a0] text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Direct Message
                </button>
                <button
                  onClick={() => setIsGroup(true)}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
                    isGroup
                      ? "bg-[#22d3a0] text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Group Chat
                </button>
              </div>
            </div>

            {/* Group Name (if group) */}
            {isGroup && (
              <div className="px-4 pt-3">
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#22d3a0]/30"
                />
              </div>
            )}

            {/* Selected Users (group) */}
            {isGroup && selectedUsers.length > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-1">
                {selectedUsers.map((id) => {
                  const u = displayUsers?.find((u: any) => u._id === id);
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1 px-2 py-1 bg-[#22d3a0]/10 text-[#22d3a0] text-xs rounded-full"
                    >
                      {u?.name}
                      <button onClick={() => toggleUserSelection(id)}>
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Search */}
            <div className="px-4 py-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#22d3a0]/30"
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto px-2 py-1">
              {displayUsers?.map((u: any) => (
                <div
                  key={u._id}
                  onClick={() =>
                    isGroup
                      ? toggleUserSelection(u._id)
                      : handleStartChat(u._id)
                  }
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition"
                >
                  <div className="relative">
                    {u.imageUrl ? (
                      <img
                        src={u.imageUrl}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#22d3a0]/20 to-blue-500/20 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {u.name[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    {isUserOnline(u) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22d3a0] rounded-full border-2 border-[#111827]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  {isGroup && selectedUsers.includes(u._id) && (
                    <div className="w-5 h-5 rounded-full bg-[#22d3a0] flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-black" />
                    </div>
                  )}
                </div>
              ))}

              {displayUsers?.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No users found
                </div>
              )}
            </div>

            {/* Create Group Button */}
            {isGroup && (
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={handleCreateGroup}
                  disabled={selectedUsers.length < 2 || !groupName.trim()}
                  className="w-full py-2.5 bg-[#22d3a0] hover:bg-[#16b88a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition text-sm"
                >
                  Create Group ({selectedUsers.length} selected)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
