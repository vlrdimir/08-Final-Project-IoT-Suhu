export default async function startAudio(text?: string): Promise<void> {
  try {
    // Jika ada teks, panggil API ElevenLabs TTS
    const response = await fetch("/api/elevenlabs/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("TTS request failed");
    }

    const arrayBuffer = await response.arrayBuffer();
    return await playAudioFromArrayBuffer(arrayBuffer);
  } catch (error) {
    console.error("Error playing TTS audio:", error);
    return Promise.resolve(); // Resolve promise even on error
  }
}

async function playAudioFromArrayBuffer(
  arrayBuffer: ArrayBuffer
): Promise<void> {
  const ctx = new AudioContext();

  return new Promise<void>((resolve, reject) => {
    try {
      ctx.resume().then(async () => {
        try {
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);

          // Resolve promise dan tutup context ketika pemutaran selesai
          source.onended = () => {
            console.log("Audio playback finished, closing AudioContext");
            ctx.close();
            resolve();
          };

          source.start();
        } catch (err) {
          console.error("Error decoding audio data:", err);
          ctx.close();
          reject(err);
        }
      });
    } catch (err) {
      console.error("Error resuming audio context:", err);
      ctx.close();
      reject(err);
    }
  });
}
