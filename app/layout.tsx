import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import { StoreProvider } from "@/engine/hooks/StoreProvider"
import { storeConfig } from "@/config/stores/clothing.config"
import { SITE_URL, SITE_NAME } from "@/engine/lib/seo"

const description = "Online clothing store in Sri Lanka"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description,
    url: "/",
    locale: storeConfig.locale.replace("-", "_"),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}