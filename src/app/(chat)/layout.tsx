"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Sidebar from "./sidebar";
import ChatArea from "./chat-area";

export default function ChatLayout() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [convexUserId, setConvexUserId] = useState<string | null>(null);

  const upsertUser = useMutation(api.users.upsertUser);
  const setOnline = useMutation(api.users.setOnline);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user) {
      // First, upsert the user and get their Convex ID
      (async () => {
        try {
          const userId = await upsertUser({
            clerkId: user.id,
            name: user.firstName || "User",
            email: user.primaryEmailAddress?.emailAddress || "",
            imageUrl: user.imageUrl,
          });
          setConvexUserId(userId);

          // Set them as online
          await setOnline({ userId: userId as any, isOnline: true });
        } catch (error) {
          console.error("Error upserting user:", error);
        }
      })();
    }
  }, [user, upsertUser, setOnline]);

  // Periodic heartbeat to keep user online
  useEffect(() => {
    if (convexUserId) {
      const interval = setInterval(async () => {
        try {
          await setOnline({ userId: convexUserId as any, isOnline: true });
        } catch (error) {
          console.error("Error updating online status:", error);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [convexUserId, setOnline]);

  // Set user offline when they leave or close the page
  useEffect(() => {
    if (convexUserId) {
      const handleBeforeUnload = async () => {
        try {
          await setOnline({ userId: convexUserId as any, isOnline: false });
        } catch (error) {
          console.error("Error setting offline:", error);
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        // Set offline on component unmount (e.g., logout)
        setOnline({ userId: convexUserId as any, isOnline: false });
      };
    }
  }, [convexUserId, setOnline]);

  if (!isLoaded || !user || !convexUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const showSidebar = !selectedConversationId;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${showSidebar ? "flex" : "hidden"} md:flex md:w-80 md:flex-col border-r border-gray-300 shadow-2xl`}
      >
        <Sidebar
          currentUserId={convexUserId}
          onSelectConversation={setSelectedConversationId}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${showSidebar ? "hidden md:flex" : "flex"}`}>
        {selectedConversationId ? (
          <ChatArea
            conversationId={selectedConversationId}
            currentUserId={convexUserId}
            onBack={() => {
              setSelectedConversationId(null);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-[#E5DDD5]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700">Select a conversation</h2>
              <p className="text-gray-600 mt-2">Or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
