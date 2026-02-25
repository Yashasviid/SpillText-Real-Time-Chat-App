import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const sendMessage = mutation({
  args: {
    clerkId: v.string(),
    conversationId: v.id("conversations"),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("emoji")
    ),
  },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) throw new Error("User not found");
    
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: me._id,
      content: args.content,
      messageType: args.messageType,
      isDeleted: false,
      readBy: [me._id],
    });
     // INCREMENT unread for OTHER participants
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation?.participants) {
      const newUnreadCounts = { ...conversation.unreadCounts || {} };
    conversation.participants.forEach((participantId: Id<"users">) => {
      if (participantId.toString() !== me._id.toString()) {
        newUnreadCounts[participantId.toString()] = 
          (newUnreadCounts[participantId.toString()] || 0) + 1;
      }
    });
    await ctx.db.patch(args.conversationId, {
      unreadCounts: newUnreadCounts,
      lastMessageId: messageId,
      lastMessageTime: Date.now(),
    });
    }

    return messageId;
  },
});
   

export const deleteMessage = mutation({
  args: {
    clerkId: v.string(),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) throw new Error("User not found");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== me._id) {
      throw new Error("Not authorized to delete this message");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      content: "This message was deleted",
    });
  },
});

export const markAsRead = mutation({
  args: {
    clerkId: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) throw new Error("User not found");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    await Promise.all(
      messages
        .filter((m) => !m.readBy.includes(me._id))
        .map((m) =>
          ctx.db.patch(m._id, {
            readBy: [...m.readBy, me._id],
          })
        )
    );
  },
});

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender,
          isMe: message.senderId === me._id,
        };
      })
    );

    return messagesWithSender;
  },
});

export const getUnreadCount = query({
  args: {
    clerkId: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) return 0;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return messages.filter(
      (m) => !m.readBy.includes(me._id) && m.senderId !== me._id
    ).length;
  },
});
