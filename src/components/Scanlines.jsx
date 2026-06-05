export default function Scanlines() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      pointerEvents: 'none',
      zIndex: 9999,
    }} />
  );
}
