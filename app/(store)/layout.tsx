import { DM_Sans, DM_Serif_Display } from "next/font/google"
import { StoreProvider } from "@/engine/hooks/StoreProvider"
import { storeConfig } from "@/config/stores/clothing.config"
import StorefrontNav from "@/engine/components/layout/StorefrontNav"
import type { Metadata } from "next"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: storeConfig.name,
  description: "Modern clothing store",
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StoreProvider>
      <div
        className={`${dmSans.variable} ${dmSerif.variable} min-h-screen flex flex-col bg-white`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <StorefrontNav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#E0E0E0] py-10 bg-white">
          <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
            <span
              className="text-sm font-medium text-[#0A0A0A]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {storeConfig.name}
            </span>
            <span className="text-xs text-[#8C8C8C]">
              © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>
        </footer>
      </div>
    </StoreProvider>
  )
}