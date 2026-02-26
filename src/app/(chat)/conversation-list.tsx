"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatDistance } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ConversationListProps {
  currentUserId: Id<"users">;
  onSelectConversation: (id: string) => void;
}

export default function ConversationList({
  currentUserId,
  onSelectConversation,
}: ConversationListProps) {
  const conversations = useQuery(api.conversations.list, { userId: currentUserId } as any);
  const markAsRead = useMutation(api.unread.markAsRead);

  const handleSelectConversation = (conversationId: Id<"conversations">) => {
    markAsRead({ conversationId, userId: currentUserId });
    onSelectConversation(conversationId);
  };

  if (!conversations) {
    return <div className="p-4">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p>No conversations yet</p>
          <p className="text-sm mt-2">Search for users to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {conversations.map((conv: any) => (
        <button
          key={conv._id}
          onClick={() => handleSelectConversation(conv._id)}
          className="w-full p-3 hover:bg-gray-100 border-b border-gray-100 text-left transition-smooth group hover:border-[#25D366] hover:border-l-4 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            {conv.otherUser && (
              <>
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.otherUser.imageUrl} />
                    <AvatarFallback className="bg-[#128C7E] text-white">
                      {conv.otherUser.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {conv.otherUser.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conv.otherUser.name}
                    </h3>
                    {conv.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2 bg-[#25D366] hover:bg-[#20BD5A] animate-badge-pulse">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage
                      ? conv.lastMessage.content
                      : "No messages yet"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {conv.lastMessage
                      ? formatDistance(
                          new Date(conv.lastMessage.createdAt),
                          new Date(),
                          { addSuffix: true }
                        )
                      : ""}
                  </p>
                </div>
              </>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
