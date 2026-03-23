"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (!user?.id) return;

    // Sync latest profile on every load
    upsertUser({
      clerkId: user.id,
      name: user.fullName ?? user.emailAddresses[0].emailAddress,
      email: user.emailAddresses[0].emailAddress,
      imageUrl: user.imageUrl,
    });

    const setOnline = () =>
      setOnlineStatus({ clerkId: user.id, isOnline: true });
    const setOffline = () =>
      setOnlineStatus({ clerkId: user.id, isOnline: false });

    // Set online immediately
    setOnline();

    // Heartbeat every 8s to keep lastSeen fresh
    const heartbeat = setInterval(setOnline, 8000);

    // Set offline when tab is hidden or closed
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") setOffline();
      else setOnline();
    };

    // Set offline when browser/tab closes
    const handleBeforeUnload = () => setOffline();

    // Set offline when user navigates away
    const handleBlur = () => {
      // Small delay to avoid false positives when switching within the app
      setTimeout(() => {
        if (document.visibilityState === "hidden") setOffline();
      }, 2000);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", setOnline);

    return () => {
      setOffline();
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", setOnline);
    };
  }, [user?.id]);

  return <>{children}</>;
}