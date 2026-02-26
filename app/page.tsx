"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const syncUser = async () => {
      await upsertUser({
        clerkId: user.id,
        name: user.fullName ?? user.emailAddresses[0].emailAddress,
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
      });
      router.push("/chat");
    };

    syncUser();
  }, [isLoaded, user, router, upsertUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d1424]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-[#22d3a0] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 font-dm text-sm">Connecting...</p>
      </div>
    </div>
  );
}
