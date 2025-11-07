// src/hooks/useNotificationSound.ts
import { useRef } from "react";

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = () => {
    try {
      if (!audioRef.current) {
        // On lit le son depuis une URL publique (pas besoin de fichier local)
        audioRef.current = new Audio(
          "https://cdn.jsdelivr.net/gh/free-sounds-library/mixkit-correct-answer-tone-2870.wav"
        );
      }
      audioRef.current.play().catch(() => {
        console.warn("🔇 Son bloqué par le navigateur jusqu'à un clic utilisateur");
      });
    } catch (e) {
      console.warn("Erreur de lecture audio:", e);
    }
  };

  return { play };
}
