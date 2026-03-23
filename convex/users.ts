import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUsers = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    if (existingUsers.length > 1) {
      const [keep, ...duplicates] = existingUsers.sort(
        (a, b) => a._creationTime - b._creationTime
      );
      for (const dup of duplicates) {
        await ctx.db.delete(dup._id);
      }
      await ctx.db.patch(keep._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return keep._id;
    }

    if (existingUsers.length === 1) {
      await ctx.db.patch(existingUsers[0]._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existingUsers[0]._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      isOnline: true,
      lastSeen: Date.now(),
    });
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
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return;

    await ctx.db.patch(user._id, {
      isOnline: args.isOnline,
      lastSeen: Date.now(), 
    });
  },
});

export const getMe = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getAllUsers = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!me) return [];

    const users = await ctx.db.query("users").collect();

    const seen = new Map<string, (typeof users)[0]>();
    for (const user of users) {
      const existing = seen.get(user.clerkId);
      if (!existing || user._creationTime > existing._creationTime) {
        seen.set(user.clerkId, user);
      }
    }

    return Array.from(seen.values()).filter((u) => u._id !== me._id);
  },
});

export const searchUsers = query({
  args: {
    clerkId: v.string(),
    search: v.string(),
  },
  handler: async (ctx, args) => {
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!me) return [];

    const allUsers = await ctx.db.query("users").collect();
    const search = args.search.toLowerCase();

    const seen = new Map<string, (typeof allUsers)[0]>();
    for (const user of allUsers) {
      const existing = seen.get(user.clerkId);
      if (!existing || user._creationTime > existing._creationTime) {
        seen.set(user.clerkId, user);
      }
    }

    return Array.from(seen.values()).filter(
      (u) =>
        u._id !== me._id &&
        (u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search))
    );
  },
});

export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      // Clean up all memberships and conversations
      const memberships = await ctx.db
        .query("conversationMembers")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      for (const m of memberships) {
        const otherMembers = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", m.conversationId)
          )
          .collect();

        if (otherMembers.length <= 1) {
          const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
              q.eq("conversationId", m.conversationId)
            )
            .collect();
          for (const msg of messages) await ctx.db.delete(msg._id);
          await ctx.db.delete(m.conversationId);
        }

        await ctx.db.delete(m._id);
      }

      await ctx.db.delete(user._id);
    }
  },
});
export const syncAllImages = mutation({
  handler: async (ctx) => {
    // This just returns all users with their current imageUrls, which the client can use to trigger re-downloads and cache updates.
    const users = await ctx.db.query("users").collect();
    return users.map(u => ({ name: u.name, imageUrl: u.imageUrl, clerkId: u.clerkId }));
  },
});
export const deduplicateUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const grouped = new Map<string, (typeof users)>();
    for (const user of users) {
      const group = grouped.get(user.clerkId) ?? [];
      group.push(user);
      grouped.set(user.clerkId, group);
    }

    let deletedCount = 0;
    for (const group of grouped.values()) {
      if (group.length > 1) {
        group.sort((a, b) => a._creationTime - b._creationTime);
        for (const dup of group.slice(1)) {
          await ctx.db.delete(dup._id);
          deletedCount++;
        }
      }
    }
    
    return { deletedCount };
  },
});