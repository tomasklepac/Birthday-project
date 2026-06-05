import { useState } from 'react';

export default function PixelButton({ children, onClick, color = '#f2c14e', textColor = '#11121f', style = {} }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick?.(); }}
      onPointerLeave={() => setPressed(false)}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '10px',
        background: color,
        color: textColor,
        border: '3px solid rgba(0,0,0,0.5)',
        padding: '10px 16px',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: pressed ? 'none' : `3px 3px 0 rgba(0,0,0,0.6)`,
        transform: pressed ? 'translate(3px, 3px)' : 'none',
        imageRendering: 'pixelated',
        transition: 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
