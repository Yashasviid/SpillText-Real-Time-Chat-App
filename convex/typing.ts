import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setTyping = mutation({
  args: { conversationId: v.id("conversations"), isTyping: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return;

    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation", q => q.eq("conversationId", args.conversationId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { 
        isTyping: args.isTyping, 
        updatedAt: Date.now(),
        userId: identity.subject
      });
    } else {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        isTyping: args.isTyping,
        updatedAt: Date.now(),
        userId: identity.subject
      });
    }
  }
});

export const getTyping = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const typing = await ctx.db
      .query("typing")
      .withIndex("by_conversation", q => q.eq("conversationId", args.conversationId))
      .first();

    if (!typing || !typing.isTyping || Date.now() - typing.updatedAt > 2000) {
      return null;
    }

    const userDoc = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", typing.userId))
      .first();

    return { user: userDoc, ...typing };
  }
});
