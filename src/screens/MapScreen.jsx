import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import MajdaSprite from '../components/MajdaSprite.jsx';
import BeerCounter from '../components/BeerCounter.jsx';
import { PUBS } from '../gameData.js';

// ─── Image metadata ─────────────────────────────────────────────────────────
const IMG_W = 840, IMG_H = 1096;

// Maximum horizontal crop fraction from each side before we stop zooming in.
// Derived from extreme pub positions + required margin:
//   leftmost pubs at x≈24 %  → need 8 % margin → max crop = 24 − 8 = 16 %
//   rightmost pub  at x≈77 %  → need 8 % margin → max crop = 100−77−8 = 15 %
//   symmetric crop → clamp at min(16, 15) = 15 %
const MAX_CROP = 0.15;

// ─── Pub positions (% of image) ─────────────────────────────────────────────

const PUB_POSITIONS = [
  { x: 70, y: 80 },  // LOKÁL
  { x: 24, y: 62 },  // PIVOŇKA
  { x: 77, y: 42 },  // UCHO
  { x: 24, y: 21 },  // NO LIMIT
];


// Majda: feet at building bottom, inner side of S-curve
const MAJDA_POS = [
  { x: 57, y: 87 },  // LOKÁL  – vlevo
  { x: 36, y: 68 },  // PIVOŇKA – vpravo
  { x: 65, y: 50 },  // UCHO   – vlevo
  { x: 36, y: 27 },  // NO LIMIT – vpravo
];

// ─── Bounds calculation ──────────────────────────────────────────────────────
//
// 1. Start with cover scale (fills the container with no blank bars).
// 2. If the resulting horizontal crop would exceed MAX_CROP, clamp the
//    rendered width so crop = exactly MAX_CROP.  The image then no longer
//    fills the full height → letterbox bars appear, filled by the gradient.
// 3. Return { ox, oy, w, h } — the exact rectangle the image occupies inside
//    the container.  Overlay positions are computed from this rectangle.
//
function calcBounds(containerEl) {
  if (!containerEl) return null;
  const cw = containerEl.clientWidth;
  const ch = containerEl.clientHeight;
  if (!cw || !ch) return null;

  const coverScale = Math.max(cw / IMG_W, ch / IMG_H);
  let rw = IMG_W * coverScale;
  let rh = IMG_H * coverScale;

  const cropFrac = rw > cw ? (rw - cw) / (2 * rw) : 0;
  if (cropFrac > MAX_CROP) {
    // Stop zooming in — limit rw so horizontal crop = MAX_CROP
    rw = cw / (1 - 2 * MAX_CROP);
    rh = rw * IMG_H / IMG_W;
  }

  return {
    ox: (cw - rw) / 2,   // negative = image overflows left/right (cover)
    oy: (ch - rh) / 2,   // positive = letterbox bars top/bottom (clamped)
    w:  rw,
    h:  rh,
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MapScreen({ pubStatuses, beers, currentPub, prevPub, onSelectPub, walking }) {
  const [walkFrame, setWalkFrame] = useState(false);
  const [bounce,    setBounce]    = useState(false);
  const [majdaPos,  setMajdaPos]  = useState(() => MAJDA_POS[currentPub] ?? MAJDA_POS[0]);
  const [imgBounds, setImgBounds] = useState(null);

  const containerRef = useRef(null);
  const rafRef       = useRef(null);

  const updateBounds = useCallback(() => {
    const b = calcBounds(containerRef.current);
    if (b) setImgBounds(prev =>
      prev && prev.ox === b.ox && prev.oy === b.oy && prev.w === b.w ? prev : b
    );
  }, []);

  // Compute on first layout (before browser paints → no flash)
  useLayoutEffect(() => { updateBounds(); }, [updateBounds]);

  // Recompute whenever container is resized (orientation change, etc.)
  useEffect(() => {
    const ro = new ResizeObserver(updateBounds);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateBounds]);

  // Walking animation
  useEffect(() => {
    if (walking) {
      const from = MAJDA_POS[prevPub]    ?? MAJDA_POS[0];
      const to   = MAJDA_POS[currentPub] ?? MAJDA_POS[prevPub];
      const start = Date.now(), dur = 1300;
      const step = () => {
        const t = Math.min((Date.now() - start) / dur, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        setMajdaPos({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e });
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      };
      setMajdaPos(from);
      rafRef.current = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafRef.current);
    } else {
      setMajdaPos(MAJDA_POS[currentPub] ?? MAJDA_POS[0]);
    }
  }, [walking, currentPub, prevPub]);

  useEffect(() => { const t = setInterval(() => setWalkFrame(f => !f), 220); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setBounce(b => !b),    420); return () => clearInterval(t); }, []);

  // Convert image-% position → absolute px inside the container
  function px(pct) {
    if (!imgBounds) return null;
    return {
      left: imgBounds.ox + (pct.x / 100) * imgBounds.w,
      top:  imgBounds.oy + (pct.y / 100) * imgBounds.h,
    };
  }

  const majPx       = px(majdaPos);
  const walkingRight = walking &&
    (MAJDA_POS[currentPub]?.x ?? 0) > (MAJDA_POS[prevPub]?.x ?? 0);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        position: 'relative', overflow: 'hidden',
        // Gradient fills any letterbox bars so they blend with the image edges.
        // Sky blue at top, grass green at bottom.
        background: 'linear-gradient(to bottom, #87CEEB 0%, #78C840 40%, #4A9820 100%)',
      }}
    >
      {/* ── Map image — sized and positioned by calcBounds ── */}
      {imgBounds && (
        <img
          src="/mapa.png"
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            left: imgBounds.ox,
            top:  imgBounds.oy,
            width:  imgBounds.w,
            height: imgBounds.h,
            display: 'block',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── Overlays — all pixel positions derived from imgBounds ── */}
      {imgBounds && PUBS.map((pub, i) => {
        const pubPx  = px(PUB_POSITIONS[i]);
        const isCurrent = pubStatuses[i] === 'current';

        return (
          <div key={pub.id}>
            {/* Clickable hit area */}
            <div
              onClick={() => isCurrent && onSelectPub(i)}
              style={{
                position: 'absolute',
                left: pubPx.left, top: pubPx.top,
                transform: 'translate(-50%, -50%)',
                width: 80, height: 80,
                cursor: isCurrent ? 'pointer' : 'default',
                zIndex: 10,
              }}
            />
          </div>
        );
      })}

      {/* "VSTOUPIT" hint */}
      {imgBounds && !walking && currentPub < PUBS.length && pubStatuses[currentPub] === 'current' && (() => {
        const pos = px(PUB_POSITIONS[currentPub]);
        return (
          <div style={{
            position: 'absolute',
            left: pos.left, top: pos.top + 44,
            transform: 'translateX(-50%)',
            color: '#F2C14E', fontSize: 6,
            fontFamily: "'Press Start 2P', monospace",
            opacity: bounce ? 1 : 0.12,
            whiteSpace: 'nowrap', zIndex: 15, pointerEvents: 'none',
            textShadow: '1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000',
          }}>VSTOUPIT</div>
        );
      })()}

      {/* Majda sprite */}
      {imgBounds && majPx && (
        <div style={{
          position: 'absolute',
          left: majPx.left, top: majPx.top,
          transform: 'translate(-50%, -100%)',
          zIndex: 20, pointerEvents: 'none',
        }}>
          <div style={{ transform: walkingRight ? 'scaleX(-1)' : undefined }}>
            <MajdaSprite
              pose={walking ? (walkFrame ? 'walk' : 'idle') : 'idle'}
              size={48}
            />
          </div>
        </div>
      )}

      {/* Beer counter — always pinned to outer container bottom-right */}
      <div style={{
        position: 'absolute', bottom: 14, right: 14,
        zIndex: 30, pointerEvents: 'none',
      }}>
        <BeerCounter beers={beers} />
      </div>
    </div>
  );
}
