import { useState } from 'react';
import Scanlines from './components/Scanlines.jsx';
import IntroScreen from './screens/IntroScreen.jsx';
import MapScreen from './screens/MapScreen.jsx';
import PubScreen from './screens/PubScreen.jsx';
import FinaleScreen from './screens/FinaleScreen.jsx';
import { PUBS } from './gameData.js';

function initPubStatuses() {
  return PUBS.map((_, i) => (i === 0 ? 'current' : 'locked'));
}

export default function App() {
  const [screen, setScreen] = useState('intro');
  const [beers, setBeers] = useState(0);
  const [pubStatuses, setPubStatuses] = useState(initPubStatuses);
  const [currentPub, setCurrentPub] = useState(0);
  const [prevPub, setPrevPub] = useState(0);
  const [activePub, setActivePub] = useState(null);
  const [walking, setWalking] = useState(false);

  function handleStart() {
    setScreen('map');
  }

  function handleSelectPub(index) {
    setActivePub(index);
    setScreen('pub');
  }

  function handlePubComplete() {
    const reward = PUBS[activePub].reward;
    const newBeers = beers + reward;
    setBeers(newBeers);

    const newStatuses = [...pubStatuses];
    newStatuses[activePub] = 'done';
    const nextIndex = activePub + 1;

    if (nextIndex < PUBS.length) {
      newStatuses[nextIndex] = 'current';
      setCurrentPub(nextIndex);
    }
    setPubStatuses(newStatuses);
    setActivePub(null);

    if (newBeers >= 23) {
      // Poslední hospoda - rovnou na finále, bez čekání na mapu
      setScreen('finale');
    } else {
      // Jinak zpět na mapu s animací chůze
      setPrevPub(activePub);
      setWalking(true);
      setScreen('map');
      setTimeout(() => setWalking(false), 1400);
    }
  }

  function handleRestart() {
    setBeers(0);
    setPubStatuses(initPubStatuses());
    setCurrentPub(0);
    setPrevPub(0);
    setActivePub(null);
    setWalking(false);
    setScreen('intro');
  }

  const style = {
    width: '100%',
    height: '100%',
    maxWidth: '480px',
    maxHeight: '854px',
    position: 'relative',
    overflow: 'hidden',
    background: '#11121f',
  };

  return (
    <div style={style}>
      <Scanlines />
      {screen === 'intro' && <IntroScreen onStart={handleStart} />}
      {screen === 'map' && (
        <MapScreen
          pubStatuses={pubStatuses}
          beers={beers}
          currentPub={currentPub}
          prevPub={prevPub}
          onSelectPub={handleSelectPub}
          walking={walking}
        />
      )}
      {screen === 'pub' && activePub !== null && (
        <PubScreen
          pubIndex={activePub}
          beers={beers}
          onComplete={handlePubComplete}
        />
      )}
      {screen === 'finale' && <FinaleScreen onRestart={handleRestart} />}
    </div>
  );
}
