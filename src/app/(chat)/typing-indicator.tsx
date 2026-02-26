"use client";

interface TypingIndicatorProps {
  names: string;
}

export default function TypingIndicator({ names }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-md w-fit max-w-xs animate-scale-up">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 bg-[#25D366] rounded-full animate-bounce" style={{ animationDuration: '1.2s' }} />
        <div
          className="w-2.5 h-2.5 bg-[#25D366] rounded-full animate-bounce"
          style={{ animationDelay: "0.2s", animationDuration: '1.2s' }}
        />
        <div
          className="w-2.5 h-2.5 bg-[#25D366] rounded-full animate-bounce"
          style={{ animationDelay: "0.4s", animationDuration: '1.2s' }}
        />
      </div>
      <p className="text-sm text-gray-700 font-medium ml-1 animate-pulse">{names} is typing...</p>
    </div>
  );
}
