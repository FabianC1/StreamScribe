import { NextRequest } from "next/server";
import { AssemblyAI } from "assemblyai";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const AAI_KEY = process.env.ASSEMBLYAI_API_KEY;
    if (!AAI_KEY) {
      return new Response(JSON.stringify({ error: "Missing AssemblyAI API key" }), { status: 500 });
    }

    const { id } = params;
    console.log('🔍 Checking status for transcript ID:', id);
    
    const client = new AssemblyAI({
      apiKey: AAI_KEY,
    });

    const transcript = await client.transcripts.get(id);
    
    console.log('📊 Transcript status:', transcript.status);
    
    // Return the full data - client can check status and extract what it needs
    return new Response(JSON.stringify(transcript), { status: 200 });
    
  } catch (err: any) {
    console.error('❌ Error in status route:', err);
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), { status: 500 });
  }
}
