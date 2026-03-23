import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#070c18",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-jakarta), sans-serif",
      position: "relative", overflow: "hidden", padding: "24px",
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)",
          top: -200, right: -200, animation: "orbFloat 11s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,160,0.09), transparent 70%)",
          bottom: -150, left: -150, animation: "orbFloat2 9s ease-in-out infinite",
        }} />
      </div>

      <Link href="/" style={{
        position: "fixed", top: 24, left: 24, zIndex: 100,
        color: "rgba(232,237,248,0.45)", textDecoration: "none",
        fontSize: "0.875rem", fontWeight: 600,
      }}>← SpillText</Link>

      <div style={{
        position: "relative", zIndex: 1, display: "flex",
        background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 24, overflow: "hidden", width: "100%", maxWidth: 880,
        boxShadow: "0 40px 100px rgba(0,0,0,0.5)", backdropFilter: "blur(20px)",
      }}>
        {/* Left panel */}
        <div className="auth-left-panel" style={{
          flex: 1,
          background: "linear-gradient(145deg, rgba(99,102,241,0.07), rgba(34,211,160,0.04))",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#e8edf8", marginBottom: 32, display: "block" }}>
            Spill<span style={{ color: "#3b82f6" }}>Text</span>
          </span>
          <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#e8edf8", lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 14 }}>
            Create your account.
          </h2>
          <p style={{ color: "rgba(232,237,248,0.4)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 40 }}>
            Join SpillText and start messaging in seconds. Free forever, no credit card needed.
          </p>
          {[
            "Free to use",
            "Direct & group messages",
            "Real-time delivery",
            "Secure authentication",
          ].map((text) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 20, height: 20, background: "rgba(34,211,160,0.1)",
                border: "1px solid rgba(34,211,160,0.2)", borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#22d3a0", fontSize: "0.65rem", fontWeight: 800, flexShrink: 0,
              }}>✓</div>
              <span style={{ fontSize: "0.875rem", color: "rgba(232,237,248,0.6)", fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Clerk */}
        <div style={{ flex: 1, padding: "48px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SignUp appearance={{
            elements: {
              rootBox: "w-full",
              footer: "hidden",
              card: "bg-transparent shadow-none p-0 w-full",
              headerTitle: "text-[#e8edf8] font-extrabold text-2xl tracking-tight",
              headerSubtitle: "text-[rgba(232,237,248,0.4)] text-sm",
              socialButtonsBlockButton: "bg-white/5 border border-white/10 rounded-xl text-[#e8edf8] hover:bg-white/10 transition",
              socialButtonsBlockButtonText: "text-[#e8edf8] font-medium",
              dividerLine: "bg-white/8",
              dividerText: "text-[rgba(232,237,248,0.3)] text-xs",
              formFieldLabel: "text-[rgba(232,237,248,0.65)] text-sm font-medium",
              formFieldInput: "bg-white/5 border border-white/10 rounded-xl text-[#e8edf8] text-sm placeholder:text-[rgba(232,237,248,0.2)] focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-sm transition",
              footerActionText: "text-[rgba(232,237,248,0.4)] text-sm",
              footerActionLink: "text-blue-400 font-semibold hover:text-blue-300",
              formFieldErrorText: "text-red-400 text-xs",
              alertText: "text-[rgba(232,237,248,0.8)]",
              otpCodeFieldInput: "bg-white/5 border border-white/10 rounded-xl text-[#e8edf8] text-xl font-bold text-center focus:border-blue-500/50",
              formResendCodeLink: "text-blue-400 font-medium",
            },
          }} />
        </div>
      </div>

      <style>{`
        @keyframes orbFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,25px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,-20px)} }
        @media (max-width: 680px) { .auth-left-panel { display: none !important; } }
      `}</style>
    </div>
  );
}