"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SyncPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const upsertUser = useMutation(api.users.upsertUser);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/sign-in"); return; }
    if (hasSynced.current) return;
    hasSynced.current = true;

    const sync = async () => {
      await upsertUser({
        clerkId: user.id,
        name: user.fullName ?? user.emailAddresses[0].emailAddress,
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
      });
      router.push("/chat");
    };
    sync();
  }, [isLoaded, user, router, upsertUser]);

  return (
    <div style={{
      minHeight: "100vh", background: "#070c18",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "2px solid #3b82f6", borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
        }} />
        <p style={{ color: "rgba(232,237,248,0.4)", fontSize: "0.875rem",
          fontFamily: "var(--font-jakarta), sans-serif" }}>
          Setting up your account...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}