import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { promisify } from 'util'
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { authOptions } from '@/lib/auth-options'

const execAsync = promisify(exec)
const YTDLP_BINARY = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp')

const ADMIN_EMAIL = 'galaselfabian@gmail.com'

function extractErrorText(error: unknown): string {
  if (!error) {
    return 'Unknown error'
  }

  if (typeof error === 'string') {
    return error
  }

  const anyError = error as any
  const parts = [anyError.message, anyError.stderr, anyError.stdout].filter(Boolean)
  return parts.length > 0 ? parts.join('\n') : String(error)
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

    const jsRuntimes = process.env.YTDLP_JS_RUNTIMES || process.env.runtimes || 'node'
    const cookiesFile = process.env.YTDLP_COOKIES_FILE || ''
    const probeUrl = request.nextUrl.searchParams.get('url') || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

    const binaryExists = await fs.pathExists(YTDLP_BINARY)
    const cookiesExists = cookiesFile ? await fs.pathExists(cookiesFile) : false

    const baseChecks = {
      ytdlpBinaryPath: YTDLP_BINARY,
      ytdlpBinaryExists: binaryExists,
      ytdlpJsRuntimes: jsRuntimes,
      cookiesFileConfigured: Boolean(cookiesFile),
      cookiesFilePath: cookiesFile || null,
      cookiesFileExists: cookiesExists,
      probeUrl,
    }

    if (!binaryExists) {
      return NextResponse.json({
        ok: false,
        checks: baseChecks,
        message: 'yt-dlp binary not found. Run npm install to restore dependencies.'
      }, { status: 500 })
    }

    const cookiesArg = cookiesExists ? ` --cookies "${cookiesFile}"` : ''
    const cmd = `"${YTDLP_BINARY}" --skip-download --print "%(id)s|%(title)s" --no-warnings --retries 1 --socket-timeout 25 --js-runtimes ${jsRuntimes} --extractor-args "youtube:player_client=android,web"${cookiesArg} "${probeUrl}"`

    try {
      const { stdout } = await execAsync(cmd)
      const output = (stdout || '').trim()
      const hasResult = output.length > 0

      return NextResponse.json({
        ok: hasResult,
        checks: baseChecks,
        extraction: {
          success: hasResult,
          output: output || null,
        },
        message: hasResult
          ? 'yt-dlp probe succeeded. YouTube extraction is available.'
          : 'yt-dlp ran but returned no output.'
      })
    } catch (probeError) {
      const errorText = extractErrorText(probeError)
      const blockedByYouTube = /sign in to confirm|not a bot|http error 403|forbidden/i.test(errorText)

      return NextResponse.json({
        ok: false,
        checks: baseChecks,
        extraction: {
          success: false,
          blockedByYouTube,
          error: errorText.slice(0, 4000),
        },
        message: blockedByYouTube
          ? 'YouTube bot protection blocked extraction. Confirm cookies file is valid and fresh.'
          : 'yt-dlp probe failed due to extraction/runtime error.'
      }, { status: blockedByYouTube ? 429 : 502 })
    }
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
