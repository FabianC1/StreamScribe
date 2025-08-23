import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StreamScribe - YouTube Transcription Service',
  description: 'Professional YouTube video transcription using AI technology',
        icons: {
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/icon.png',
      },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
                <head>
            <link rel="icon" type="image/png" href="/icon.png" />
            <link rel="alternate icon" href="/icon.png" />
            <link rel="apple-touch-icon" href="/icon.png" />
            <link rel="shortcut icon" href="/icon.png" />
          </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
