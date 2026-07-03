import type { Metadata } from "next"
import "./globals.css"
import { StoreProvider } from "@/engine/hooks/StoreProvider"
import { storeConfig } from "@/config/stores/clothing.config"

export const metadata: Metadata = {
  title: storeConfig.name,
  description: "Online clothing store in Sri Lanka",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}