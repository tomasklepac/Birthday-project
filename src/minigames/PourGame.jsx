import { useState, useRef, useCallback, useEffect } from 'react';

const GLASS_H = 150;
const IDEAL_MIN = 0.83;
const IDEAL_MAX = 0.93;

export default function PourGame({ onComplete }) {
  const [level, setLevel] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [done, setDone] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [drops, setDrops] = useState([]);
  const intervalRef = useRef(null);
  const levelRef = useRef(0);
  const doneRef = useRef(false);
  const bubbleIdRef = useRef(0);

  const startPour = useCallback((e) => {
    e.preventDefault();
    if (doneRef.current || intervalRef.current) return;
    setPouring(true);
    intervalRef.current = setInterval(() => {
      levelRef.current = Math.min(levelRef.current + 0.011, 1.0);
      setLevel(levelRef.current);
      const id = bubbleIdRef.current++;
      setBubbles(b => [...b.slice(-12), {
        id, x: 28 + Math.random() * 24, delay: Math.random() * 0.2,
      }]);
    }, 45);
  }, []);

  const stopPour = useCallback((e) => {
    if (e) e.preventDefault();
    if (doneRef.current || !intervalRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    doneRef.current = true;
    setPouring(false);

    // Inertia: pivo ještě trochu dojede po puštění
    const coast = [[60,0.007],[130,0.005],[200,0.003],[270,0.002],[340,0.001]];
    coast.forEach(([delay, amount]) => {
      setTimeout(() => {
        levelRef.current = Math.min(levelRef.current + amount, 1.0);
        setLevel(levelRef.current);
      }, delay);
    });

    setTimeout(() => {
      const l = levelRef.current;
      let rating;
      if (l >= IDEAL_MIN && l <= IDEAL_MAX) rating = 'good';
      else if (l > IDEAL_MAX) rating = 'over';
      else rating = 'ok';
      setDone(true);
      setTimeout(() => onComplete(rating, l), 2400);
    }, 400);
  }, [onComplete]);

  useEffect(() => {
    if (!pouring || levelRef.current < 0.98) return;
    const id = bubbleIdRef.current++;
    setDrops(d => [...d.slice(-6), { id, x: 30 + Math.random() * 20 }]);
  }, [level, pouring]);

  const foam = Math.min(level * 0.18, 0.14);
  const beerFill = Math.max(0, level - foam);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0px',
      width: '100%',
      userSelect: 'none',
    }}>
      {/* Hint */}
      {!done && (
        <div style={{ color: '#c4850f', fontSize: '20px', textAlign: 'center', marginBottom: '6px' }}>
          {pouring ? 'Pusť ve správný moment!' : 'Podrž a čepuj, pusť v ideální zóně'}
        </div>
      )}

      {/* Pub interior background */}
      <div style={{
        width: '100%',
        maxWidth: '340px',
        position: 'relative',
        background: '#1a100a',
        border: '3px solid #4f2f1b',
        overflow: 'hidden',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.7)',
      }}>
        <svg viewBox="0 0 100 60" width="100%" style={{ display: 'block' }} shapeRendering="crispEdges" preserveAspectRatio="xMidYMid meet">
          <rect width="100" height="60" fill="#2a1508" />
          {[0,25,50,75].map(x => (
            <rect key={x} x={x} y="0" width="24" height="60" fill="#251305" stroke="#1a0d03" strokeWidth="0.5" />
          ))}
          <rect x="0" y="18" width="100" height="2" fill="#4f2f1b" />
          <rect x="0" y="20" width="100" height="1" fill="#6e4327" />
          <rect x="0" y="35" width="100" height="2" fill="#4f2f1b" />
          <rect x="0" y="37" width="100" height="1" fill="#6e4327" />
          {/* Bottles shelf 1 */}
          <rect x="4" y="10" width="4" height="8" fill="#1a3a1a" />
          <rect x="5" y="8" width="2" height="3" fill="#1a3a1a" />
          <rect x="5" y="7" width="2" height="2" fill="#3a6a3a" />
          <rect x="12" y="11" width="4" height="7" fill="#3a1a0a" />
          <rect x="13" y="9" width="2" height="3" fill="#3a1a0a" />
          <rect x="13" y="8" width="2" height="2" fill="#7a3a1a" />
          <rect x="20" y="10" width="4" height="8" fill="#0a1a3a" />
          <rect x="21" y="8" width="2" height="3" fill="#0a1a3a" />
          <rect x="21" y="7" width="2" height="2" fill="#1a3a7a" />
          <rect x="28" y="11" width="4" height="7" fill="#1a3a1a" />
          <rect x="36" y="10" width="4" height="8" fill="#3a0a0a" />
          <rect x="37" y="8" width="2" height="3" fill="#3a0a0a" />
          <rect x="37" y="7" width="2" height="2" fill="#8a1a1a" />
          <rect x="44" y="11" width="4" height="7" fill="#1a3a1a" />
          <rect x="52" y="10" width="4" height="8" fill="#3a2a0a" />
          <rect x="60" y="11" width="4" height="7" fill="#0a1a3a" />
          <rect x="68" y="10" width="4" height="8" fill="#1a3a1a" />
          <rect x="76" y="11" width="4" height="7" fill="#3a1a0a" />
          <rect x="84" y="10" width="4" height="8" fill="#1a0a3a" />
          <rect x="85" y="8" width="2" height="3" fill="#1a0a3a" />
          <rect x="92" y="11" width="5" height="7" fill="#3a1a0a" />
          {/* Bottles shelf 2 */}
          <rect x="6" y="27" width="3" height="8" fill="#2a0a0a" />
          <rect x="6" y="24" width="3" height="4" fill="#2a0a0a" />
          <rect x="6" y="23" width="3" height="2" fill="#7a1a1a" />
          <rect x="14" y="28" width="3" height="7" fill="#0a2a0a" />
          <rect x="25" y="27" width="3" height="8" fill="#0a0a2a" />
          <rect x="35" y="28" width="3" height="7" fill="#2a1a0a" />
          <rect x="48" y="27" width="3" height="8" fill="#1a2a0a" />
          <rect x="60" y="28" width="3" height="7" fill="#2a0a2a" />
          <rect x="72" y="27" width="3" height="8" fill="#0a2a2a" />
          <rect x="85" y="28" width="3" height="7" fill="#2a0a0a" />
          {/* Beer tap */}
          <rect x="41" y="38" width="18" height="22" fill="#1a0d03" />
          <rect x="44" y="50" width="12" height="5" fill="#c4850f" />
          <rect x="47" y="44" width="6" height="8" fill="#c4850f" />
          <rect x="48" y="40" width="4" height="5" fill="#d4950f" />
          <rect x="43" y="42" width="14" height="3" fill="#f2c14e" />
          <rect x="43" y="42" width="3" height="3" fill="#e8a820" />
          <rect x="45" y="43" width="10" height="2" fill="#c4850f" />
        </svg>
      </div>

      {/* Glass */}
      <div
        onPointerDown={startPour}
        onPointerUp={stopPour}
        onPointerLeave={stopPour}
        style={{ cursor: done ? 'default' : 'pointer', position: 'relative', marginTop: '-2px', touchAction: 'none' }}
      >
        <BeerMug
          level={level}
          beerFill={beerFill}
          foam={foam}
          pouring={pouring}
          bubbles={bubbles}
          drops={drops}
          height={GLASS_H}
        />
      </div>

      {/* Bar counter */}
      <div style={{
        width: '100%',
        maxWidth: '340px',
        height: '20px',
        background: '#4f2f1b',
        border: '3px solid #6e4327',
        borderTop: 'none',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.5)',
      }} />
    </div>
  );
}

function BeerMug({ level, beerFill, foam, pouring, bubbles, drops, height }) {
  // Půlitr - střed těla sklenice = střed SVG (ucho je navíc vpravo)
  // W=108, bodyW=74 → BL = W/2 - bodyW/2 = 54-37 = 17 → body center = 54 = W/2 ✓
  const W = 108;
  const H = height;
  const BL = 17;         // tělo vlevo (posunuté doprava aby bylo body vycentrované)
  const BR = 91;         // tělo vpravo (BL + 74)
  const BT = 8;
  const BB = H - 4;
  const IL = BL + 4;     // vnitřní vlevo
  const IR = BR - 4;     // vnitřní vpravo
  const innerH = BB - BT - 2;

  const beerTopY = BB - Math.round(beerFill * innerH);
  const foamTopY = beerTopY - Math.round(foam * innerH);
  // FIX: foamBumpY = where foam bumps sit = slightly above foamTopY
  // clamp so foam doesn't go above glass top BT
  const foamBumpY = Math.max(foamTopY - 3, BT - 6);

  // Show foam only when there's meaningful beer (not immediately at start)
  const showFoam = foam > 0.01 && beerFill > 0.10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} shapeRendering="crispEdges">
      {/* Pivní náplň */}
      {beerFill > 0 && (
        <>
          <rect x={IL} y={Math.max(beerTopY, BT + 2)} width={IR - IL}
            height={BB - Math.max(beerTopY, BT + 2)} fill="#e89818" />
          <rect x={IL + 4} y={Math.max(beerTopY, BT + 2)} width="6"
            height={BB - Math.max(beerTopY, BT + 2)} fill="#f8c840" opacity="0.38" />
          {[[0.22, 0.3], [0.52, 0.6], [0.78, 0.45]].map(([tx, ty], i) => (
            <circle key={i}
              cx={IL + (IR - IL) * tx}
              cy={beerTopY + (BB - beerTopY) * ty}
              r="2" fill="#7a4008" opacity="0.42" />
          ))}
        </>
      )}

      {/* Proud piva padající z pípy do sklenice */}
      {pouring && (
        <rect
          x={IL + (IR - IL) / 2 - 3.5}
          y={BT + 1}
          width={7}
          height={Math.max(0, beerTopY - BT - 1)}
          fill="#f2c14e"
          opacity="0.9"
        />
      )}

      {/* Bubliny při čepování */}
      {pouring && bubbles.map(b => (
        <circle key={b.id}
          cx={Math.max(IL + 2, Math.min(IR - 2, b.x))}
          cy={beerTopY + (BB - beerTopY) * 0.5}
          r="1.6" fill="#f8c840" opacity="0.42" />
      ))}

      {/* Pěna - zobrazí se až po nasbírání dostatečného množství piva */}
      {showFoam && (
        <>
          <rect x={IL} y={Math.max(foamTopY, BT)} width={IR - IL}
            height={Math.max(beerTopY - Math.max(foamTopY, BT), 0)} fill="#fefefe" />
          {/* Bubliny pěny - sedí NA povrchu pěny */}
          {[0.07, 0.21, 0.36, 0.50, 0.64, 0.79, 0.93].map((t, i) => (
            <circle key={i}
              cx={IL + (IR - IL) * t}
              cy={foamBumpY + 5}
              r={5.5} fill="#fefefe" />
          ))}
          {[0.10, 0.26, 0.42, 0.58, 0.74, 0.90].map((t, i) => (
            <circle key={`b2-${i}`}
              cx={IL + (IR - IL) * t}
              cy={foamBumpY + 2}
              r={3.5} fill="#f0f0f0" />
          ))}
        </>
      )}

      {/* Obrys sklenice */}
      <rect x={BL} y={BT} width={BR - BL} height={BB - BT}
        fill="none" stroke="rgba(160,200,255,0.55)" strokeWidth="2.5" />
      <line x1={IL + 2} y1={BT + 3} x2={IL + 2} y2={BB - 3}
        stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

      {/* Ucho - C-tvar */}
      <rect x={BR} y={Math.round(H * 0.22)} width="16" height="5" fill="#aaccdd" />
      <rect x={BR + 11} y={Math.round(H * 0.22) + 5} width="5" height={Math.round(H * 0.36)} fill="#aaccdd" />
      <rect x={BR} y={Math.round(H * 0.22) + 5 + Math.round(H * 0.36)} width="16" height="5" fill="#aaccdd" />

      {/* Přetékající kapky */}
      {drops.map(d => (
        <circle key={d.id}
          cx={Math.max(IL + 2, Math.min(IR - 2, d.x))}
          cy={BB - 6} r="2.5" fill="#e89818" opacity="0.7" />
      ))}
    </svg>
  );
}
