import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Tetapkan durasi respons streaming hingga 90 detik
export const maxDuration = 90;

// Konfigurasi untuk Next.js API Routes
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const elevenlabs = new ElevenLabsClient({
  apiKey: "",
});

export async function POST(req: Request) {
  const { text } = await req.json();

  try {
    // Dapatkan stream audio dari ElevenLabs API
    const audioStream = await elevenlabs.textToSpeech.convert(
      "v70fYBHUOrHA3AKIBjPq", // Voice ID
      {
        text: text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );

    // Buat response stream untuk dikonsumsi client
    return new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.dir(error, { depth: null });
    console.error("Error generating TTS:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate speech" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
