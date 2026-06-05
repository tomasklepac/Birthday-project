import { useState, useEffect, useRef } from 'react';
import MajdaSprite from '../components/MajdaSprite.jsx';
import PixelButton from '../components/PixelButton.jsx';

const PS2 = "'Press Start 2P', monospace";
const COLORS = ['#f2c14e', '#e0524a', '#5fa85a', '#7ba6b8', '#fdf6e8', '#c4850f'];
const W = 480, H = 854, COUNT = 52;

function ConfettiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const particles = Array.from({ length: COUNT }, () => ({
      baseX:      Math.random() * W,
      y:          Math.random() * H,
      w:          4 + Math.random() * 3,
      h:          5 + Math.random() * 4,
      color:      COLORS[Math.floor(Math.random() * COLORS.length)],
      speed:      0.7 + Math.random() * 1.6,
      angle:      Math.random() * Math.PI * 2,
      rotSpeed:   (Math.random() - 0.5) * 0.09,
      swingAmp:   14 + Math.random() * 34,
      swingFreq:  0.35 + Math.random() * 0.55,
      swingPhase: Math.random() * Math.PI * 2,
      t:          Math.random() * 100,
    }));

    let rafId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.t     += 0.022;
        p.y     += p.speed;
        p.angle += p.rotSpeed;
        if (p.y > H + 10) { p.y = -10; p.baseX = Math.random() * W; }
        const x = p.baseX + Math.sin(p.t * p.swingFreq + p.swingPhase) * p.swingAmp;
        ctx.save();
        ctx.translate(x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

export default function FinaleScreen({ onRestart }) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#14110f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '20px',
      gap: '14px',
      position: 'relative',
      overflowY: 'auto',
    }}>
      <ConfettiCanvas />

      {/* *** GRATULACE *** */}
      <div style={{ fontFamily: PS2, color: '#888899', fontSize: '7px', opacity: blink ? 1 : 0.2, zIndex: 1 }}>
        *** GRATULACE ***
      </div>

      {/* Hlavní titulek */}
      <div style={{
        fontFamily: PS2,
        color: '#f2c14e',
        fontSize: 'clamp(13px, 4vw, 20px)',
        textAlign: 'center',
        textShadow: '3px 3px 0 rgba(0,0,0,0.8)',
        lineHeight: 1.6,
        zIndex: 1,
      }}>
        VŠECHNO NEJ,<br />MAJDO!
      </div>

      {/* Podtitulek */}
      <div style={{ fontFamily: PS2, color: '#e8e6d0', fontSize: '10px', zIndex: 1 }}>
        DNES TI JE 23
      </div>

      {/* Postavička Majdy se září za ní */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute',
          width: '60px', height: '60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,235,150,0.55) 0%, rgba(255,235,150,0) 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <MajdaSprite pose="cheer" size={60} />
        </div>
      </div>

      {/* Pivní emoji řada */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', maxWidth: '280px', zIndex: 1 }}>
        {Array.from({ length: 23 }, (_, i) => (
          <span key={i} style={{ fontSize: '16px' }}>🍺</span>
        ))}
      </div>

      {/* Narozeninové přání */}
      <div style={{
        background: 'rgba(202,168,106,0.10)',
        border: '3px solid #caa86a',
        padding: '14px',
        maxWidth: '310px', width: '100%',
        color: '#f0e6cf',
        fontSize: '22px', lineHeight: 1.4,
        textAlign: 'center',
        zIndex: 1, boxSizing: 'border-box',
      }}>
        Všechno nejlepší k narozeninám! Hodně zdraví, štěstí, ať se daří ve škole a hlavně ať je celý rok plný dobrých chvil a dobrého piva.
      </div>

      {/* Pozvání */}
      <div style={{
        background: 'rgba(242,193,78,0.16)',
        border: '3px solid #f2c14e',
        padding: '14px',
        maxWidth: '310px', width: '100%',
        color: '#fff6e0',
        fontSize: '22px', lineHeight: 1.4,
        textAlign: 'center',
        zIndex: 1, boxSizing: 'border-box',
      }}>
        A těch 23 piv neuklízíme do šuplíku, oslavíme je spolu! Zvu tě na pivo, vyber si klidně kam chceš. Nebo můžeme vzít rovnou tuhle trasu, krok za krokem. 🍺
      </div>

      {/* Podpis */}
      <div style={{ color: '#888899', fontSize: '22px', zIndex: 1 }}>
        tvůj Tomáš
      </div>

      {/* Tlačítko */}
      <div style={{ zIndex: 1, paddingBottom: '8px' }}>
        <PixelButton onClick={onRestart} color="#c4850f" textColor="#fff">
          JESTE JEDNO KOLO
        </PixelButton>
      </div>
    </div>
  );
}
