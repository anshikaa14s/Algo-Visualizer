import { useRef, useState } from 'react';

export function SpotlightCard({ children, className = '', spotlightColor = '0, 242, 254', ...props }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent transition-all duration-300 ${className}`}
      {...props}
    >
      {isFocused && (
        <div
          className="pointer-events-none absolute -inset-px transition duration-300 rounded-2xl"
          style={{
            background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(${spotlightColor}, 0.12), transparent 80%)`
          }}
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
