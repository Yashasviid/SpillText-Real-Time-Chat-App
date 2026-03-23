import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
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
          background: "radial-gradient(circle, rgba(59,130,246,0.14), transparent 70%)",
          top: -200, left: -200, animation: "orbFloat 10s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)",
          bottom: -150, right: -150, animation: "orbFloat2 12s ease-in-out infinite",
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
          background: "linear-gradient(145deg, rgba(59,130,246,0.07), rgba(99,102,241,0.05))",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#e8edf8", marginBottom: 32, display: "block" }}>
            Spill<span style={{ color: "#3b82f6" }}>Text</span>
          </span>
          <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#e8edf8", lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 14 }}>
            Welcome back.
          </h2>
          <p style={{ color: "rgba(232,237,248,0.4)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 40 }}>
           Log in to pick up where you left off and keep the conversation going.
          </p>
          {[
            { icon: "*", text: "Instant messaging, no delays" },
            { icon: "*", text: "Chat with multiple people at once" },
            { icon: "*", text: "See who’s active in real time" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 34, height: 34, background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.15)", borderRadius: 9,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.95rem", flexShrink: 0,
              }}>{item.icon}</div>
              <span style={{ fontSize: "0.875rem", color: "rgba(232,237,248,0.65)", fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Clerk */}
        <div style={{ flex: 1, padding: "48px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SignIn appearance={{
            layout: {
              showOptionalFields: false,
              socialButtonsVariant: "blockButton",
            },
            variables: {
              colorBackground: "transparent",
              colorInputBackground: "rgba(255,255,255,0.05)",
              colorInputText: "#e8edf8",
              colorText: "#e8edf8",
              colorTextSecondary: "rgba(232,237,248,0.45)",
              colorPrimary: "#3b82f6",
              colorDanger: "#f87171",
              borderRadius: "12px",
              fontFamily: "var(--font-jakarta), sans-serif",
            },
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-none",
              card: "bg-transparent shadow-none p-0 w-full",
              main: "bg-transparent",
              navbar: "hidden",
              footer: "hidden",
              headerTitle: "text-[#e8edf8] font-extrabold text-2xl tracking-tight",
              headerSubtitle: "text-[rgba(232,237,248,0.4)] text-sm",
              socialButtonsBlockButton: "border border-white/10 rounded-xl transition hover:bg-white/10",
              socialButtonsBlockButtonText: "text-[#e8edf8] font-medium",
              dividerLine: "bg-white/8",
              dividerText: "text-[rgba(232,237,248,0.3)] text-xs",
              formFieldLabel: "text-[rgba(232,237,248,0.65)] text-sm font-medium",
              formFieldInput: "rounded-xl border border-white/10 text-sm transition focus:border-blue-500/50",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-sm transition",
              identityPreviewText: "text-[rgba(232,237,248,0.7)]",
              identityPreviewEditButton: "text-blue-400",
              formFieldErrorText: "text-red-400 text-xs",
              alertText: "text-[rgba(232,237,248,0.8)]",
              otpCodeFieldInput: "rounded-xl border border-white/10 text-xl font-bold text-center",
              formResendCodeLink: "text-blue-400 font-medium",
              internal: "bg-transparent",
            },
          }} />
        </div>
      </div>

      <style>{`
        @keyframes orbFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,25px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,-20px)} }
        @media (max-width: 680px) { .auth-left-panel { display: none !important; } }
      `}</style>
    </div>
  );
}