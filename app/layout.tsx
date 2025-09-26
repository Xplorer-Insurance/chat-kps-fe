// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import { ReduxProvider } from "@/components/ReduxProvider"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans", display: "swap" })
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" })

export const metadata: Metadata = {
  title: "Modern Chat App",
  description: "A modern chat application built with Next.js, Radix UI, and Tailwind CSS",
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${openSans.variable}`}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased"
        suppressHydrationWarning   // 👈 clave para ignorar atributos inyectados por extensiones
      >
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
