"use client";

import { useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface UserProfileProps {
  user: any;
}

export default function UserProfile({ user }: UserProfileProps) {
  const { signOut } = useClerk();

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback className="bg-[#128C7E] text-white">
            {user.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{user.name}</h3>
          <p className="text-xs text-[#25D366]">Online</p>
        </div>
        <button
          onClick={() => signOut()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Sign out"
        >
          <LogOut size={16} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
