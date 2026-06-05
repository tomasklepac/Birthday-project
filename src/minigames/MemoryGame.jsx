import { useState, useEffect, useCallback } from 'react';

const CARD_IMAGES = [
  '/tacky/gambinus.png',
  '/tacky/kozel.png',
  '/tacky/pilsner.png',
  '/tacky/proud.png',
];

const FALLBACK_COLORS = ['#c4850f', '#5fa85a', '#4a78c0', '#e0524a'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function CoasterBack() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#c8a050',
      border: '3px solid #a07830',
      boxShadow: '3px 3px 0 rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }} />
      <div style={{ position: 'absolute', inset: '5px', border: '2px solid #8a6418', boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', inset: '9px', border: '1px solid #a07830', boxSizing: 'border-box' }} />
      <svg viewBox="0 0 28 28" width="32" height="32" shapeRendering="crispEdges" style={{ position: 'relative', zIndex: 1 }}>
        <rect x="4" y="8" width="16" height="16" fill="#d4880a" />
        <rect x="3" y="8" width="1" height="16" fill="#a86010" />
        <rect x="20" y="8" width="1" height="16" fill="#a86010" />
        <rect x="4" y="24" width="16" height="2" fill="#8a5008" />
        <rect x="4" y="6" width="16" height="3" fill="#f8f0dd" />
        <rect x="5" y="4" width="4" height="3" fill="#f8f0dd" />
        <rect x="10" y="3" width="5" height="4" fill="#f8f0dd" />
        <rect x="16" y="5" width="3" height="3" fill="#f8f0dd" />
        <rect x="5" y="10" width="2" height="12" fill="#f2c14e" opacity="0.35" />
        <rect x="21" y="11" width="5" height="2" fill="#a86010" />
        <rect x="24" y="13" width="2" height="7" fill="#a86010" />
        <rect x="21" y="20" width="5" height="2" fill="#a86010" />
        <rect x="9" y="15" width="2" height="2" fill="#f2c14e" opacity="0.5" />
        <rect x="14" y="18" width="2" height="2" fill="#f2c14e" opacity="0.4" />
      </svg>
    </div>
  );
}

function Card({ card, isFlipped, isMatched, onClick }) {
  return (
    <div
      onClick={() => !isFlipped && !isMatched && onClick(card.id)}
      style={{
        width: '70px',
        height: '70px',
        cursor: isFlipped || isMatched ? 'default' : 'pointer',
        perspective: '300px',
        WebkitPerspective: '300px',
        flexShrink: 0,
      }}
    >
      {/* Flip wrapper - 3D */}
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        WebkitTransformStyle: 'preserve-3d',
        transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
        WebkitTransition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: (isFlipped || isMatched) ? 'rotateY(180deg)' : 'rotateY(0deg)',
        WebkitTransform: (isFlipped || isMatched) ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* RUB - tácek (viditelný dokud není otočený) */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}>
          <CoasterBack />
        </div>

        {/* LÍC - logo (viditelný po otočení) */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: '#f5ede0',
            border: `3px solid ${isMatched ? '#5fa85a' : '#c4850f'}`,
            boxShadow: isMatched
              ? '0 0 10px #5fa85a55, 3px 3px 0 rgba(0,0,0,0.4)'
              : '3px 3px 0 rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: '3px',
              border: '1px solid #d4a860',
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }} />
            {card.imgOk ? (
              <img
                src={card.src}
                alt=""
                style={{
                  width: '80%',
                  height: '80%',
                  objectFit: 'contain',
                  imageRendering: 'auto',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: '42px', height: '42px',
                background: FALLBACK_COLORS[card.pairIndex],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px',
              }}>🍺</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MemoryGame({ onComplete }) {
  const [cards, setCards] = useState(() => {
    const pairs = [...CARD_IMAGES, ...CARD_IMAGES].map((src, i) => ({
      id: i, src, pairIndex: i % 4, imgOk: true,
    }));
    return shuffle(pairs);
  });

  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);

  const handleCardError = useCallback((cardId) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, imgOk: false } : c));
  }, []);

  useEffect(() => {
    cards.forEach(card => {
      const img = new Image();
      img.onerror = () => handleCardError(card.id);
      img.src = card.src;
    });
  }, []);

  const handleFlip = useCallback((id) => {
    if (locked || flipped.length >= 2) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setMoves(m => m + 1);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid));
      if (a.pairIndex === b.pairIndex) {
        const newMatched = [...matched, a.pairIndex];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === 4) {
          setTimeout(() => onComplete(moves < 8 ? 'fast' : 'done'), 600);
        }
      } else {
        setLocked(true);
        setTimeout(() => { setFlipped([]); setLocked(false); }, 900);
      }
    }
  }, [locked, flipped, matched, cards, moves, onComplete]);

  const isFlipped = (card) => flipped.includes(card.id);
  const isMatched = (card) => matched.includes(card.pairIndex);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      padding: '8px',
    }}>
      {/* Hint */}
      <div style={{ color: '#c4850f', fontSize: '20px', textAlign: 'center' }}>
        Najdi 4 páry pivních tácků
      </div>

      {/* Table surface */}
      <div style={{
        background: '#3d1f0d',
        border: '3px solid #6e4327',
        borderRadius: '2px',
        padding: '14px 12px',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.6)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 70px)',
          gap: '8px',
        }}>
          {cards.map(card => (
            <Card
              key={card.id}
              card={card}
              isFlipped={isFlipped(card)}
              isMatched={isMatched(card)}
              onClick={handleFlip}
            />
          ))}
        </div>
      </div>

      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        color: '#c4850f',
        fontSize: '7px',
        display: 'flex',
        gap: '20px',
      }}>
        <span>PÁRY: {matched.length}/4</span>
        <span>TAHY: {Math.floor(moves / 2)}</span>
      </div>
    </div>
  );
}
