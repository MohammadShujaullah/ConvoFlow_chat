import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("unreadMessages")
      .filter((q) => q.and(
        q.eq(q.field("conversationId"), args.conversationId),
        q.eq(q.field("userId"), args.userId)
      ))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastReadAt: Date.now(),
      });
    } else {
      await ctx.db.insert("unreadMessages", {
        conversationId: args.conversationId,
        userId: args.userId,
        lastReadAt: Date.now(),
      });
    }
  },
});

export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unreadRecord = await ctx.db
      .query("unreadMessages")
      .filter((q) => q.and(
        q.eq(q.field("conversationId"), args.conversationId),
        q.eq(q.field("userId"), args.userId)
      ))
      .first();

    const lastReadAt = unreadRecord?.lastReadAt || 0;

    const unreadMessages = await ctx.db
      .query("messages")
      .filter((q) => q.and(
        q.eq(q.field("conversationId"), args.conversationId),
        q.gt(q.field("createdAt"), lastReadAt),
        q.neq(q.field("senderId"), args.userId)
      ))
      .collect();

    return unreadMessages.length;
  },
});
