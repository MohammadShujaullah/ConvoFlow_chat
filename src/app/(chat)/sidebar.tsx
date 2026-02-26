"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import ConversationList from "./conversation-list";
import UserSearch from "./user-search";
import UserProfile from "./user-profile";

interface SidebarProps {
  currentUserId: string;
  onSelectConversation: (id: string) => void;
}

export default function Sidebar({ currentUserId, onSelectConversation }: SidebarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const me = useQuery(api.users.getById, { userId: currentUserId as any });

  if (!me) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#128C7E] to-[#0F7A6D] flex items-center justify-between shadow-lg animate-fade-in">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="ConvoFlow logo"
            width={36}
            height={36}
            className="rounded-lg shadow-sm"
          />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ConvoFlow</h1>
            <p className="text-white text-xs opacity-90 mt-0.5">Real-time Chat</p>
          </div>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 hover:bg-[#0F7A6D] rounded-full transition-smooth button-glow hover-scale"
        >
          <Search size={20} className="text-white" />
        </button>
      </div>

      {/* Search or Conversations */}
      {showSearch ? (
        <UserSearch
          currentUserId={me._id}
          onSelect={(conversationId: string) => {
            setShowSearch(false);
            onSelectConversation(conversationId);
          }}
        />
      ) : (
        <>
          {/* User Profile */}
          <UserProfile user={me} />

          {/* Conversations List */}
          <ConversationList
            currentUserId={me._id}
            onSelectConversation={onSelectConversation}
          />
        </>
      )}
    </div>
  );
}
