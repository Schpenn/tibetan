import { useMemo } from 'react';
import './Fireworks.css';

const COLORS = ['#e8c547', '#f6ad55', '#63b3ed', '#68d391', '#fc8181', '#b794f4'];
const PARTICLES_PER_BURST = 14;

interface Burst {
  id: number;
  left: string;
  top: string;
  delay: string;
  color: string;
}

function Particles({ color, delay }: { color: string; delay: string }) {
  return (
    <>
      {Array.from({ length: PARTICLES_PER_BURST }, (_, i) => {
        const angle = (i / PARTICLES_PER_BURST) * 360;
        return (
          <span
            key={i}
            className="firework-particle"
            style={{
              backgroundColor: color,
              animationDelay: delay,
              ['--angle' as string]: `${angle}deg`,
            } as React.CSSProperties}
          />
        );
      })}
    </>
  );
}

export function Fireworks() {
  const bursts = useMemo<Burst[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 45}%`,
        delay: `${i * 0.3}s`,
        color: COLORS[i % COLORS.length],
      })),
    []
  );

  return (
    <div className="fireworks-overlay" aria-hidden="true">
      {bursts.map(b => (
        <div key={b.id} className="firework" style={{ left: b.left, top: b.top }}>
          <Particles color={b.color} delay={b.delay} />
        </div>
      ))}
    </div>
  );
}
