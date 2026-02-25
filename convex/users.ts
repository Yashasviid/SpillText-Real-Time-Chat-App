import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Sync Clerk user to Convex
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      isOnline: true,
      lastSeen: Date.now(),
    });

    return userId;
  },
});

export const setOnlineStatus = mutation({
  args: {
    clerkId: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return;

    await ctx.db.patch(user._id, {
      isOnline: args.isOnline,
      // ✅ UPDATE lastSeen ONLY WHEN ONLINE
      lastSeen: args.isOnline ? Date.now() : user.lastSeen,
    });
  },
});
export const getMe = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getAllUsers = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) return [];

    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u._id !== me._id);
  },
});

export const searchUsers = query({
  args: { 
    clerkId: v.string(),
    search: v.string() 
  },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!me) return [];

    const allUsers = await ctx.db.query("users").collect();
    const search = args.search.toLowerCase();
    
    return allUsers.filter(
      (u) =>
        u._id !== me._id &&
        (u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search))
    );
  },
});
