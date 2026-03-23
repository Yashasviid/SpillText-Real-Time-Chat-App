"use client";
import bgImage from "@/assets/background.png";
import logoImage from "@/assets/logo.png";
import instantDeliveryImg from "@/assets/instantdelivery.jpg";
import groupConvImg from "@/assets/groupconversations.jpg";
import secureImg from "@/assets/backgroundcomic.jpg";
import presenceImg from "@/assets/backgrounddd.png";
import messageControlImg from "@/assets/bg2.png";
import worksEverywhereImg from "@/assets/backgrou.png";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const MOCK_MESSAGES = [
  { text: "Hey, are you available right now?", sent: false, time: "2:41 PM" },
  { text: "Sure! Give me 15 minutes.", sent: true, time: "2:42 PM" },
  { text: "I am waiting...", sent: false, time: "2:42 PM" },
  { text: "i'll be right there!!", sent: true, time: "2:43 PM" },
];

const FEATURES = [
  {
    title: "Fast and smooth chat",
    desc: "Send and receive messages instantly without interruptions.",
    img: instantDeliveryImg,
  },
  {
    title: "Chat with anyone",
    desc: "Create conversations with friends, teammates, or groups.",
    img: groupConvImg,
  },
  {
    title: "Safe and private",
    desc: "Your conversations stay secure and protected.",
    img: secureImg,
  },
  {
    title: "Always in sync",
    desc: "See who’s active and continue conversations anytime.",
    img: presenceImg,
  },
  {
    title: "Full control",
    desc: "Edit or remove messages whenever you need.",
    img: messageControlImg,
  },
  {
    title: "Works on any device",
    desc: "Use it on desktop, tablet, or mobile without issues.",
    img: worksEverywhereImg,
  },
];
export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [visibleMsg, setVisibleMsg] = useState(0);

  useEffect(() => {
    if (isLoaded && user) router.push("/sync");
  }, [isLoaded, user, router]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleMsg((v) => (v < MOCK_MESSAGES.length - 1 ? v + 1 : v));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Show spinner while Clerk loads
  if (!isLoaded) return (
    <div style={{ minHeight: "100vh", background: "#070c18", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: "2px solid #3b82f6", borderTopColor: "transparent",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Already logged in — redirect happening
  if (isLoaded && user) return null;

  return (
    <div style={{
      minHeight: "100vh", background: "#070c18", color: "#e8edf8",
      fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
      overflowX: "hidden", position: "relative",
    }}>

      {/* Global background image */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover", backgroundPosition: "center",
        backgroundRepeat: "no-repeat", opacity: 0.10,
      }} />

      {/* Animated orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
        <div style={{
          position: "absolute", width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)",
          top: -200, left: -200,
          transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
          transition: "transform 0.4s ease",
        }} />
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)",
          bottom: -150, right: -150,
          transform: `translate(${-mousePos.x * 0.015}px, ${mousePos.y * 0.015}px)`,
          transition: "transform 0.4s ease",
        }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center",
        background: "rgba(7,12,24,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={logoImage.src} alt="SpillText"
              style={{ width: 32, height: 32, borderRadius: 8, mixBlendMode: "screen" }} />
            <span style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.5px", color: "#e8edf8" }}>
              Spill<span style={{ color: "#3b82f6" }}>Text</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/sign-in" style={{
              padding: "8px 16px", color: "rgba(232,237,248,0.75)",
              fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(232,237,248,0.75)"; }}
            >Sign in</Link>
            <Link href="/sign-up" style={{
              padding: "8px 20px", background: "#3b82f6", color: "#fff",
              fontSize: "0.875rem", fontWeight: 700, textDecoration: "none", borderRadius: 10,
              boxShadow: "0 4px 16px rgba(59,130,246,0.4)", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.transform = "translateY(0)"; }}
            >Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: "relative", zIndex: 2, minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "100px 24px 80px",
      }}>
        <div style={{
          maxWidth: 1100, width: "100%", margin: "0 auto",
          display: "flex", alignItems: "center", gap: 64, flexWrap: "wrap",
        }}>
          {/* Left copy */}
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 14px",
              background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: 100, fontSize: "0.78rem", color: "#60a5fa", marginBottom: 24,
              animation: "fadeUp 0.5s ease both",
            }}>
              <span style={{ width: 6, height: 6, background: "#3b82f6", borderRadius: "50%", display: "inline-block" }} />
              Real-time messaging platform
            </div>

            <h1 style={{
              fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 800,
              lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20, color: "#e8edf8",
              animation: "fadeUp 0.5s ease 0.1s both",
            }}>
              Messages that<br />
              <span style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1, #22d3a0)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>arrive instantly.</span>
            </h1>

            <p style={{
              fontSize: "1.05rem", color: "rgba(232,237,248,0.5)", lineHeight: 1.75,
              marginBottom: 36, maxWidth: 460, animation: "fadeUp 0.5s ease 0.2s both",
            }}>
              Because distance shouldn't feel like distance. SpillText keeps your conversations instant, expressive and always alive. 
              Send messages, share moments, feel present - even when you're miles apart.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeUp 0.5s ease 0.3s both" }}>
              <Link href="/sign-up" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 28px", background: "#3b82f6", color: "#fff",
                fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", borderRadius: 12,
                boxShadow: "0 8px 28px rgba(59,130,246,0.35)", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.transform = "translateY(0)"; }}
              >Create free account →</Link>

              <Link href="/sign-in" style={{
                display: "inline-flex", alignItems: "center",
                padding: "13px 24px", color: "rgba(232,237,248,0.7)",
                fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(232,237,248,0.7)"; }}
              >Sign in</Link>
            </div>
          </div>

          {/* Right mock chat */}
          <div style={{ flex: "1 1 320px", minWidth: 0, animation: "fadeUp 0.7s ease 0.3s both" }}>
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 24, overflow: "hidden", maxWidth: 400, marginLeft: "auto",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 700, color: "#fff",
                }}>Y</div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e8edf8" }}>Yashasvi</div>
                  <div style={{ fontSize: "0.72rem", color: "#22d3a0", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 5, height: 5, background: "#22d3a0", borderRadius: "50%", display: "inline-block" }} />
                    Online
                  </div>
                </div>
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 10, minHeight: 220 }}>
                {MOCK_MESSAGES.slice(0, visibleMsg + 1).map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.sent ? "flex-end" : "flex-start", animation: "fadeUp 0.3s ease both" }}>
                    <div style={{
                      maxWidth: "78%", padding: "10px 14px",
                      borderRadius: msg.sent ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.sent ? "linear-gradient(135deg, #1e40af, #3b82f6)" : "rgba(255,255,255,0.06)",
                      color: "#e8edf8", fontSize: "0.82rem", lineHeight: 1.5,
                    }}>
                      {msg.text}
                      <div style={{ fontSize: "0.65rem", opacity: 0.5, marginTop: 4, textAlign: "right" }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  flex: 1, padding: "9px 14px", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10,
                  fontSize: "0.8rem", color: "rgba(232,237,248,0.25)",
                }}>Type a message...</div>
                <div style={{
                  width: 32, height: 32, background: "#3b82f6", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "0.75rem", fontWeight: 700,
                }}>→</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ position: "relative", zIndex: 2, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-1px", color: "#e8edf8", marginBottom: 12 }}>
              Built for{" "}
              <span style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                real conversations
              </span>
            </h2>
            <p style={{ color: "rgba(232,237,248,0.4)", fontSize: "1rem", maxWidth: 480, margin: "0 auto" }}>
              Everything you need to communicate clearly and quickly.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                position: "relative", borderRadius: 18, overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.06)", minHeight: 180,
                transition: "transform 0.3s, border-color 0.3s", cursor: "default",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(59,130,246,0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                {/* ✅ Each card gets its OWN unique image */}
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${f.img.src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.25,
                  transition: "opacity 0.3s",
                }} />
                {/* Dark overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(135deg, rgba(7,12,24,0.82), rgba(13,21,38,0.70))",
                }} />
                {/* Content */}
                <div style={{ position: "relative", zIndex: 1, padding: "28px 24px" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(59,130,246,0.15)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    marginBottom: 14,
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #6366f1)" }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8edf8", marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: "0.83rem", color: "rgba(232,237,248,0.55)", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 2, padding: "60px 24px 100px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-1px", color: "#e8edf8", marginBottom: 14 }}>
            Ready to get started?
          </h2>
          <p style={{ color: "rgba(232,237,248,0.4)", marginBottom: 32, fontSize: "1rem" }}>Free to use. No credit card required.</p>
          <Link href="/sign-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "15px 36px", background: "#3b82f6", color: "#fff",
            fontWeight: 700, fontSize: "1rem", textDecoration: "none", borderRadius: 14,
            boxShadow: "0 8px 32px rgba(59,130,246,0.35)", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Create your account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 2, padding: "20px 24px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8, maxWidth: 1100, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={logoImage.src} alt="SpillText" style={{ width: 24, height: 24, borderRadius: 6, mixBlendMode: "screen" }} />
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#e8edf8" }}>
            Spill<span style={{ color: "#3b82f6" }}>Text</span>
          </span>
        </div>
        <span style={{ fontSize: "0.78rem", color: "rgba(232,237,248,0.25)" }}>© {new Date().getFullYear()} SpillText. All rights reserved.</span>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          nav { padding: 0 16px !important; }
        }
      `}</style>
    </div>
  );
}