"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

interface UserSearchProps {
  currentUserId: Id<"users">;
  onSelect: (conversationId: string) => void;
}

export default function UserSearch({
  currentUserId,
  onSelect,
}: UserSearchProps) {
  const [searchText, setSearchText] = useState("");
  const searchResults = useQuery(
    api.users.search,
    searchText
      ? { userId: currentUserId, searchText }
      : "skip"
  );
  const createOrGetConversation = useMutation(api.conversations.getOrCreate);

  const handleSelectUser = async (userId: Id<"users">) => {
    const conv = await createOrGetConversation({
      userId: currentUserId,
      otherUserId: userId,
    });
    if (conv) {
      onSelect(conv._id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-page-slide-in">
      <div className="p-4 border-b border-gray-200">
        <Input
          placeholder="Search users..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full focus:border-[#25D366] focus:ring-[#25D366] transition-smooth"
          autoFocus
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {!searchText && (
          <div className="p-4 text-center text-gray-500 animate-fade-in">
            Start typing to search for users
          </div>
        )}

        {searchResults && !Array.isArray(searchResults) && null}
        {Array.isArray(searchResults) && searchResults.length === 0 && searchText && (
          <div className="p-4 text-center text-gray-500 animate-fade-in">
            No users found
          </div>
        )}

        {Array.isArray(searchResults) &&
          searchResults.map((user) => (
            <button
              key={user._id}
              onClick={() => handleSelectUser(user._id)}
              className="w-full p-4 hover:bg-gray-100 border-b border-gray-100 text-left transition-smooth hover-scale animate-fade-in flex items-center gap-3"
            >
              <Avatar className="h-10 w-10 hover-scale">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback className="bg-[#128C7E] text-white">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              {user.isOnline && (
                <div className="w-2 h-2 bg-[#25D366] rounded-full" />
              )}
            </button>
          ))}
      </div>
    </div>
  );
}
