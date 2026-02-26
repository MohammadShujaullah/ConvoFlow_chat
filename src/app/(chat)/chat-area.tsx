"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Loader } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MessageBubble from "./message-bubble";
import TypingIndicator from "./typing-indicator";
import { formatMessageTime } from "@/lib/utils";

interface ChatAreaProps {
  conversationId: Id<"conversations">;
  currentUserId: string;
  onBack: () => void;
}

export default function ChatArea({
  conversationId,
  currentUserId,
  onBack,
}: ChatAreaProps) {
  const [messageText, setMessageText] = useState("");
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [showNewMessageToast, setShowNewMessageToast] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.messages.getByConversation, {
    conversationId,
  } as any);
  const conversation = useQuery(api.conversations.get, {
    conversationId,
  } as any);
  const typing = useQuery(api.typing.getTyping, {
    conversationId,
  } as any);

  const sendMessage = useMutation(api.messages.send);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const setTyping = useMutation(api.typing.setTyping);
  const markAsRead = useMutation(api.unread.markAsRead);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, isScrolledToBottom]);

  useEffect(() => {
    if (!messages || messages.length === 0) {
      setLastMessageId(null);
      setShowNewMessageToast(false);
      return;
    }

    const newestId = messages[messages.length - 1]?._id as string | undefined;
    if (!newestId || newestId === lastMessageId) {
      return;
    }

    setLastMessageId(newestId);
    if (isScrolledToBottom) {
      setShowNewMessageToast(false);
    } else {
      setShowNewMessageToast(true);
    }
  }, [messages, isScrolledToBottom, lastMessageId]);

  useEffect(() => {
    markAsRead({ conversationId, userId: currentUserId as Id<"users"> });
  }, [conversationId, markAsRead, currentUserId]);

  const handleListScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsScrolledToBottom(atBottom);
    if (atBottom) {
      setShowNewMessageToast(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    await sendMessage({
      conversationId,
      senderId: currentUserId as Id<"users">,
      content: messageText.trim(),
    });
    setMessageText("");
  };

  const handleTyping = () => {
    setTyping({ conversationId, userId: currentUserId as Id<"users"> });
  };

  const handleDeleteMessage = async (messageId: Id<"messages">) => {
    await deleteMessage({ messageId });
  };

  const otherUserId = conversation?.participantIds.find(
    (id: string) => id !== currentUserId
  );

  const typingUsers = typing
    ?.filter((t: any) => t.user && t.userId !== currentUserId)
    .map((t: any) => t.user?.name)
    .join(", ");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#128C7E] to-[#0F7A6D] flex items-center gap-3 shadow-lg animate-fade-in">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-[#0F7A6D] rounded-lg transition-smooth hover-scale"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        {messages && messages[0] && (
          <Avatar className="h-10 w-10 border-2 border-white hover-scale">
            <AvatarImage src={messages[0].sender?.imageUrl} />
            <AvatarFallback className="bg-white text-[#128C7E]">
              {messages[0].sender?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1">
          <h2 className="font-semibold text-white">
            {conversation?.participantIds.length === 2
              ? messages?.[0]?.sender?.name || "User"
              : "Conversation"}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleListScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        style={{
          backgroundColor: '#ECE5DD',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.05) 2px,
              rgba(255, 255, 255, 0.05) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.05) 2px,
              rgba(255, 255, 255, 0.05) 4px
            ),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='100' height='100' fill='%23ECE5DD' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
          ,
          backgroundSize: 'auto, auto, 100px 100px',
          backgroundAttachment: 'fixed'
        }}
      >
        {!messages || messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-600">
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm mt-2">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg: any) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
              onDelete={handleDeleteMessage}
            />
          ))
        )}

        {typingUsers && (
          <TypingIndicator names={typingUsers} />
        )}

        <div ref={messagesEndRef} />

        {showNewMessageToast && (
          <div className="sticky bottom-3 w-full flex justify-center animate-scale-up">
            <button
              type="button"
              onClick={() => {
                scrollToBottom();
                setShowNewMessageToast(false);
              }}
              className="text-sm px-4 py-2 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20BD5A] transition-smooth hover-scale button-glow"
            >
              <span>↓ New messages</span>
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-300 shadow-2xl animate-fade-in"
      >
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTyping();
            }}
            className="flex-1 bg-white border border-gray-300 focus:border-[#25D366] focus:ring-2 focus:ring-green-200 rounded-full px-4 transition-smooth"
          />
          <Button
            type="submit"
            disabled={!messageText.trim()}
            className="bg-gradient-to-r from-[#25D366] to-[#1ea754] hover:from-[#20BD5A] hover:to-[#1a9248] text-white shadow-lg rounded-full h-10 w-10 p-0 flex items-center justify-center transition-smooth hover-scale button-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </Button>
        </div>
      </form>
    </div>
  );
}
