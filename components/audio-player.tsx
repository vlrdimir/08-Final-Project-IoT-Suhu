"use client";
import { useEffect, useRef, useState } from "react";
import startAudio from "@/lib/startAudio";

interface AudioPlayerProps {
  text?: string;
}

export default function AudioPlayer({ text }: AudioPlayerProps) {
  // Gunakan ref untuk melacak teks yang terakhir diputar
  const lastPlayedTextRef = useRef<string | undefined>(undefined);
  // State untuk melacak pemutaran audio
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Hanya putar audio jika teks ada, berbeda dari teks sebelumnya, dan tidak sedang dalam proses pemutaran
    if (text && text !== lastPlayedTextRef.current && !isPlaying) {
      // Tandai sedang dalam pemutaran
      setIsPlaying(true);

      // Simpan teks saat ini sebagai teks yang terakhir diputar
      lastPlayedTextRef.current = text;

      // Memanggil startAudio dengan teks
      startAudio(text).finally(() => {
        // Setelah selesai (baik berhasil atau gagal), tandai pemutaran selesai
        setIsPlaying(false);
      });
    }
  }, [text, isPlaying]);

  return null; // Komponen ini tidak merender elemen visual
}
