import { useEffect } from "react";

// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_SEQUENCE = ["e", "r", "i", "c"];

export const useKonamiCode = (onActivate: () => void) => {
  useEffect(() => {
    let keySequence: string[] = [];

    const handleKeyDown = (event: KeyboardEvent) => {
      // Get the key, handling both arrow keys and regular keys
      let key = event.key;

      // Normalize to lowercase for letter keys
      if (key.length === 1) {
        key = key.toLowerCase();
      }

      keySequence.push(key);

      // Keep only the last N keys we need to check
      if (keySequence.length > KONAMI_SEQUENCE.length) {
        keySequence.shift();
      }

      // Check if the sequence matches
      if (
        keySequence.length === KONAMI_SEQUENCE.length &&
        keySequence.every((key, index) => key === KONAMI_SEQUENCE[index])
      ) {
        onActivate();
        keySequence = []; // Reset after activation
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onActivate]);
};
