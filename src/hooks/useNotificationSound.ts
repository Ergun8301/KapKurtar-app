import { useRef, useCallback } from "react";

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/mixkit-correct-answer-tone-2870.wav");
        audioRef.current.volume = 0.7;
      }
      
      audioRef.current.play()
        .then(() => console.log("🔊 Son joué avec succès"))
        .catch((err) => {
          console.error("🔇 Erreur lecture son:", err);
          console.error("Message:", err.message);
        });
    } catch (e) {
      console.error("❌ Erreur critique audio:", e);
    }
  }, []);

  return { play };
}