export type StreamApiFormat = 'piped' | 'invidious'

export interface StreamApiSource {
  label: string
  url: string
  format: StreamApiFormat
  isPublicFallback: boolean
}

export interface AudioStreamInfo {
  url: string
  bitrate: number
  mimeType: string
}

const DEFAULT_PUBLIC_STREAM_API_SOURCES: StreamApiSource[] = [
  {
    label: 'piped-public',
    url: 'https://pipedapi.kavin.rocks',
    format: 'piped',
    isPublicFallback: true,
  },
  {
    label: 'invidious-public',
    url: 'https://vid.puffyan.us',
    format: 'invidious',
    isPublicFallback: true,
  },
]

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

function parseUrlList(value?: string): string[] {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map(normalizeBaseUrl)
    .filter(Boolean)
}

function createSources(urls: string[], format: StreamApiFormat, labelPrefix: string, isPublicFallback: boolean): StreamApiSource[] {
  return urls.map((url, index) => ({
    label: `${labelPrefix}-${index + 1}`,
    url,
    format,
    isPublicFallback,
  }))
}

export function buildStreamApiSources(): StreamApiSource[] {
  const pipedUrls = parseUrlList(process.env.PIPED_API_URLS || process.env.PIPED_API_URL)
  const invidiousUrls = parseUrlList(process.env.INVIDIOUS_API_URLS || process.env.INVIDIOUS_API_URL)
  const allowPublicFallback = process.env.ALLOW_PUBLIC_STREAM_FALLBACK === 'true'

  const configuredSources = [
    ...createSources(pipedUrls, 'piped', 'piped', false),
    ...createSources(invidiousUrls, 'invidious', 'invidious', false),
  ]

  if (configuredSources.length === 0) {
    return DEFAULT_PUBLIC_STREAM_API_SOURCES
  }

  if (!allowPublicFallback) {
    return configuredSources
  }

  const configuredUrlSet = new Set(configuredSources.map((source) => source.url))
  const publicFallbackSources = DEFAULT_PUBLIC_STREAM_API_SOURCES.filter((source) => !configuredUrlSet.has(source.url))
  return [...configuredSources, ...publicFallbackSources]
}

export function getStreamApiEndpoint(source: StreamApiSource, videoId: string): string {
  return source.format === 'piped'
    ? `${source.url}/streams/${videoId}`
    : `${source.url}/api/v1/videos/${videoId}`
}

export function normalizeAudioStreams(data: any, format: StreamApiFormat): AudioStreamInfo[] {
  if (format === 'piped') {
    return Array.isArray(data?.audioStreams)
      ? data.audioStreams
          .filter((stream: any) => typeof stream?.url === 'string' && stream.url.length > 0)
          .map((stream: any) => ({
            url: stream.url,
            bitrate: Number(stream.bitrate) || 0,
            mimeType: stream.mimeType || '',
          }))
      : []
  }

  const adaptiveFormats = Array.isArray(data?.adaptiveFormats) ? data.adaptiveFormats : []
  const directAudioStreams = Array.isArray(data?.audioStreams) ? data.audioStreams : []

  const normalizedAdaptiveFormats = adaptiveFormats
    .filter((stream: any) => typeof stream?.url === 'string' && typeof stream?.type === 'string' && stream.type.startsWith('audio/'))
    .map((stream: any) => ({
      url: stream.url,
      bitrate: Number(stream.bitrate) || 0,
      mimeType: stream.type || '',
    }))

  const normalizedDirectAudioStreams = directAudioStreams
    .filter((stream: any) => typeof stream?.url === 'string' && stream.url.length > 0)
    .map((stream: any) => ({
      url: stream.url,
      bitrate: Number(stream.bitrate) || 0,
      mimeType: stream.type || stream.mimeType || '',
    }))

  return [...normalizedAdaptiveFormats, ...normalizedDirectAudioStreams]
}