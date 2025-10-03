// import { SessionProvider } from "next-auth/react"
import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import SessionProviders from "./SessionProviders"
import NotificationPollingClient from "@/components/notification-polling-client"


// Cairo font for Arabic UI
const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "مخيمر - منصة الحكايات",
  description: "منصة للقصص والمقالات والشعر والتأملات",
    generator: ''
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans bg-vintage-paper min-h-screen`}>
        <SessionProviders>
          <NotificationPollingClient />
          {children}
        </SessionProviders>
      </body>
    </html>
  )
}
