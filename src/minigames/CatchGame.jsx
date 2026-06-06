import { useState, useEffect, useRef, useCallback } from 'react';

const GAME_W = Math.min(Math.floor(window.innerWidth - 20), 390);
const GAME_H = Math.round(240 * GAME_W / 300);
const GLASS_W = Math.round(44 * GAME_W / 300);
const STREAM_W = Math.round(10 * GAME_W / 300);
const _R = GAME_W / 300;

export default function CatchGame({ onComplete }) {
  const [glassX, setGlassX] = useState(10);
  const [streamX, setStreamX] = useState(GAME_W - 35);
  const [streamVel, setStreamVel] = useState(0);
  const [level, setLevel] = useState(0);
  const [drops, setDrops] = useState([]);
  const [done, setDone] = useState(false);
  const [notes, setNotes] = useState([]);
  const rafRef = useRef(null);
  const glassRef = useRef(10);
  const streamRef = useRef(GAME_W - 35);
  const streamVelRef = useRef(0);
  const levelRef = useRef(0);
  const doneRef = useRef(false);
  const dropIdRef = useRef(0);
  const gameAreaRef = useRef(null);

  const handlePointerMove = useCallback((e) => {
    if (doneRef.current) return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left - GLASS_W / 2;
    const clamped = Math.max(0, Math.min(GAME_W - GLASS_W, x));
    glassRef.current = clamped;
    setGlassX(clamped);
  }, []);

  useEffect(() => {
    let t = 0;
    let streamTargetX = 20;

    const tick = () => {
      if (doneRef.current) return;
      t++;

      if (t % 55 === 0) {
        streamTargetX = 15 + Math.random() * (GAME_W - 40);
      }

      const sx = streamRef.current;
      const speed = 0.045 + Math.min(t / 3000, 0.025);
      const newSx = sx + (streamTargetX - sx) * speed;
      streamVelRef.current = newSx - sx;
      streamRef.current = newSx;
      setStreamX(newSx);
      setStreamVel(newSx - sx);

      if (t % 40 === 0) {
        const id = dropIdRef.current++;
        setNotes(n => [...n.slice(-8), {
          id, x: 10 + Math.random() * (GAME_W - 20),
          y: GAME_H - 20, char: ['♪','♫','♩'][Math.floor(Math.random()*3)],
        }]);
      }
      setNotes(n =>
        n.map(nt => ({ ...nt, y: nt.y - 0.8, opacity: (nt.y - GAME_H * 0.4) / (GAME_H * 0.6) }))
         .filter(nt => nt.y > GAME_H * 0.1)
      );

      const glass = glassRef.current;
      const glassCenter = glass + GLASS_W / 2;
      const catching = Math.abs(streamRef.current - glassCenter) < (GLASS_W / 2 + STREAM_W / 2 - 4);

      if (catching) {
        levelRef.current = Math.min(levelRef.current + 0.008, 1);
        setLevel(levelRef.current);
        if (levelRef.current >= 1) {
          doneRef.current = true;
          setDone(true);
          setTimeout(() => onComplete('full'), 600);
          return;
        }
      }

      if (!catching && t % 4 === 0) {
        const id = dropIdRef.current++;
        setDrops(d => [...d.slice(-14), {
          id,
          x: streamRef.current + (Math.random() - 0.5) * 18,
          y: GAME_H - 68,
        }]);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  const glassH = Math.round(54 * _R);
  const beerH = level * (glassH - 10);

  // Proud piva - nakloní se podle rychlosti pohybu
  const streamTop = Math.round(18 * _R);
  const streamBottom = GAME_H - Math.round(62 * _R);
  const streamHeight = streamBottom - streamTop;
  // Naklopení: čím rychleji se proud pohybuje, tím víc se vlní
  // Proud zaostává za pipou — opačný směr než pohyb (fyzika vlajky za sebou)
  const lean = Math.min(Math.max(-streamVel * 6, -20), 20);
  const sx = streamX;
  const sw = STREAM_W;

  // Polygon proudu: nahoře rovný, dole nakloněný
  const streamPts = [
    `${sx - sw/2},${streamTop}`,
    `${sx + sw/2},${streamTop}`,
    `${sx + sw/2 + lean},${streamTop + streamHeight * 0.5}`,
    `${sx + sw/2 + lean * 1.2},${streamBottom}`,
    `${sx - sw/2 + lean * 1.2},${streamBottom}`,
    `${sx - sw/2 + lean},${streamTop + streamHeight * 0.5}`,
  ].join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ color: '#c4850f', fontSize: '20px', textAlign: 'center' }}>
        Posouvej sklenici pod proud piva
      </div>

      <div
        ref={gameAreaRef}
        style={{
          width: `${GAME_W}px`,
          height: `${GAME_H}px`,
          position: 'relative',
          background: '#0a0812',
          border: '3px solid #333344',
          overflow: 'hidden',
          cursor: 'none',
          touchAction: 'none',
        }}
        onPointerMove={handlePointerMove}
        onTouchMove={(e) => { e.preventDefault(); handlePointerMove(e); }}
      >
        {/* Club background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(74,40,120,0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(180,40,40,0.3) 0%, transparent 50%)',
        }} />

        {/* Disco lights */}
        {[20,60,120,180,240,280].map((lx,i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, left: `${Math.round(lx * _R)}px`,
            width: '8px', height: '8px',
            background: ['#e0524a','#4a78c0','#f2c14e','#5fa85a','#aa44cc','#f2c14e'][i],
            opacity: 0.8,
            boxShadow: `0 0 8px 4px ${['rgba(224,82,74,0.3)','rgba(74,120,192,0.3)','rgba(242,193,78,0.3)','rgba(95,168,90,0.3)','rgba(170,68,204,0.3)','rgba(242,193,78,0.3)'][i]}`,
          }} />
        ))}

        {/* Crowd silhouettes */}
        <svg style={{ position: 'absolute', bottom: `${Math.round(60 * _R)}px`, left: 0, width: '100%' }}
          viewBox={`0 0 ${GAME_W} 40`} shapeRendering="crispEdges" preserveAspectRatio="none">
          {[10,30,55,75,100,125,150,170,195,215,240,260,285].map((cx,i) => {
            const scx = Math.round(cx * GAME_W / 300);
            return (
              <g key={i}>
                <circle cx={scx} cy="22" r="6" fill="#111118" />
                <rect x={scx-5} y="28" width="10" height="12" fill="#111118" />
                {i % 3 === 0 ? (
                  <><line x1={scx-5} y1="30" x2={scx-10} y2="20" stroke="#111118" strokeWidth="3" />
                    <line x1={scx+5} y1="30" x2={scx+10} y2="20" stroke="#111118" strokeWidth="3" /></>
                ) : (
                  <><line x1={scx-5} y1="30" x2={scx-9} y2="35" stroke="#111118" strokeWidth="3" />
                    <line x1={scx+5} y1="30" x2={scx+9} y2="35" stroke="#111118" strokeWidth="3" /></>
                )}
              </g>
            );
          })}
        </svg>

        {/* Music notes */}
        {notes.map(n => (
          <div key={n.id} style={{
            position: 'absolute', left: `${n.x}px`, top: `${n.y}px`,
            color: '#f2c14e', fontSize: '10px', opacity: Math.max(0, n.opacity || 0.5),
            pointerEvents: 'none', fontFamily: 'serif',
          }}>{n.char}</div>
        ))}

        {/* Výčepní kohout - pohybující se nahoře */}
        <div style={{
          position: 'absolute', top: 0, left: `${streamX - Math.round(22 * _R)}px`,
          width: `${Math.round(44 * _R)}px`, height: `${Math.round(18 * _R)}px`,
          background: '#3d1f0d', border: '2px solid #6e4327',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
        }}>
          <div style={{ width: '10px', height: '10px', background: '#f2c14e', opacity: 0.9 }} />
        </div>

        {/* Proud piva - SVG polygon, nakloněný, pivní barva */}
        {!done && (
          <svg style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: `${GAME_H}px`,
            pointerEvents: 'none', zIndex: 4, overflow: 'visible',
          }}>
            <defs>
              <linearGradient id="beerStreamGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#b87010" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#f0a828" stopOpacity="1" />
                <stop offset="65%" stopColor="#e89010" stopOpacity="1" />
                <stop offset="100%" stopColor="#b87010" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Hlavní proud */}
            <polygon points={streamPts} fill="url(#beerStreamGrad)" />
            {/* Světlý odlesk uprostřed */}
            <polygon
              points={[
                `${sx - sw/6},${streamTop}`,
                `${sx + sw/6},${streamTop}`,
                `${sx + sw/6 + lean * 1.1},${streamBottom}`,
                `${sx - sw/6 + lean * 1.1},${streamBottom}`,
              ].join(' ')}
              fill="#f8c840" opacity="0.3"
            />
            {/* Tmavé pivní tečky uvnitř proudu */}
            {Array.from({length: 7}).map((_, i) => {
              const ratio = (i + 0.5) / 7;
              const cx = sx + lean * ratio * 1.2 + Math.sin(i * 2.3) * 1.5;
              const cy = streamTop + streamHeight * ratio;
              return (
                <circle key={i} cx={cx} cy={cy} r="1.6" fill="#7a4008" opacity="0.5" />
              );
            })}
          </svg>
        )}

        {/* Kapky promeškaného piva */}
        {drops.map(drop => (
          <div key={drop.id} style={{
            position: 'absolute', left: `${drop.x}px`, top: `${drop.y}px`,
            width: '3px', height: '5px', background: '#c4850f', opacity: 0.55,
          }} />
        ))}

        {/* Bar counter */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: `${Math.round(60 * _R)}px`,
          background: '#3d1f0d', borderTop: '3px solid #6e4327',
        }}>
          {[15,30,45].map(y => (
            <div key={y} style={{
              position: 'absolute', top: `${y}%`, left: 0, right: 0,
              height: '1px', background: 'rgba(0,0,0,0.2)',
            }} />
          ))}
        </div>

        {/* Sklenice - emoji styl 🍺 */}
        <div style={{
          position: 'absolute', bottom: '6px', left: `${glassX}px`,
          width: `${GLASS_W}px`, height: `${glassH}px`, zIndex: 10,
        }}>
          <svg viewBox={`0 0 ${GLASS_W} ${glassH}`} width={GLASS_W} height={glassH} shapeRendering="crispEdges">
            {/* Pivní náplň */}
            {beerH > 0 && (
              <>
                <rect x="4" y={glassH - beerH - 2} width={GLASS_W - 10} height={beerH} fill="#e89818" />
                <rect x="6" y={glassH - beerH - 2} width="4" height={beerH} fill="#f8c840" opacity="0.35" />
                {[[0.25, 0.35], [0.60, 0.60], [0.85, 0.45]].map(([tx, ty], i) => (
                  <circle key={i}
                    cx={4 + (GLASS_W-10)*tx} cy={glassH - beerH - 2 + beerH * ty}
                    r="1.5" fill="#7a4008" opacity="0.45" />
                ))}
              </>
            )}
            {/* Pěna */}
            {beerH > 5 && (
              <>
                <rect x="4" y={glassH - beerH - 8} width={GLASS_W - 10} height="7" fill="#fefefe" />
                {[0.08, 0.26, 0.46, 0.66, 0.86].map((t, i) => (
                  <circle key={i}
                    cx={4 + (GLASS_W-10)*t} cy={glassH - beerH - 8}
                    r="4" fill="#fefefe" />
                ))}
              </>
            )}
            {/* Obrys sklenice */}
            <rect x="2" y="2" width={GLASS_W - 8} height={glassH - 3}
              fill="none" stroke="rgba(160,200,255,0.55)" strokeWidth="1.5" />
            {/* Ucho */}
            <rect x={GLASS_W-6} y={Math.round(glassH*0.22)} width="7" height="2" fill="#aaccdd" />
            <rect x={GLASS_W} y={Math.round(glassH*0.22)+2} width="2" height={Math.round(glassH*0.38)} fill="#aaccdd" />
            <rect x={GLASS_W-6} y={Math.round(glassH*0.22)+2+Math.round(glassH*0.38)} width="7" height="2" fill="#aaccdd" />
            {/* Odlesk */}
            <line x1="6" y1="4" x2="6" y2={glassH-4} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Fill indicator */}
        <div style={{
          position: 'absolute', top: '20px', right: '6px',
          width: '8px', height: `${Math.round(70 * _R)}px`,
          background: '#12131f', border: '2px solid #444455', zIndex: 10,
        }}>
          <div style={{
            position: 'absolute', bottom: 0, width: '100%',
            height: `${level * 100}%`,
            background: level > 0.8 ? '#5fa85a' : '#f2c14e',
            transition: 'height 0.1s',
          }} />
        </div>

        {done && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,8,18,0.75)',
            color: '#f2c14e', fontSize: '20px',
            fontFamily: "'Press Start 2P', monospace",
          }}>PLNÁ!</div>
        )}
      </div>
    </div>
  );
}
