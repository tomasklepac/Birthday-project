import { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';

const BAR_W = Math.min(Math.floor(window.innerWidth - 20), 390);
const BAR_H = Math.round(55 * BAR_W / 300);
const GLASS_W = Math.round(22 * BAR_W / 300);
const CUSTOMER_X = Math.round(BAR_W * 260 / 300);
const FRONT_H = Math.round(24 * BAR_W / 300);

const IDEAL_START = 53;
const IDEAL_END = 70;
const POWER_GRAD = `linear-gradient(to right,
  #4e8a3c 0%, #6fc65f 28%, #aee07a 42%,
  #ffd45f ${IDEAL_START}%, #ffd45f ${IDEAL_END}%,
  #d6a02a 75%, #ef6a5f 86%, #c43a30 100%)`;

const PS2 = "'Press Start 2P', monospace";
const VT = "'VT323', monospace";

export default function SlideGame({ onComplete }) {
  const [phase, setPhase] = useState('aim');
  const [power, setPower] = useState(0);
  const [glassX, setGlassX] = useState(8);
  const [splash, setSplash] = useState(false);
  const [reaction, setReaction] = useState('neutral');
  const rafRef = useRef(null);
  const slideRafRef = useRef(null);
  const powerRef = useRef(0);
  const phaseRef = useRef('aim');
  const glassElRef = useRef(null);

  useEffect(() => {
    if (phase !== 'aim') return;
    let p = 0;
    let dir = 1;
    const tick = () => {
      p += dir * 1.5;
      if (p >= 100) { p = 100; dir = -1; }
      if (p <= 0) { p = 0; dir = 1; }
      powerRef.current = p;
      setPower(p);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const shoot = useCallback(() => {
    if (phaseRef.current !== 'aim') return;
    phaseRef.current = 'sliding';
    cancelAnimationFrame(rafRef.current);
    const finalPower = powerRef.current;
    const vel = (finalPower / 100) * 6.5 * (BAR_W / 300);
    setPhase('sliding');
    let x = 8;
    let v = vel;
    const FRICTION = 0.984;
    const slide = () => {
      v *= FRICTION;
      x += v;
      if (x + GLASS_W >= BAR_W) {
        x = BAR_W - GLASS_W;
        flushSync(() => setGlassX(x));
        finish(x);
        return;
      }
      flushSync(() => setGlassX(x));
      if (v < 0.04) { finish(x); return; }
      slideRafRef.current = requestAnimationFrame(slide);
    };
    slideRafRef.current = requestAnimationFrame(slide);
  }, []);

  const finish = useCallback((finalX) => {
    if (phaseRef.current === 'done') return;
    phaseRef.current = 'done';
    setPhase('done');
    const glassCenter = finalX + GLASS_W / 2;
    const offset = glassCenter - CUSTOMER_X;
    const dist = Math.abs(offset);
    const hit = Math.round(22 * BAR_W / 300);
    if (dist < hit) {
      setReaction('happy'); setSplash(false);
    } else if (offset < 0 && dist < hit * 2.5) {
      setReaction('stretch'); setSplash(false);
    } else if (offset > 0) {
      setReaction('dodge'); setSplash(finalX + GLASS_W >= BAR_W - 5);
    } else {
      setReaction('neutral'); setSplash(false);
    }
    let rating;
    if (dist < hit) rating = 'perfect';
    else if (offset < 0 && dist < hit * 2.5) rating = 'weak';
    else if (offset > 0) rating = 'strong';
    else rating = 'weak';
    setTimeout(() => onComplete(rating), 900);
  }, [onComplete]);

  useEffect(() => {
    if (phase !== 'aim') return;
    const handler = (e) => { e.preventDefault(); shoot(); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [phase, shoot]);

  const inIdeal = power >= IDEAL_START && power <= IDEAL_END;

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 10px 0',
      userSelect: 'none',
      width: '100%',
      overflow: 'hidden',
    }}>
      {/* === PUB INTERIOR BACKGROUND === */}
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }}>
        <PubWallBg />
      </div>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,0.6) 100%)',
      }} />

      {/* Hint */}
      {phase === 'aim' && (
        <div style={{
          position: 'relative', zIndex: 2,
          fontFamily: VT, fontSize: '28px', color: '#f2c14e',
          textAlign: 'center', lineHeight: 1.1,
          textShadow: '2px 2px 0 rgba(0,0,0,0.9)',
        }}>
          Hoď pivo přesně před zákazníka!
        </div>
      )}

      {/* Power bar */}
      {phase === 'aim' && (
        <div style={{
          position: 'relative', zIndex: 2,
          width: `${BAR_W}px`, maxWidth: '90vw',
        }}>
          <div style={{
            fontFamily: PS2, color: '#c8c0a8', fontSize: '7px',
            marginBottom: '5px', textAlign: 'center',
            textShadow: '1px 1px 0 rgba(0,0,0,0.9)',
          }}>
            ŤUKNI PRO ODPÁLENÍ
          </div>

          {/* Track */}
          <div style={{
            height: '26px',
            border: '3px solid #2a1808',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 0 rgba(0,0,0,0.7), inset 0 1px 0 rgba(0,0,0,0.4)',
            background: '#0e0a04',
          }}>
            {/* Dimmed zone background */}
            <div style={{
              position: 'absolute', inset: 0,
              background: POWER_GRAD, opacity: 0.3,
            }} />
            {/* Ideal zone border highlight */}
            <div style={{
              position: 'absolute',
              left: `${IDEAL_START}%`, top: 0,
              width: `${IDEAL_END - IDEAL_START}%`, height: '100%',
              borderLeft: `2px solid rgba(255,212,80,${inIdeal ? 0.9 : 0.5})`,
              borderRight: `2px solid rgba(255,212,80,${inIdeal ? 0.9 : 0.5})`,
              background: inIdeal ? 'rgba(255,220,80,0.12)' : 'transparent',
              transition: 'background 0.08s',
            }} />
            {/* Active fill — uses gradient but sized to full bar so color matches position */}
            <div style={{
              position: 'absolute', left: 0, top: 0,
              width: `${power}%`, height: '100%',
              background: POWER_GRAD,
              backgroundSize: `${BAR_W}px 100%`,
              backgroundRepeat: 'no-repeat',
            }} />
            {/* Cursor line */}
            <div style={{
              position: 'absolute',
              left: `${power}%`, top: 0,
              width: '3px', height: '100%',
              background: 'white',
              transform: 'translateX(-1px)',
              boxShadow: inIdeal
                ? '0 0 8px 3px rgba(255,220,80,0.85)'
                : '0 0 4px rgba(255,255,255,0.5)',
              transition: 'box-shadow 0.08s',
            }} />
          </div>

          {/* Zone labels */}
          <div style={{
            position: 'relative',
            display: 'flex', justifyContent: 'space-between',
            marginTop: '4px', fontFamily: PS2, fontSize: '5px',
          }}>
            <span style={{ color: '#6fc65f' }}>SLABĚ</span>
            <span style={{
              position: 'absolute',
              left: `${(IDEAL_START + IDEAL_END) / 2}%`,
              transform: 'translateX(-50%)',
              color: '#ffd45f',
            }}>IDEÁL</span>
            <span style={{ color: '#ef6a5f' }}>MOC</span>
          </div>
        </div>
      )}

      {/* === BAR SCENE === */}
      <div style={{ position: 'relative', zIndex: 2, width: `${BAR_W}px`, maxWidth: '90vw' }}>

        {/* Bar sliding surface */}
        <div style={{
          width: '100%', height: `${BAR_H}px`,
          background: 'linear-gradient(180deg, #a07848 0%, #7a5228 55%, #4a2a10 100%)',
          borderTop: '3px solid #c49060',
          borderLeft: '3px solid #6e4327',
          borderRight: '3px solid #6e4327',
          position: 'relative', overflow: 'visible',
          boxShadow: 'inset 0 4px 0 rgba(255,200,100,0.1)',
        }}>
          {/* Surface sheen */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
            background: 'rgba(255,210,130,0.16)',
          }} />
          {/* Wood grain */}
          {[12, 28, 45, 62, 80].map(y => (
            <div key={y} style={{
              position: 'absolute', left: 0, right: 0, top: `${y}%`, height: '1px',
              background: 'rgba(0,0,0,0.1)',
            }} />
          ))}

          {/* Decorative tap — left side, behind glass */}
          <BarTap barH={BAR_H} />

          {/* Sliding glass */}
          <BeerMugOnBar x={glassX} barH={BAR_H} glassW={GLASS_W} svgRef={glassElRef} />

          {splash && (
            <div style={{ position: 'absolute', left: `${BAR_W - 22}px`, top: '-10px', fontSize: '14px' }}>
              💦
            </div>
          )}
        </div>

        {/* Bar front panel */}
        <div style={{
          width: '100%', height: `${FRONT_H}px`,
          background: 'linear-gradient(180deg, #3a1e0a 0%, #2a1408 100%)',
          borderTop: '2px solid #8a5020',
          borderLeft: '3px solid #5a3010',
          borderRight: '3px solid #5a3010',
          borderBottom: '3px solid #4a2510',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 3px 0 rgba(0,0,0,0.5)',
        }}>
          {/* Panel vertical dividers */}
          {[0.2, 0.4, 0.6, 0.8].map(t => (
            <div key={t} style={{
              position: 'absolute', left: `${t * 100}%`, top: '10%',
              width: '1px', height: '80%',
              background: 'rgba(100,55,15,0.5)',
            }} />
          ))}
          {/* Top molding line */}
          <div style={{
            position: 'absolute', top: '15%', left: '2%', right: '2%', height: '1px',
            background: 'rgba(160,100,40,0.4)',
          }} />
          {/* Bottom molding line */}
          <div style={{
            position: 'absolute', bottom: '15%', left: '2%', right: '2%', height: '1px',
            background: 'rgba(160,100,40,0.3)',
          }} />
        </div>

        {/* Customer */}
        <CustomerSprite reaction={reaction} barW={BAR_W} />
      </div>

      {phase === 'sliding' && (
        <div style={{
          position: 'relative', zIndex: 2,
          fontFamily: VT, fontSize: '30px', color: '#f2c14e',
          textShadow: '2px 2px 0 rgba(0,0,0,0.9)',
        }}>
          letí to...
        </div>
      )}
    </div>
  );
}

/* ─── PUB WALL BACKGROUND ─── */
function PubWallBg() {
  const bottles1 = [
    { x: 18, c: '#1a3a1a', c2: '#2a5a2a' }, { x: 33, c: '#3a1a0a', c2: '#6a3010' },
    { x: 48, c: '#0a1a3a', c2: '#1a3a7a' }, { x: 68, c: '#3a0a0a', c2: '#7a1a1a' },
    { x: 83, c: '#1a3a1a', c2: '#3a6a3a' }, { x: 98, c: '#2a2a0a', c2: '#6a6a1a' },
    { x: 118, c: '#1a0a3a', c2: '#3a1a8a' }, { x: 133, c: '#3a1a0a', c2: '#7a3a10' },
    { x: 148, c: '#0a2a0a', c2: '#1a5a1a' }, { x: 168, c: '#3a0a1a', c2: '#7a1a4a' },
    { x: 183, c: '#0a1a2a', c2: '#1a4a6a' }, { x: 198, c: '#2a1a0a', c2: '#5a3a10' },
    { x: 218, c: '#1a3a0a', c2: '#3a7a1a' }, { x: 233, c: '#3a1a1a', c2: '#6a2a2a' },
    { x: 248, c: '#0a2a2a', c2: '#1a5a5a' }, { x: 268, c: '#2a0a2a', c2: '#5a1a5a' },
    { x: 283, c: '#1a2a0a', c2: '#4a5a1a' },
  ];
  const bottles2 = [
    { x: 18, c: '#2a1a0a', c2: '#5a3820', type: 'b' }, { x: 34, c: '#1a3a2a', c2: '#3a7a4a', type: 'b' },
    { x: 50, c: '#3a2a0a', c2: '#7a5a10', type: 'b' }, { x: 66, c: '#0a1a3a', c2: '#1a3a8a', type: 'b' },
    { x: 82, c: '#1a0a1a', c2: '#4a1a5a', type: 'b' }, { x: 103, type: 'm' }, { x: 120, type: 'm' },
    { x: 142, c: '#3a1a0a', c2: '#6a2a10', type: 'b' }, { x: 158, c: '#1a3a1a', c2: '#3a6a3a', type: 'b' },
    { x: 174, c: '#2a0a0a', c2: '#6a1a1a', type: 'b' }, { x: 190, c: '#0a2a1a', c2: '#1a6a3a', type: 'b' },
    { x: 213, type: 'm' }, { x: 230, type: 'm' },
    { x: 254, c: '#1a1a3a', c2: '#3a3a8a', type: 'b' }, { x: 270, c: '#3a2a0a', c2: '#6a5020', type: 'b' },
  ];

  return (
    <svg
      width="100%" height="100%"
      viewBox="0 0 300 320"
      preserveAspectRatio="xMidYMid slice"
      shapeRendering="crispEdges"
      style={{ display: 'block' }}
    >
      {/* ── WOOD PLANKS (full background) ── */}
      {Array.from({ length: 17 }).map((_, i) => (
        <rect key={`p${i}`} x="0" y={i * 20} width="300" height="20"
          fill={i % 2 === 0 ? '#5a3a1f' : '#6a4526'} />
      ))}
      {/* Plank gaps */}
      {Array.from({ length: 17 }).map((_, i) => (
        <rect key={`g${i}`} x="0" y={i * 20} width="300" height="1" fill="rgba(0,0,0,0.35)" />
      ))}
      {/* Plank top highlights */}
      {Array.from({ length: 17 }).map((_, i) => (
        <rect key={`h${i}`} x="0" y={i * 20 + 1} width="300" height="1" fill="rgba(255,195,110,0.07)" />
      ))}
      {/* Wood grain */}
      {[[30, 0.45], [80, 0.3], [140, 0.7], [200, 0.25], [260, 0.55], [50, 0.8], [170, 0.15]].map(([x, f], i) => (
        <line key={`gr${i}`} x1={x} y1={0} x2={x + 5} y2={320} stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
      ))}
      {/* Knots */}
      {[[45, 38], [185, 78], [92, 158], [242, 108], [130, 238]].map(([kx, ky], i) => (
        <ellipse key={`k${i}`} cx={kx} cy={ky} rx="5" ry="3" fill="rgba(0,0,0,0.22)" />
      ))}

      {/* ── CEILING ── */}
      <rect width="300" height="15" fill="#180c06" />
      <rect x="0" y="13" width="300" height="2" fill="#2a1a0a" />
      {[50, 150, 250].map(x => (
        <rect key={`bm${x}`} x={x - 3} y="0" width="6" height="15" fill="#251408" />
      ))}

      {/* ── HANGING LIGHTS ── */}
      {[75, 225].map((lx, i) => (
        <g key={`L${i}`}>
          <rect x={lx} y="0" width="2" height="11" fill="#4a3020" />
          <rect x={lx - 6} y="11" width="14" height="7" fill="#6a4820" />
          <rect x={lx - 5} y="12" width="12" height="5" fill="#f2c14e" opacity="0.92" />
          <rect x={lx - 4} y="12" width="5" height="3" fill="#ffe080" opacity="0.5" />
          <ellipse cx={lx + 1} cy="26" rx="32" ry="20" fill="#f2c14e" opacity="0.1" />
          <ellipse cx={lx + 1} cy="22" rx="16" ry="10" fill="#f2c14e" opacity="0.1" />
        </g>
      ))}

      {/* ── SHELF 1 (y=57) ── */}
      <rect x="6" y="57" width="288" height="11" fill="#8a5a30" />
      <rect x="6" y="57" width="288" height="2" fill="#c49060" />
      <rect x="6" y="66" width="288" height="2" fill="#3a1a08" />
      {[32, 150, 268].map(x => (
        <g key={`br1${x}`}>
          <rect x={x} y="57" width="5" height="20" fill="#5a3010" />
          <rect x={x - 4} y="68" width="13" height="5" fill="#5a3010" />
        </g>
      ))}
      {/* Bottles on shelf 1 */}
      {bottles1.map(({ x: bx, c, c2 }, i) => (
        <g key={`b1${i}`}>
          <rect x={bx} y="20" width="9" height="37" fill={c} />
          <rect x={bx + 1} y="20" width="3" height="37" fill={c2} opacity="0.45" />
          <rect x={bx + 1} y="11" width="6" height="11" fill={c} />
          <rect x={bx + 2} y="9" width="4" height="3" fill="#3a3a3a" />
          <rect x={bx + 1} y="24" width="7" height="8" fill="#e8e0c8" opacity="0.72" />
          <rect x={bx + 8} y="21" width="1" height="33" fill="rgba(255,255,255,0.11)" />
        </g>
      ))}

      {/* ── UCHO SIGN ── */}
      <rect x="108" y="76" width="84" height="34" fill="#1a0e04" stroke="#c4850f" strokeWidth="2" />
      <rect x="110" y="78" width="80" height="30" fill="#120a04" />
      <rect x="110" y="78" width="80" height="2" fill="rgba(196,133,15,0.4)" />
      <rect x="110" y="106" width="80" height="2" fill="rgba(0,0,0,0.5)" />
      <text x="150" y="100" textAnchor="middle"
        fontSize="11" fontFamily="'Press Start 2P', monospace" fill="#f2c14e">UCHO</text>

      {/* ── SHELF 2 (y=140) ── */}
      <rect x="6" y="140" width="288" height="11" fill="#8a5a30" />
      <rect x="6" y="140" width="288" height="2" fill="#c49060" />
      <rect x="6" y="149" width="288" height="2" fill="#3a1a08" />
      {[32, 150, 268].map(x => (
        <g key={`br2${x}`}>
          <rect x={x} y="140" width="5" height="20" fill="#5a3010" />
          <rect x={x - 4} y="151" width="13" height="5" fill="#5a3010" />
        </g>
      ))}
      {/* Bottles/mugs on shelf 2 */}
      {bottles2.map(({ x: bx, c, c2, type }, i) =>
        type === 'b' ? (
          <g key={`b2${i}`}>
            <rect x={bx} y="107" width="9" height="33" fill={c} />
            <rect x={bx + 1} y="107" width="3" height="33" fill={c2} opacity="0.45" />
            <rect x={bx + 1} y="98" width="6" height="11" fill={c} />
            <rect x={bx + 2} y="96" width="4" height="3" fill="#3a3a3a" />
            <rect x={bx + 1} y="111" width="7" height="7" fill="#e8e0c8" opacity="0.68" />
            <rect x={bx + 8} y="109" width="1" height="29" fill="rgba(255,255,255,0.1)" />
          </g>
        ) : (
          <g key={`m2${i}`}>
            <rect x={bx} y="112" width="13" height="28" fill="#b8c8d8" opacity="0.75" />
            <rect x={bx + 1} y="113" width="5" height="26" fill="#d8e8f8" opacity="0.28" />
            <rect x={bx} y="112" width="13" height="5" fill="#dceef8" opacity="0.65" />
            <rect x={bx + 13} y="118" width="5" height="2" fill="#9ab0c0" opacity="0.7" />
            <rect x={bx + 16} y="120" width="2" height="10" fill="#9ab0c0" opacity="0.7" />
            <rect x={bx + 13} y="130" width="5" height="2" fill="#9ab0c0" opacity="0.7" />
          </g>
        )
      )}

      {/* ── GUESTS ── */}
      {/* Guest 1 */}
      <g>
        <rect x="17" y="164" width="14" height="14" fill="#3a2010" />
        <rect x="16" y="161" width="15" height="5" fill="#5a3010" />
        <rect x="20" y="170" width="2" height="2" fill="#1a0e06" />
        <rect x="25" y="170" width="2" height="2" fill="#1a0e06" />
        <rect x="21" y="174" width="5" height="1" fill="#c46b5a" />
        <rect x="15" y="178" width="17" height="20" fill="#4a5878" />
        <rect x="13" y="178" width="2" height="13" fill="#4a5878" />
        <rect x="32" y="178" width="2" height="13" fill="#4a5878" />
        <rect x="17" y="198" width="5" height="18" fill="#2a2030" />
        <rect x="24" y="198" width="5" height="18" fill="#2a2030" />
      </g>
      {/* Guest 2 */}
      <g>
        <rect x="68" y="159" width="14" height="14" fill="#5a3820" />
        <rect x="67" y="157" width="16" height="5" fill="#2a1a0a" />
        <rect x="71" y="165" width="2" height="2" fill="#1a0e06" />
        <rect x="76" y="165" width="2" height="2" fill="#1a0e06" />
        <rect x="72" y="170" width="5" height="2" fill="#c46b5a" />
        <rect x="66" y="173" width="17" height="20" fill="#5a2020" />
        <rect x="64" y="173" width="2" height="13" fill="#5a2020" />
        <rect x="83" y="173" width="2" height="13" fill="#5a2020" />
        <rect x="68" y="193" width="5" height="18" fill="#252030" />
        <rect x="75" y="193" width="5" height="18" fill="#252030" />
      </g>
      {/* Guests 3+4 toasting */}
      <g>
        <rect x="148" y="162" width="14" height="14" fill="#c4a070" />
        <rect x="147" y="160" width="15" height="5" fill="#8a6030" />
        <rect x="151" y="168" width="2" height="2" fill="#1a0e06" />
        <rect x="156" y="168" width="2" height="2" fill="#1a0e06" />
        <rect x="152" y="172" width="5" height="2" fill="#c46b5a" />
        <rect x="146" y="176" width="17" height="20" fill="#2a5040" />
        <rect x="144" y="176" width="2" height="12" fill="#2a5040" />
        <rect x="163" y="174" width="4" height="9" fill="#2a5040" />
        <rect x="148" y="196" width="5" height="18" fill="#1a1828" />
        <rect x="155" y="196" width="5" height="18" fill="#1a1828" />
      </g>
      {/* Toast glasses */}
      <rect x="167" y="176" width="6" height="14" fill="#d8e8f0" opacity="0.72" />
      <rect x="167" y="176" width="6" height="4" fill="#f0f8e8" opacity="0.82" />
      <rect x="176" y="176" width="6" height="14" fill="#d8e8f0" opacity="0.72" />
      <rect x="176" y="176" width="6" height="4" fill="#f0f8e8" opacity="0.82" />
      <g>
        <rect x="186" y="162" width="14" height="14" fill="#7a5030" />
        <rect x="184" y="159" width="17" height="6" fill="#6a4020" />
        <rect x="189" y="168" width="2" height="2" fill="#1a0e06" />
        <rect x="194" y="168" width="2" height="2" fill="#1a0e06" />
        <rect x="190" y="172" width="5" height="2" fill="#c46b5a" />
        <rect x="185" y="176" width="17" height="20" fill="#6a3050" />
        <rect x="182" y="174" width="4" height="9" fill="#6a3050" />
        <rect x="202" y="176" width="2" height="12" fill="#6a3050" />
        <rect x="187" y="196" width="5" height="18" fill="#1a1828" />
        <rect x="194" y="196" width="5" height="18" fill="#1a1828" />
      </g>
      {/* Guest 5 */}
      <g>
        <rect x="248" y="165" width="14" height="14" fill="#4a2818" />
        <rect x="247" y="163" width="15" height="5" fill="#3a1808" />
        <rect x="251" y="171" width="2" height="2" fill="#1a0e06" />
        <rect x="256" y="171" width="2" height="2" fill="#1a0e06" />
        <rect x="252" y="175" width="5" height="1" fill="#c46b5a" />
        <rect x="246" y="179" width="17" height="20" fill="#3a5a20" />
        <rect x="244" y="179" width="2" height="13" fill="#3a5a20" />
        <rect x="263" y="179" width="2" height="13" fill="#3a5a20" />
        <rect x="248" y="199" width="5" height="18" fill="#2a2030" />
        <rect x="255" y="199" width="5" height="18" fill="#2a2030" />
        {/* Glass in hand */}
        <rect x="263" y="186" width="7" height="12" fill="#d8e8f0" opacity="0.62" />
        <rect x="263" y="186" width="7" height="4" fill="#f0f8e8" opacity="0.72" />
      </g>

      {/* ── WALL TAP (decorative, lower left) ── */}
      <g>
        {/* Base plate */}
        <rect x="24" y="270" width="18" height="6" fill="#5a3010" />
        {/* Chrome post */}
        <rect x="31" y="240" width="5" height="32" fill="#9ab8c8" />
        <rect x="32" y="240" width="2" height="32" fill="#d8eaf8" opacity="0.65" />
        {/* Top */}
        <rect x="28" y="237" width="11" height="5" fill="#8aa8c0" />
        <rect x="29" y="238" width="8" height="2" fill="#c8e0f0" opacity="0.75" />
        {/* Red handle */}
        <rect x="35" y="248" width="10" height="7" fill="#d84020" />
        <rect x="43" y="249" width="5" height="5" fill="#d84020" />
        <rect x="35" y="249" width="4" height="2" fill="#f06040" opacity="0.65" />
        {/* Spout */}
        <rect x="30" y="272" width="5" height="5" fill="#8aa8c0" />
        <rect x="29" y="275" width="8" height="2" fill="#6a8aa0" />
      </g>
    </svg>
  );
}

/* ─── BAR TAP (decorative on bar surface, left side) ─── */
function BarTap({ barH }) {
  const h = barH - 2;
  const tapTop = Math.round(-h * 0.55);
  return (
    <div style={{
      position: 'absolute',
      left: `${Math.round(BAR_W * 0.08)}px`,
      top: `${tapTop}px`,
      pointerEvents: 'none',
      zIndex: 1,
    }}>
      <svg viewBox="0 0 16 48" width={Math.round(16 * h / 40)} height={Math.round(48 * h / 40)}
        shapeRendering="crispEdges">
        {/* Post */}
        <rect x="6" y="4" width="4" height="36" fill="#9ab8c8" />
        <rect x="7" y="4" width="2" height="36" fill="#d8eaf8" opacity="0.6" />
        {/* Top knob */}
        <rect x="4" y="2" width="8" height="4" fill="#8aa8c0" />
        <rect x="5" y="3" width="5" height="2" fill="#c8e0f0" opacity="0.7" />
        {/* Red handle */}
        <rect x="9" y="12" width="7" height="5" fill="#d84020" />
        <rect x="9" y="13" width="3" height="2" fill="#f06040" opacity="0.6" />
        {/* Base */}
        <rect x="3" y="40" width="10" height="6" fill="#5a3010" />
        <rect x="2" y="43" width="12" height="3" fill="#4a2808" />
        {/* Spout */}
        <rect x="5" y="38" width="6" height="3" fill="#8aa8c0" />
        <rect x="4" y="40" width="8" height="2" fill="#6a8aa0" />
      </svg>
    </div>
  );
}

/* ─── BEER MUG ON BAR (unchanged logic) ─── */
function BeerMugOnBar({ x, barH, svgRef }) {
  const h = barH - 4;
  const bodyW = GLASS_W;
  const handleW = 8;
  const totalW = bodyW + handleW;
  const BT = 2;
  const BB = h - 2;
  const foamBaseY = BT + 5;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${totalW} ${h}`}
      width={totalW}
      height={h}
      style={{ position: 'absolute', left: `${x}px`, top: '2px', overflow: 'visible', zIndex: 2 }}
      shapeRendering="crispEdges"
    >
      <rect x="1" y={foamBaseY} width={bodyW - 2} height={BB - foamBaseY} fill="#e89818" />
      <rect x="2" y={foamBaseY} width="3" height={BB - foamBaseY} fill="#f8c840" opacity="0.35" />
      <circle cx="7" cy={foamBaseY + 10} r="1.4" fill="#7a4008" opacity="0.45" />
      <circle cx="14" cy={foamBaseY + 22} r="1.4" fill="#7a4008" opacity="0.4" />
      <rect x="1" y={BT} width={bodyW - 2} height={foamBaseY - BT} fill="#fefefe" />
      {[0.08, 0.30, 0.55, 0.78, 0.95].map((t, i) => (
        <circle key={i} cx={1 + (bodyW - 2) * t} cy={BT} r="3" fill="#fefefe" />
      ))}
      <rect x="0" y={BT} width={bodyW} height={BB - BT}
        fill="none" stroke="rgba(160,200,255,0.55)" strokeWidth="1.5" />
      <line x1="2" y1={BT + 2} x2="2" y2={BB - 2} stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
      <rect x={bodyW} y={Math.round(h * 0.34)} width={handleW - 1} height="2" fill="#aaccdd" />
      <rect x={bodyW + handleW - 3} y={Math.round(h * 0.36)} width="2" height={Math.round(h * 0.30)} fill="#aaccdd" />
      <rect x={bodyW} y={Math.round(h * 0.36) + Math.round(h * 0.30)} width={handleW - 1} height="2" fill="#aaccdd" />
    </svg>
  );
}

/* ─── CUSTOMER SPRITE ─── */
function CustomerSprite({ reaction }) {
  const w = 40;
  const h = 68;

  return (
    <div style={{ position: 'absolute', right: '4px', top: `-${50}px` }}>
      <svg viewBox="0 0 32 68" width={w} height={h} shapeRendering="crispEdges">

        {/* ! bubble (only when neutral/waiting) */}
        {reaction === 'neutral' && (
          <g>
            <rect x="20" y="0" width="10" height="12" fill="#f2c14e" />
            <rect x="22" y="1" width="4" height="1" fill="#1a0e06" />
            <rect x="24" y="2" width="2" height="6" fill="#1a0e06" />
            <rect x="24" y="9" width="2" height="2" fill="#1a0e06" />
            <rect x="21" y="12" width="4" height="2" fill="#f2c14e" />
            <rect x="23" y="14" width="2" height="2" fill="#f2c14e" />
          </g>
        )}

        {/* Hair */}
        <rect x="8" y="4" width="14" height="5" fill="#4a2a10" />
        <rect x="7" y="6" width="2" height="5" fill="#4a2a10" />
        {/* Head */}
        <rect x="8" y="6" width="14" height="13" fill="#f4cda0" />
        {/* Eyes */}
        <rect x="11" y="9" width="2" height="2" fill="#2a1a0a" />
        <rect x="17" y="9" width="2" height="2" fill="#2a1a0a" />
        {/* Mouth */}
        {reaction === 'happy' ? (
          <>
            <rect x="11" y="14" width="2" height="1" fill="#c46b5a" />
            <rect x="13" y="15" width="4" height="1" fill="#c46b5a" />
            <rect x="17" y="14" width="2" height="1" fill="#c46b5a" />
          </>
        ) : reaction === 'dodge' ? (
          <rect x="13" y="14" width="4" height="1" fill="#c46b5a" />
        ) : (
          <rect x="12" y="14" width="6" height="1" fill="#c46b5a" />
        )}

        {/* Body */}
        <rect x="6" y="19" width="18" height="14" fill="#4a78c0" />
        {/* Left arm */}
        <rect x="4" y="19" width="2" height="11" fill="#4a78c0" />
        {/* Right arm */}
        {reaction === 'stretch' ? (
          <>
            <rect x="24" y="19" width="2" height="7" fill="#4a78c0" />
            <rect x="26" y="19" width="5" height="2" fill="#f4cda0" />
            <rect x="26" y="21" width="4" height="2" fill="#f4cda0" />
          </>
        ) : reaction === 'happy' ? (
          <>
            <rect x="24" y="17" width="2" height="5" fill="#4a78c0" />
            <rect x="26" y="16" width="2" height="4" fill="#f4cda0" />
          </>
        ) : (
          <rect x="24" y="19" width="2" height="11" fill="#4a78c0" />
        )}

        {/* Legs */}
        <rect x="8" y="33" width="5" height="9" fill="#1a1828" />
        <rect x="17" y="33" width="5" height="9" fill="#1a1828" />

        {/* Stool seat */}
        <rect x="2" y="41" width="28" height="4" fill="#8a5a30" />
        <rect x="2" y="41" width="28" height="1" fill="#c49060" />
        <rect x="2" y="44" width="28" height="1" fill="#3a1a08" />

        {/* Stool legs (extend below bar, partially hidden) */}
        <rect x="4" y="45" width="3" height="22" fill="#6a3a18" />
        <rect x="25" y="45" width="3" height="22" fill="#6a3a18" />
        {/* Footrest */}
        <rect x="4" y="56" width="24" height="2" fill="#5a3010" />
        {/* Feet */}
        <rect x="2" y="67" width="6" height="1" fill="#1a1020" />
        <rect x="24" y="67" width="6" height="1" fill="#1a1020" />
      </svg>
    </div>
  );
}
