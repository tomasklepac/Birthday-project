import { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';

const BAR_W = 300;
const BAR_H = 55;
const GLASS_W = 22;
const CUSTOMER_X = BAR_W - 40;

export default function SlideGame({ onComplete }) {
  const [phase, setPhase] = useState('aim'); // aim | sliding | done
  const [power, setPower] = useState(0);
  const [glassX, setGlassX] = useState(8);
  const [splash, setSplash] = useState(false);
  const [reaction, setReaction] = useState('neutral');
  const rafRef = useRef(null);     // power meter rAF
  const slideRafRef = useRef(null); // slide animation rAF
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
    const vel = (finalPower / 100) * 6.5;
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

      if (v < 0.04) {
        finish(x);
        return;
      }
      slideRafRef.current = requestAnimationFrame(slide);
    };
    slideRafRef.current = requestAnimationFrame(slide);
  }, []);

  const finish = useCallback((finalX) => {
    if (phaseRef.current === 'done') return;
    phaseRef.current = 'done';
    setPhase('done');

    const glassCenter = finalX + GLASS_W / 2;
    // offset: záporný = sklenice je nalevo od zákazníka (nestřelil dost)
    //         kladný  = sklenice přestřelila doprava
    const offset = glassCenter - CUSTOMER_X;
    const dist = Math.abs(offset);

    if (dist < 22) {
      // Přesně před zákazníka
      setReaction('happy');
      setSplash(false);
    } else if (offset < 0 && dist < 55) {
      // Trochu kratší — zákazník se natáhne
      setReaction('stretch');
      setSplash(false);
    } else if (offset > 0) {
      // Přestřeleno — zákazník ucouvne
      setReaction('dodge');
      setSplash(finalX + GLASS_W >= BAR_W - 5);
    } else {
      // Moc slabý hod, sklenice se zastavila daleko
      setReaction('neutral');
      setSplash(false);
    }

    let rating;
    if (dist < 22) rating = 'perfect';
    else if (offset < 0 && dist < 55) rating = 'weak';   // trochu krátký
    else if (offset > 0) rating = 'strong';               // přestřeleno
    else rating = 'weak';                                  // moc slabý = zákazník nedosáhl
    setTimeout(() => onComplete(rating), 900);
  }, [onComplete]);

  // Ťuknout lze kamkoliv na obrazovce
  useEffect(() => {
    if (phase !== 'aim') return;
    const handler = (e) => { e.preventDefault(); shoot(); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [phase, shoot]);

  const powerColor = power < 40 ? '#4a78c0' : power < 70 ? '#5fa85a' : '#e0524a';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '12px',
        userSelect: 'none',
        width: '100%',
      }}
    >
      {/* Hint */}
      {phase === 'aim' && (
        <div style={{ color: '#c4850f', fontSize: '20px', textAlign: 'center' }}>
          Ťukni a hoď pivo k zákazníkovi
        </div>
      )}

      {/* Power meter */}
      {phase === 'aim' && (
        <div style={{ width: `${BAR_W}px`, maxWidth: '90vw' }}>
          <div style={{ color: '#888899', fontSize: '18px', marginBottom: '4px', textAlign: 'center' }}>
            ŤUKNI PRO ODPÁLENÍ
          </div>
          <div style={{
            height: '22px',
            background: '#12131f',
            border: '3px solid #555566',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0,
              width: `${power}%`, height: '100%',
              background: powerColor,
            }} />
            <div style={{
              position: 'absolute',
              left: '53%', top: 0,
              width: '17%', height: '100%',
              background: 'rgba(95,168,90,0.25)',
              border: '1px solid #5fa85a88',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontFamily: "'Press Start 2P', monospace" }}>
            <span style={{ color: '#4a78c0', fontSize: '5px' }}>SLABÝ</span>
            <span style={{ color: '#5fa85a', fontSize: '5px' }}>IDEÁL</span>
            <span style={{ color: '#e0524a', fontSize: '5px' }}>SILNÝ</span>
          </div>
        </div>
      )}

      {/* Bar scene */}
      <div style={{ position: 'relative', width: `${BAR_W}px`, maxWidth: '90vw' }}>
        {/* Bar top surface */}
        <div style={{
          width: '100%',
          height: `${BAR_H}px`,
          background: '#3d1f0d',
          border: '3px solid #6e4327',
          position: 'relative',
          overflow: 'visible',
          boxShadow: '3px 3px 0 rgba(0,0,0,0.6)',
        }}>
          {/* Wood grain lines */}
          {[8,16,24,32,40,48].map(y => (
            <div key={y} style={{
              position: 'absolute', left: 0, top: `${y}%`, right: 0,
              height: '1px', background: 'rgba(0,0,0,0.15)',
            }} />
          ))}
          {/* Bar shine */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '6px', background: 'rgba(255,200,100,0.12)',
          }} />

          {/* Beer mug */}
          <BeerMugOnBar x={glassX} barH={BAR_H} glassW={GLASS_W} svgRef={glassElRef} />

          {/* Splash */}
          {splash && (
            <div style={{ position: 'absolute', left: `${BAR_W - 20}px`, top: '-8px', fontSize: '12px' }}>
              💦
            </div>
          )}
        </div>

        {/* Bar front edge */}
        <div style={{
          width: '100%',
          height: '8px',
          background: '#5a2d10',
          border: '2px solid #4a2510',
          borderTop: 'none',
        }} />

        {/* Customer */}
        <CustomerSprite reaction={reaction} barW={BAR_W} />
      </div>

      {phase === 'sliding' && (
        <div style={{ color: '#f2c14e', fontSize: '20px' }}>
          letí to...
        </div>
      )}
    </div>
  );
}

function BeerMugOnBar({ x, barH, svgRef }) {
  const h = barH - 4;
  // Tělo roztaženo na plnou šíři GLASS_W, ucho přesahuje doprava (overflow: visible)
  const bodyW = GLASS_W;   // 22px — stejně jako v pour game
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
      style={{ position: 'absolute', left: `${x}px`, top: '2px', overflow: 'visible' }}
      shapeRendering="crispEdges"
    >
      {/* Pivo - plné */}
      <rect x="1" y={foamBaseY} width={bodyW - 2} height={BB - foamBaseY} fill="#e89818" />
      <rect x="2" y={foamBaseY} width="3" height={BB - foamBaseY} fill="#f8c840" opacity="0.35" />
      <circle cx="7" cy={foamBaseY + 10} r="1.4" fill="#7a4008" opacity="0.45" />
      <circle cx="14" cy={foamBaseY + 22} r="1.4" fill="#7a4008" opacity="0.4" />
      {/* Pěna */}
      <rect x="1" y={BT} width={bodyW - 2} height={foamBaseY - BT} fill="#fefefe" />
      {[0.08, 0.30, 0.55, 0.78, 0.95].map((t, i) => (
        <circle key={i} cx={1 + (bodyW - 2) * t} cy={BT} r="3" fill="#fefefe" />
      ))}
      {/* Obrys */}
      <rect x="0" y={BT} width={bodyW} height={BB - BT}
        fill="none" stroke="rgba(160,200,255,0.55)" strokeWidth="1.5" />
      <line x1="2" y1={BT + 2} x2="2" y2={BB - 2} stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
      {/* Ucho */}
      <rect x={bodyW} y={Math.round(h * 0.34)} width={handleW - 1} height="2" fill="#aaccdd" />
      <rect x={bodyW + handleW - 3} y={Math.round(h * 0.36)} width="2" height={Math.round(h * 0.30)} fill="#aaccdd" />
      <rect x={bodyW} y={Math.round(h * 0.36) + Math.round(h * 0.30)} width={handleW - 1} height="2" fill="#aaccdd" />
    </svg>
  );
}

function CustomerSprite({ reaction, barW }) {
  const faces = {
    neutral: (
      <>
        <rect x="4" y="2" width="1" height="1" fill="#3a2a1a" />
        <rect x="7" y="2" width="1" height="1" fill="#3a2a1a" />
        <rect x="5" y="5" width="3" height="1" fill="#c46b5a" />
      </>
    ),
    happy: (
      <>
        <rect x="4" y="2" width="1" height="1" fill="#3a2a1a" />
        <rect x="7" y="2" width="1" height="1" fill="#3a2a1a" />
        <rect x="5" y="4" width="1" height="1" fill="#c46b5a" />
        <rect x="6" y="5" width="1" height="1" fill="#c46b5a" />
        <rect x="4" y="4" width="1" height="1" fill="#c46b5a" />
        <rect x="7" y="4" width="1" height="1" fill="#c46b5a" />
      </>
    ),
    stretch: (
      <>
        <rect x="4" y="2" width="1" height="1" fill="#3a2a1a" />
        <rect x="7" y="2" width="1" height="1" fill="#3a2a1a" />
        <rect x="4" y="5" width="4" height="1" fill="#c46b5a" />
      </>
    ),
    dodge: (
      <>
        <rect x="3" y="2" width="1" height="1" fill="#3a2a1a" />
        <rect x="6" y="2" width="1" height="1" fill="#3a2a1a" />
        <rect x="4" y="5" width="3" height="1" fill="#c46b5a" />
      </>
    ),
  };
  return (
    <div style={{
      position: 'absolute',
      right: '4px',
      top: `-36px`,
    }}>
      <svg viewBox="0 0 14 22" width="24" height="38" shapeRendering="crispEdges">
        <rect x="2" y="0" width="10" height="2" fill="#5a3a10" />
        <rect x="2" y="2" width="8" height="6" fill="#f4cda0" />
        {faces[reaction]}
        <rect x="1" y="8" width="10" height="7" fill="#4a78c0" />
        <rect x="0" y="8" width="1" height="5" fill="#4a78c0" />
        <rect x="11" y="8" width="1" height={reaction === 'stretch' ? 3 : 5} fill="#4a78c0" />
        <rect x="2" y="15" width="3" height="6" fill="#2b2b38" />
        <rect x="7" y="15" width="3" height="6" fill="#2b2b38" />
        <rect x="1" y="20" width="4" height="2" fill="#1a1020" />
        <rect x="6" y="20" width="4" height="2" fill="#1a1020" />
        {reaction === 'happy' && (
          <>
            <rect x="12" y="6" width="2" height="3" fill="#f4cda0" />
            <rect x="12" y="5" width="2" height="1" fill="#f4cda0" />
          </>
        )}
      </svg>
    </div>
  );
}
