export default function BeerCounter({ beers, total = 23 }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: '#1e1f2e',
      border: '3px solid #f2c14e',
      padding: '9px 16px',
      boxShadow: '3px 3px 0 rgba(0,0,0,0.5)',
    }}>
      <span style={{ fontSize: '20px' }}>🍺</span>
      <span style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '13px',
        color: '#f2c14e',
      }}>
        {beers}/{total}
      </span>
    </div>
  );
}
