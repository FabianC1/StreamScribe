import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StreamScribe - YouTube Transcription Service',
  description: 'Professional YouTube video transcription using AI technology. Get accurate transcripts, timestamps, and insights from any YouTube video instantly.',
  keywords: 'YouTube transcription, video transcription, AI transcription, speech to text, video subtitles, YouTube captions',
  authors: [{ name: 'StreamScribe Team' }],
  creator: 'StreamScribe',
  publisher: 'StreamScribe',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://streamscribe1.netlify.app',
    siteName: 'StreamScribe',
    title: 'StreamScribe - YouTube Transcription Service',
    description: 'Professional YouTube video transcription using AI technology. Get accurate transcripts, timestamps, and insights from any YouTube video instantly.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StreamScribe - YouTube Transcription Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@streamscribe',
    creator: '@streamscribe',
    title: 'StreamScribe - YouTube Transcription Service',
    description: 'Professional YouTube video transcription using AI technology. Get accurate transcripts, timestamps, and insights from any YouTube video instantly.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: '#2563EB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
