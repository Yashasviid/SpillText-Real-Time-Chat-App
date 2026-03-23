"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PresenceSync() {
  const { user } = useUser();
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  useEffect(() => {
    if (!user?.id) return;

    const setOnline = () => setOnlineStatus({ clerkId: user.id, isOnline: true });
    const setOffline = () => setOnlineStatus({ clerkId: user.id, isOnline: false });

    setOnline();
    const heartbeat = setInterval(setOnline, 8000);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") setOffline();
      else setOnline();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", setOffline);
    window.addEventListener("focus", setOnline);

    return () => {
      setOffline();
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", setOffline);
      window.removeEventListener("focus", setOnline);
    };
  }, [user?.id]);

  return null;
}