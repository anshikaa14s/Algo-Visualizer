export function ShinyText({ text, disabled = false, speed = 3, className = '' }) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-text-muted via-white to-text-muted bg-[length:200%_auto] ${
        !disabled ? 'animate-shine' : ''
      } ${className}`}
      style={{
        animationDuration,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
        backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.15) 70%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text'
      }}
    >
      {text}
    </span>
  );
}
