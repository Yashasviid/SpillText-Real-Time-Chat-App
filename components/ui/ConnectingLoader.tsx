"use client";

import { useEffect, useState } from "react";

const captions = [
  "Connecting secure channels",
  "Warming up the servers",
  "Syncing conversations",
  "Brewing some SpillText magic",
  "Almost there",
];

export function ConnectingLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setIndex((prev) => (prev + 1) % captions.length);
    }, 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] text-white">
      {/* Logo */}
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "Syne, sans-serif" }}
      >
        Spill<span className="text-[#22d3a0]">Text</span>
      </h1>

      {/* Spinner */}
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-[#22d3a0]/30"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-[#22d3a0] animate-spin"></div>
      </div>

      {/* Caption */}
      <p className="text-sm text-slate-400 flex items-center gap-1">
        {captions[index]}
        <span className="dot-anim">...</span>
      </p>

      {/* SEO hidden text */}
      <p className="sr-only">
        SpillText is a fast, secure, real-time chat application.
      </p>
    </div>
  );
}