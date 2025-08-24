
import { NextRequest } from "next/server";
import { AssemblyAI } from "assemblyai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json();

    if (!youtubeUrl) {
      return new Response(JSON.stringify({ error: "No YouTube URL provided" }), { status: 400 });
    }

    const AAI_KEY = process.env.ASSEMBLYAI_API_KEY;
    if (!AAI_KEY) {
      return new Response(JSON.stringify({ error: "Missing AssemblyAI API key" }), { status: 500 });
    }

    console.log('🎬 Starting transcription for:', youtubeUrl);

    // Extract video ID for logging
    const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (videoId) {
      console.log('�� Extracted video ID:', videoId);
    }

    try {
      // Use AssemblyAI's transcribe method directly with YouTube URL
      console.log('🎯 Using AssemblyAI transcribe method...');
      
      const client = new AssemblyAI({
        apiKey: AAI_KEY,
      });

      const params = {
        audio_url: youtubeUrl,
        speech_model: "universal" as const,
        language_code: "en",
        punctuate: true,
        format_text: true,
        speaker_labels: true,
        auto_highlights: true,
        sentiment_analysis: true,
        auto_chapters: true,
        entity_detection: true,
      };

      console.log('📤 Sending to AssemblyAI for transcription...');
      const transcript = await client.transcripts.create(params);

      console.log('🎉 Transcription completed!');
      console.log('📊 Transcript length:', transcript.text?.length || 0, 'characters');

      // Get video info for better display
      let videoTitle = 'Unknown Title';
      let videoDuration = 0;

      // Try to get basic video info from YouTube page
      try {
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        const html = await response.text();
        
        // Extract title from HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
        if (titleMatch) {
          videoTitle = titleMatch[1].replace(' - YouTube', '').trim();
        }

        // Extract duration if available
        const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
        if (durationMatch) {
          videoDuration = parseInt(durationMatch[1]) || 0;
        }

        console.log('📊 Got video info:', videoTitle, 'Duration:', videoDuration, 'seconds');
      } catch (infoError) {
        console.log('⚠️ Could not get video info, using defaults');
      }

      return new Response(JSON.stringify({
        id: transcript.id || 'direct_transcript',
        videoTitle: videoTitle,
        duration: videoDuration,
        method: 'assemblyai_direct',
        transcript: transcript.text,
        confidence: transcript.confidence,
        audio_duration: transcript.audio_duration,
        words: transcript.words,
        highlights: [],
        sentiment: [],
        chapters: [],
        entities: [],
        speaker_labels: [],
        language_code: 'en'
      }), { status: 200 });

    } catch (transcriptionError: any) {
      console.error('❌ Transcription failed:', transcriptionError);
      throw new Error(`Transcription failed: ${transcriptionError.message}`);
    }

  } catch (err: any) {
    console.error('❌ Error in start route:', err);
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), { status: 500 });
  }
}