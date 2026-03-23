import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
    clerkId: v.string(), 
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const myRecord = existing.find((t) => t.userId === args.clerkId);

    if (myRecord) {
      await ctx.db.patch(myRecord._id, {
        isTyping: args.isTyping,
        updatedAt: Date.now(),
      });
    } else if (args.isTyping) {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        isTyping: true,
        updatedAt: Date.now(),
        userId: args.clerkId,
      });
    }
  },
});

export const getTyping = query({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const allTyping = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const activeTypers = allTyping.filter(
      (t) =>
        t.isTyping &&
        Date.now() - t.updatedAt < 5000 &&
        t.userId !== args.clerkId 
    );

    if (activeTypers.length === 0) return null;

    const typer = activeTypers[0];
    const userDoc = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", typer.userId))
      .first();

    return { user: userDoc, ...typer };
  },
});