import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getOrCreateConversation = mutation({
  args: {
    clerkId: v.string(),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) throw new Error("User not found");

    // Check if conversation already exists between these two users
    const myMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();

    for (const membership of myMemberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      if (!conversation || conversation.isGroup) continue;

      const otherMembership = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation_user", (q) =>
          q
            .eq("conversationId", membership.conversationId)
            .eq("userId", args.otherUserId)
        )
        .unique();

      if (otherMembership) {
        return membership.conversationId;
      }
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      participants: [me._id, args.otherUserId],
      isGroup: false,
      lastMessageTime: Date.now(),
      unreadCounts: {},
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: me._id,
      joinedAt: Date.now(),
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: args.otherUserId,
      joinedAt: Date.now(),
    });

    return conversationId;
  },
});

export const createGroupConversation = mutation({
  args: {
    clerkId: v.string(),
    groupName: v.string(),
    memberIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) throw new Error("User not found");

    const allMembers = [me._id, ...args.memberIds];

    const conversationId = await ctx.db.insert("conversations", {
      participants: allMembers,
      isGroup: true,
      groupName: args.groupName,
      lastMessageTime: Date.now(),
      unreadCounts: {},
    });

    for (const memberId of allMembers) {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        userId: memberId,
        joinedAt: Date.now(),
      });
    }

    return conversationId;
  },
});

export const getMyConversations = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) return [];

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();

    const conversations = await Promise.all(
      memberships.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);
        if (!conversation) return null;

        // Get last message
        let lastMessage = null;
        if (conversation.lastMessageId) {
          lastMessage = await ctx.db.get(conversation.lastMessageId);
        }

        // Get other participants info
        const otherMembers = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", membership.conversationId)
          )
          .collect();

        const otherUsers = await Promise.all(
          otherMembers
            .filter((m) => m.userId !== me._id)
            .map((m) => ctx.db.get(m.userId))
        );

        return {
          ...conversation,
          lastMessage,
          otherUsers: otherUsers.filter(Boolean),
          me,
        };
      })
    );

    return conversations
      .filter(Boolean)
      .sort(
        (a, b) =>
          (b?.lastMessageTime ?? 0) - (a?.lastMessageTime ?? 0)
      );
  },
});
export const markAsRead = mutation({
  args: { conversationId: v.id("conversations"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      const newUnreadCounts = { ...conversation.unreadCounts || {} };
      newUnreadCounts[args.clerkId] = 0;
      await ctx.db.patch(args.conversationId, { unreadCounts: newUnreadCounts });
    }
  }
});

export const getConversation = query({
  args: {
    clerkId: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const memberUsers = await Promise.all(
      members.map((m) => ctx.db.get(m.userId))
    );

    const otherUsers = memberUsers.filter(
      (u) => u && u._id !== me._id
    );

    return {
      ...conversation,
      otherUsers,
      me,
    };
  },
});
