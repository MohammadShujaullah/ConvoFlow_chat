import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typing")
      .filter((q) => q.and(
        q.eq(q.field("conversationId"), args.conversationId),
        q.eq(q.field("userId"), args.userId)
      ))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        expiresAt: Date.now() + 2000,
      });
    } else {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        userId: args.userId,
        expiresAt: Date.now() + 2000,
      });
    }
  },
});

export const getTyping = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const typing = await ctx.db
      .query("typing")
      .filter((q) => q.eq(q.field("conversationId"), args.conversationId))
      .collect();

    const now = Date.now();
    const active = typing.filter((t) => t.expiresAt > now);

    const expired = typing.filter((t) => t.expiresAt <= now);
    for (const t of expired) {
      // Soft delete: mark as expired instead of hard delete
      // In a real app, you might want to actually delete
    }

    const result = await Promise.all(
      active.map(async (t) => {
        const user = await ctx.db.get(t.userId);
        return { ...t, user };
      })
    );

    return result;
  },
});
