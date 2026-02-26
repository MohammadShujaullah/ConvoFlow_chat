import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#ECE5DD]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 14px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 14px)",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="px-6 py-5 bg-gradient-to-r from-[#128C7E] to-[#0F7A6D] text-white">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="ConvoFlow logo"
              width={34}
              height={34}
              className="rounded-lg shadow-sm"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ConvoFlow</h1>
              <p className="text-sm opacity-90 mt-1">Create your account to start chatting</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <SignUp
            appearance={{
              variables: {
                colorPrimary: "#25D366",
                colorText: "#0f172a",
                colorBackground: "#ffffff",
                colorInputBackground: "#f8fafc",
                colorInputText: "#0f172a",
                borderRadius: "12px",
              },
              elements: {
                card: "shadow-none bg-transparent p-0",
                headerTitle: "text-[#0f172a]",
                headerSubtitle: "text-gray-500",
                formButtonPrimary: "bg-[#25D366] hover:bg-[#20BD5A]",
                footerActionLink: "text-[#128C7E] hover:text-[#0F7A6D]",
                dividerLine: "bg-gray-200",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
