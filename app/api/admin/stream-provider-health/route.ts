import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import axios from 'axios'
import { authOptions } from '@/lib/auth-options'
import { AudioStreamInfo, buildStreamApiSources, getStreamApiEndpoint, normalizeAudioStreams } from '@/lib/streamProviders'

const ADMIN_EMAIL = 'galaselfabian@gmail.com'

function extractErrorMessage(error: unknown): string {
  if (!error) {
    return 'Unknown error'
  }

  if (typeof error === 'string') {
    return error
  }

  const anyError = error as any
  return anyError.message || String(error)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const videoId = request.nextUrl.searchParams.get('videoId') || 'dQw4w9WgXcQ'
    const sources = buildStreamApiSources()

    if (sources.length === 0) {
      return NextResponse.json({
        ok: false,
        configuredSources: [],
        message: 'No stream providers configured. Set PIPED_API_URLS and/or INVIDIOUS_API_URLS on the server.',
      }, { status: 500 })
    }

    const results = await Promise.all(sources.map(async (source) => {
      const endpoint = getStreamApiEndpoint(source, videoId)

      try {
        const response = await axios.get(endpoint, { timeout: 15000 })
        const audioStreams = normalizeAudioStreams(response.data, source.format) as AudioStreamInfo[]
        const bestStream = audioStreams.sort((a: AudioStreamInfo, b: AudioStreamInfo) => b.bitrate - a.bitrate)[0] || null

        return {
          label: source.label,
          url: source.url,
          format: source.format,
          isPublicFallback: source.isPublicFallback,
          ok: audioStreams.length > 0,
          endpoint,
          audioStreamCount: audioStreams.length,
          bestBitrate: bestStream?.bitrate || 0,
          bestMimeType: bestStream?.mimeType || null,
        }
      } catch (error) {
        return {
          label: source.label,
          url: source.url,
          format: source.format,
          isPublicFallback: source.isPublicFallback,
          ok: false,
          endpoint,
          audioStreamCount: 0,
          error: extractErrorMessage(error),
        }
      }
    }))

    const ok = results.some((result) => result.ok)

    return NextResponse.json({
      ok,
      videoId,
      configuredSources: results,
      message: ok
        ? 'At least one configured stream provider returned audio streams.'
        : 'No configured stream provider returned usable audio streams.',
    }, { status: ok ? 200 : 502 })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}