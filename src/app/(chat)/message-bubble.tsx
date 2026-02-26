"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageTime } from "@/lib/utils";

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
}

export default function MessageBubble({ message, isOwn, onDelete }: MessageBubbleProps) {
  const canDelete = isOwn && !message.isDeleted && onDelete;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 animate-message-in`}>
      <div className={`flex gap-2 max-w-xs lg:max-w-md ${isOwn ? "flex-row-reverse" : ""}`}>
        {!isOwn && (
          <Avatar className="h-8 w-8 hover-scale">
            <AvatarImage src={message.sender?.imageUrl} />
            <AvatarFallback>
              {message.sender?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={canDelete ? "group" : undefined}>
          <div
            className={`px-4 py-2 rounded-lg shadow-md transition-smooth transform hover:shadow-lg ${
              isOwn
                ? "bg-gradient-to-br from-[#D9FDD3] to-[#C8F5BE] text-gray-900 rounded-br-none"
                : "bg-white text-gray-900 rounded-bl-none"
            }`}
            style={{
              borderRadius: isOwn ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              boxShadow: isOwn 
                ? '0 1px 2px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)' 
                : '0 1px 2px rgba(0, 0, 0, 0.08)'
            }}
          >
            {message.isDeleted ? (
              <p className="italic text-sm opacity-70">This message was deleted</p>
            ) : (
              <p className="whitespace-pre-wrap font-medium">{message.content}</p>
            )}
          </div>
          <p className={`text-xs mt-1 px-1 ${isOwn ? 'text-gray-600' : 'text-gray-500'}`}>
            {formatMessageTime(new Date(message.createdAt))}
          </p>
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete?.(message._id)}
              className="text-xs text-gray-400 hover:text-red-500 px-1 opacity-0 group-hover:opacity-100 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
