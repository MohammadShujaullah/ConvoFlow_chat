import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreate = mutation({
  args: { userId: v.id("users"), otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const participants = [args.userId, args.otherUserId].sort();

    let conversation = await ctx.db
      .query("conversations")
      .filter((q) => {
        const ids = q.field("participantIds");
        return q.and(
          q.eq(ids, participants),
          q.gte(q.field("lastMessageAt"), 0)
        );
      })
      .first();

    if (!conversation) {
      const id = await ctx.db.insert("conversations", {
        participantIds: participants,
        lastMessageAt: Date.now(),
      });
      conversation = await ctx.db.get(id);
    }

    return conversation;
  },
});

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .collect();

    const userConversations = conversations
      .filter((c) => c.participantIds.includes(args.userId))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    const result = await Promise.all(
      userConversations.map(async (conv) => {
        const otherUserId = conv.participantIds.find((id) => id !== args.userId);
        const otherUser = otherUserId
          ? await ctx.db.get(otherUserId as any)
          : null;

        const messages = await ctx.db
          .query("messages")
          .filter((q) => q.eq(q.field("conversationId"), conv._id))
          .collect();
        const lastMessage = messages.length > 0 
          ? messages.sort((a, b) => b.createdAt - a.createdAt)[0]
          : null;

        // Get unread count
        const unreadRecord = await ctx.db
          .query("unreadMessages")
          .filter((q) => q.and(
            q.eq(q.field("conversationId"), conv._id),
            q.eq(q.field("userId"), args.userId)
          ))
          .first();

        const lastReadAt = unreadRecord?.lastReadAt || 0;

        const unreadMessages = await ctx.db
          .query("messages")
          .filter((q) => q.and(
            q.eq(q.field("conversationId"), conv._id),
            q.gt(q.field("createdAt"), lastReadAt),
            q.neq(q.field("senderId"), args.userId)
          ))
          .collect();

        return {
          ...conv,
          otherUser,
          lastMessage,
          unreadCount: unreadMessages.length,
        };
      })
    );

    return result;
  },
});

export const get = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});
