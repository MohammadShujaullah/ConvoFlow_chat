import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), args.userId))
      .collect();
    return users.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const search = query({
  args: { userId: v.id("users"), searchText: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), args.userId))
      .collect();

    const text = args.searchText.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(text) ||
        user.email.toLowerCase().includes(text)
    );
  },
});

export const getMe = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    return user;
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!existing) {
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
    }

    await ctx.db.patch(existing._id, {
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
    });

    return existing._id;
  },
});

export const deleteByClerkId = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const setOnline = mutation({
  args: { userId: v.id("users"), isOnline: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isOnline: args.isOnline,
      lastSeen: Date.now(),
    });
  },
});

export const updateLastSeen = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastSeen: Date.now(),
    });
  },
});
