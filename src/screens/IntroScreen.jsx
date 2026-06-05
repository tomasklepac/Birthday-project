import { useState, useEffect } from 'react';
import PixelButton from '../components/PixelButton.jsx';
import MajdaSprite from '../components/MajdaSprite.jsx';

const PS2 = "'Press Start 2P', monospace";

// Dřevěná stěna: střídavá prkna + spáry + odlesky + teplá záře uprostřed
const WOOD_BG = [
  'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(242,193,78,0.22) 0%, transparent 70%)',
  'repeating-linear-gradient(180deg, transparent 0px, transparent 22px, rgba(0,0,0,0.18) 22px, rgba(0,0,0,0.18) 24px)',
  'repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 24px)',
  'repeating-linear-gradient(180deg, #6e4422 0px, #6e4422 24px, #7d4e28 24px, #7d4e28 48px)',
].join(', ');

export default function IntroScreen({ onStart }) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: WOOD_BG,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '32px 20px',
    }}>
      <div style={{ color: '#e8c98a', fontSize: '7px', textAlign: 'center', letterSpacing: '1px', fontFamily: PS2 }}>
        PRO MAJDU K 23. NAROZENINÁM
      </div>

      <div style={{
        fontFamily: PS2,
        color: '#f2c14e',
        fontSize: 'clamp(18px, 6vw, 32px)',
        textAlign: 'center',
        textShadow: '2px 2px 0 #000',
        lineHeight: 1.4,
        letterSpacing: '2px',
      }}>
        MAJDA<br />A 23 PIV
      </div>

      <MajdaSprite pose="cheer" size={96} />

      <div style={{
        color: '#f4ecda',
        fontSize: '22px',
        textAlign: 'center',
        maxWidth: '300px',
        lineHeight: 1.4,
      }}>
        Projdi Plzeň, splň úkoly ve čtyřech hospodách a nasbírej 23 piv k narozeninám!
      </div>

      <div style={{ opacity: blink ? 1 : 0, transition: 'none' }}>
        <PixelButton onClick={onStart} color="#f2c14e" textColor="#11121f">
          STISKNI START
        </PixelButton>
      </div>

      <div style={{ color: '#c4850f', fontSize: '6px', textAlign: 'center', fontFamily: PS2 }}>
        PLZEŇ 2026
      </div>
    </div>
  );
}
