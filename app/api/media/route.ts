import fs from 'node:fs'
import { Readable } from 'node:stream'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fsExtra from 'fs-extra'
import path from 'path'
import { authOptions } from '@/lib/auth-options'

export const runtime = 'nodejs'

function getContentType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase()
  switch (extension) {
    case '.mp4':
      return 'video/mp4'
    case '.webm':
      return 'video/webm'
    case '.mov':
      return 'video/quicktime'
    case '.mp3':
      return 'audio/mpeg'
    case '.wav':
      return 'audio/wav'
    case '.m4a':
      return 'audio/mp4'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const userId = request.nextUrl.searchParams.get('userId')
  const fileName = request.nextUrl.searchParams.get('file')

  if (!userId || !fileName || userId !== session.user.id) {
    return NextResponse.json({ error: 'Invalid media request' }, { status: 400 })
  }

  const mediaPath = path.join(process.cwd(), 'user-media', userId, fileName)
  if (!await fsExtra.pathExists(mediaPath)) {
    return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
  }

  const stats = await fsExtra.stat(mediaPath)
  const rangeHeader = request.headers.get('range')
  const contentType = getContentType(fileName)

  if (rangeHeader) {
    const matches = /bytes=(\d+)-(\d*)/.exec(rangeHeader)
    if (!matches) {
      return NextResponse.json({ error: 'Invalid range header' }, { status: 416 })
    }

    const start = Number.parseInt(matches[1], 10)
    const end = matches[2] ? Number.parseInt(matches[2], 10) : stats.size - 1
    const safeEnd = Math.min(end, stats.size - 1)

    if (Number.isNaN(start) || Number.isNaN(safeEnd) || start > safeEnd || start >= stats.size) {
      return NextResponse.json({ error: 'Requested range not satisfiable' }, { status: 416 })
    }

    const stream = fs.createReadStream(mediaPath, { start, end: safeEnd })

    return new NextResponse(Readable.toWeb(stream as any) as unknown as ReadableStream, {
      status: 206,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(safeEnd - start + 1),
        'Content-Range': `bytes ${start}-${safeEnd}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=3600'
      }
    })
  }

  const stream = fs.createReadStream(mediaPath)

  return new NextResponse(Readable.toWeb(stream as any) as unknown as ReadableStream, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': stats.size.toString(),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=3600'
    }
  })
}