import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { PresenceProvider } from "./PresenceProvider";
import "./globals.css";
export const metadata: Metadata = {
  title: "SpillText — Your Chat shipper in the modern web",
  description: "Fast, Secure & Scalable Live Chat .",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexClientProvider>
            <PresenceProvider>
              {children}
            </PresenceProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}