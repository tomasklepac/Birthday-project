import { useState } from 'react';
import PourGame from '../minigames/PourGame.jsx';
import MemoryGame from '../minigames/MemoryGame.jsx';
import SlideGame from '../minigames/SlideGame.jsx';
import CatchGame from '../minigames/CatchGame.jsx';
import PixelButton from '../components/PixelButton.jsx';
import MajdaSprite from '../components/MajdaSprite.jsx';
import BeerCounter from '../components/BeerCounter.jsx';
import { PUBS } from '../gameData.js';

const PS2 = "'Press Start 2P', monospace";

const GAME_COMPONENTS = {
  pour: PourGame,
  memory: MemoryGame,
  slide: SlideGame,
  catch: CatchGame,
};

// Pixel-art pub scene backgrounds with people
function PubBackground({ pubId }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 0,
    }}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        shapeRendering="crispEdges"
      >
        {/* Warm ambient light gradient background */}
        <defs>
          <linearGradient id="pubFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1008" />
            <stop offset="100%" stopColor="#150c04" />
          </linearGradient>
          <radialGradient id="lampGlow" cx="50%" cy="0%" r="60%">
            <stop offset="0%" stopColor="#f2c14e" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f2c14e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ceiling */}
        <rect width="100" height="14" fill="#1a0e06" />
        {/* Ceiling beams */}
        <rect x="0" y="12" width="100" height="2" fill="#2a1a0a" />
        {[15, 40, 65, 88].map((x, i) => (
          <rect key={`beam-${i}`} x={x} y="0" width="4" height="14" fill="#2a1a0a" />
        ))}

        {/* Hanging lamps */}
        {[20, 50, 80].map((lx, i) => (
          <g key={`lamp-${i}`}>
            <rect x={lx} y="0" width="1" height="8" fill="#3a2a1a" />
            <rect x={lx - 3} y="8" width="7" height="4" fill="#6a4a20" />
            <rect x={lx - 2} y="9" width="5" height="2" fill="#f2c14e" opacity="0.95" />
            {/* Lamp glow */}
            <ellipse cx={lx} cy="15" rx="18" ry="10" fill="#f2c14e" opacity="0.08" />
          </g>
        ))}

        {/* Ambient ceiling glow */}
        <rect x="0" y="0" width="100" height="30" fill="url(#lampGlow)" />

        {/* Walls - dark wood paneling */}
        <rect x="0" y="14" width="100" height="56" fill="#1c1006" />
        {/* Wall panels */}
        {[0, 25, 50, 75].map((x, i) => (
          <rect key={`panel-${i}`} x={x + 0.5} y="14" width="24" height="56" fill={i % 2 === 0 ? '#1c1006' : '#1a0f06'} stroke="#120a04" strokeWidth="0.5" />
        ))}
        {/* Panel molding */}
        {[0, 25, 50, 75].map((x, i) => (
          <rect key={`mold-${i}`} x={x + 2} y="17" width="20" height="50" fill="none" stroke="#2a1a08" strokeWidth="0.8" />
        ))}

        {/* Picture frames on wall */}
        <rect x="5" y="20" width="14" height="10" fill="#1a0a04" stroke="#5a3a18" strokeWidth="1.5" />
        <rect x="6" y="21" width="12" height="8" fill="#0a1a28" />
        {/* Picture content - simple pixel art */}
        <rect x="7" y="22" width="4" height="6" fill="#204080" opacity="0.8" />
        <rect x="12" y="24" width="5" height="4" fill="#284820" opacity="0.8" />

        <rect x="58" y="18" width="12" height="9" fill="#1a0a04" stroke="#5a3a18" strokeWidth="1.5" />
        <rect x="59" y="19" width="10" height="7" fill="#100a20" />
        <rect x="60" y="20" width="8" height="5" fill="#602020" opacity="0.6" />

        {/* Bar mirror / chalkboard */}
        <rect x="2" y="35" width="30" height="18" fill="#0a0804" stroke="#5a3a18" strokeWidth="1.5" />
        <rect x="3" y="36" width="28" height="16" fill="#0e1a0a" />
        {/* Chalkboard text lines */}
        <rect x="5" y="38" width="14" height="1.5" fill="#a0c878" opacity="0.7" />
        <rect x="5" y="41" width="10" height="1.5" fill="#a0c878" opacity="0.5" />
        <rect x="5" y="44" width="12" height="1.5" fill="#a0c878" opacity="0.4" />
        <rect x="5" y="47" width="8" height="1.5" fill="#a0c878" opacity="0.5" />
        {/* Beer glass doodle */}
        <rect x="22" y="38" width="6" height="10" fill="#c4850f" opacity="0.5" />
        <rect x="22" y="37" width="6" height="2" fill="#f8f0dd" opacity="0.6" />

        {/* Bottle shelf */}
        <rect x="68" y="22" width="30" height="1.5" fill="#5a3a18" />
        <rect x="68" y="32" width="30" height="1.5" fill="#5a3a18" />
        {/* Bottles on shelf */}
        {[70, 74, 78, 82, 86, 90, 94].map((bx, i) => (
          <g key={`bot1-${i}`}>
            <rect x={bx} y="15" width="2.5" height="6.5" fill={i % 3 === 0 ? '#a04020' : i % 3 === 1 ? '#204820' : '#201840'} />
            <rect x={bx + 0.5} y="14" width="1.5" height="1.5" fill="#3a3a3a" />
          </g>
        ))}
        {[70, 74, 78, 82, 86, 90, 94].map((bx, i) => (
          <g key={`bot2-${i}`}>
            <rect x={bx} y="24.5" width="2.5" height="7" fill={i % 3 === 2 ? '#a04020' : i % 3 === 0 ? '#204820' : '#604010'} />
            <rect x={bx + 0.5} y="23.5" width="1.5" height="1.5" fill="#3a3a3a" />
          </g>
        ))}

        {/* Beer taps on bar */}
        {[38, 44, 50].map((tx, i) => (
          <g key={`tap-${i}`}>
            <rect x={tx} y="50" width="2" height="8" fill="#888898" />
            <rect x={tx - 1} y="50" width="4" height="2" fill="#a0a0b0" />
            <rect x={tx} y="56" width="2" height="1.5" fill="#c8c8d8" />
          </g>
        ))}

        {/* Bar counter */}
        <rect x="0" y="70" width="100" height="4" fill="#6e4327" />
        <rect x="0" y="69" width="100" height="1.5" fill="#8a5a38" />
        <rect x="0" y="74" width="100" height="2" fill="#4a2a10" />

        {/* === PEOPLE (silhouettes) sitting at bar === */}
        {/* Person 1 - left */}
        <g transform="translate(8, 52)">
          <rect x="1" y="0" width="6" height="6" fill="#2a1a10" /> {/* Head */}
          <rect x="0" y="6" width="8" height="8" fill="#3a2820" /> {/* Body */}
          <rect x="2" y="14" width="2" height="4" fill="#2a1a10" /> {/* Left arm */}
          <rect x="6" y="14" width="2" height="4" fill="#2a1a10" /> {/* Right arm */}
          <rect x="1" y="1" width="6" height="2" fill="#3a2010" /> {/* Hair */}
          {/* Beer glass on bar in front of person */}
          <rect x="2" y="17" width="4" height="5" fill="#c4850f" opacity="0.7" />
          <rect x="2" y="16" width="4" height="2" fill="#f8f0dd" opacity="0.8" />
        </g>

        {/* Person 2 - center, different pose */}
        <g transform="translate(38, 50)">
          <rect x="1" y="0" width="6" height="6" fill="#4a2810" /> {/* Head - different skin */}
          <rect x="0" y="6" width="8" height="9" fill="#1a3050" /> {/* Body - blue shirt */}
          <rect x="2" y="15" width="2" height="4" fill="#3a2820" />
          <rect x="5" y="13" width="2" height="6" fill="#3a2820" /> {/* Arm raised */}
          <rect x="1" y="0" width="6" height="2" fill="#1a0a04" />
        </g>

        {/* Person 3 - right */}
        <g transform="translate(72, 53)">
          <rect x="1" y="0" width="6" height="6" fill="#3a2010" />
          <rect x="0" y="6" width="8" height="8" fill="#502020" /> {/* Red top */}
          <rect x="2" y="14" width="2" height="4" fill="#3a2010" />
          <rect x="5" y="14" width="2" height="4" fill="#3a2010" />
          <rect x="0" y="0" width="8" height="2" fill="#6a4820" /> {/* Long hair */}
          <rect x="0" y="2" width="2" height="4" fill="#6a4820" />
          {/* Beer glass */}
          <rect x="2" y="17" width="4" height="5" fill="#c4850f" opacity="0.7" />
          <rect x="2" y="16" width="4" height="2" fill="#f8f0dd" opacity="0.8" />
        </g>

        {/* Bar stools */}
        {[10, 25, 40, 55, 70, 85].map((sx, i) => (
          <g key={`stool-${i}`}>
            {/* Stool seat */}
            <rect x={sx - 2} y="74" width="6" height="1.5" fill="#3a2010" />
            {/* Stool legs */}
            <rect x={sx - 1} y="75.5" width="1" height="6" fill="#2a1808" />
            <rect x={sx + 2} y="75.5" width="1" height="6" fill="#2a1808" />
            {/* Footrest */}
            <rect x={sx - 1} y="79" width="4" height="0.8" fill="#2a1808" />
          </g>
        ))}

        {/* Floor */}
        <rect x="0" y="82" width="100" height="18" fill="url(#pubFloor)" />
        {/* Floor planks */}
        {[0, 16, 32, 48, 64, 80].map((fx, i) => (
          <rect key={`plank-${i}`} x={fx} y="82" width="15.5" height="18" fill={i % 2 === 0 ? '#161008' : '#130e06'} stroke="#0e0a04" strokeWidth="0.4" />
        ))}

        {/* Warm glow on floor near bar */}
        <rect x="0" y="76" width="100" height="8" fill="#f2c14e" opacity="0.04" />
      </svg>
    </div>
  );
}

export default function PubScreen({ pubIndex, beers, onComplete }) {
  const pub = PUBS[pubIndex];
  const [phase, setPhase] = useState('task');
  const [praise, setPraise] = useState('');

  function handleGameComplete(rating) {
    let msg = '';
    const p = pub.praises;
    if (pub.game === 'pour') msg = rating === 'good' ? p.good : rating === 'over' ? p.over : p.ok;
    else if (pub.game === 'memory') msg = rating === 'fast' ? p.fast : p.done;
    else if (pub.game === 'slide') msg = rating === 'perfect' ? p.perfect : rating === 'weak' ? p.weak : p.strong;
    else if (pub.game === 'catch') msg = p.full;
    setPraise(msg);
    setPhase('praise');
  }

  const GameComponent = GAME_COMPONENTS[pub.game];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#130e06',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Pub background scene */}
      {phase !== 'game' && <PubBackground pubId={pub.id} />}

      {/* Header */}
      <div style={{
        background: '#18100a',
        borderBottom: '3px solid #c4850f',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ fontFamily: PS2, color: '#f2c14e', fontSize: '12px' }}>{pub.name}</div>
        <BeerCounter beers={beers} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 8px',
        gap: '16px',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 1,
      }}>
        {phase === 'task' && (
          <>
            <MajdaSprite pose="idle" size={52} />
            <div style={{
              background: 'rgba(15,8,2,0.93)',
              border: '3px solid #6e4327',
              padding: '14px',
              maxWidth: '310px',
              color: '#e8e6d0',
              fontSize: '22px',
              lineHeight: 1.4,
              textAlign: 'center',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.7), 0 0 16px rgba(242,193,78,0.1)',
            }}>
              {pub.task}
            </div>
            <PixelButton onClick={() => setPhase('game')} color="#f2c14e" textColor="#11121f">
              JDEME NA TO!
            </PixelButton>
          </>
        )}

        {phase === 'game' && (
          <GameComponent onComplete={handleGameComplete} />
        )}

        {phase === 'praise' && (
          <>
            <MajdaSprite pose="cheer" size={56} />
            <div style={{
              background: 'rgba(5,15,5,0.93)',
              border: '3px solid #5fa85a',
              padding: '14px',
              maxWidth: '300px',
              color: '#e8e6d0',
              fontSize: '22px',
              lineHeight: 1.4,
              textAlign: 'center',
              boxShadow: '0 0 16px rgba(95,168,90,0.4), 3px 3px 0 rgba(0,0,0,0.7)',
            }}>
              {praise} 🍺
            </div>
            <div style={{
              color: '#f2c14e',
              fontSize: '22px',
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: '300px',
            }}>
              {pub.transition}
            </div>
            <PixelButton onClick={onComplete} color="#5fa85a" textColor="#fff">
              POKRAČOVAT
            </PixelButton>
          </>
        )}
      </div>
    </div>
  );
}
