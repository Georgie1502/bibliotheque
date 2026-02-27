import { useEffect, useState } from "react";

interface ConfettiProps {
  trigger: number; // Increment this to trigger confetti
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  emoji: string;
}

const EMOJIS = ["🎉", "🎊", "✨", "⭐", "🌟", "💫", "🎈", "🎁"];

export const Confetti = ({ trigger }: ConfettiProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger > 0) {
      const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.2,
        duration: 2 + Math.random() * 1.5,
        size: 20 + Math.random() * 20,
        rotation: Math.random() * 360,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      }));

      setParticles(newParticles);

      // Clear particles after animation completes
      const maxDuration = Math.max(...newParticles.map((p) => p.duration));
      const timer = setTimeout(
        () => {
          setParticles([]);
        },
        (maxDuration + 0.5) * 1000,
      );

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <>
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotateZ(360deg);
            opacity: 0;
          }
        }
        .confetti-particle {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: fall linear forwards;
        }
      `}</style>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="confetti-particle"
          style={{
            left: `${particle.left}%`,
            fontSize: `${particle.size}px`,
            animation: `fall ${particle.duration}s linear ${particle.delay}s forwards`,
            transform: `rotateZ(${particle.rotation}deg)`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </>
  );
};
