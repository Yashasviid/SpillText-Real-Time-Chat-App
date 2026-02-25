"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0d1424] flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#22d3a0] opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="text-center">
          <h1
            className="text-4xl font-bold text-white"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Spill
            <span className="text-[#22d3a0]">Text</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Your Chat shipper in the modern web
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              card: "bg-[#111827] border border-white/5 shadow-2xl rounded-2xl",
              headerTitle: "text-white font-semibold",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton:
                "bg-white/5 border border-white/10 text-white hover:bg-white/10 transition",
              dividerLine: "bg-white/10",
              dividerText: "text-slate-500",
              formFieldLabel: "text-slate-300 text-sm",
              formFieldInput:
                "bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:border-[#22d3a0] focus:ring-[#22d3a0]/20 rounded-lg",
              formButtonPrimary:
                "bg-[#22d3a0] hover:bg-[#16b88a] text-black font-semibold rounded-lg transition",
              footerActionText: "text-slate-400",
              footerActionLink: "text-[#22d3a0] hover:text-[#16b88a]",
              identityPreviewEditButton: "text-[#22d3a0]",
            },
          }}
        />
      </div>
    </div>
  );
}
