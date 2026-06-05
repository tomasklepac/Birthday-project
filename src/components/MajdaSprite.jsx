export default function MajdaSprite({ pose = 'idle', size = 48, style = {} }) {
  const scale = size / 16;

  const sprites = {
    idle: (
      <svg viewBox="0 0 16 22" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="8" height="2" fill="#edc25c"/>
        <rect x="7" y="2" width="2" height="1" fill="#d9a838"/>
        <rect x="3" y="4" width="10" height="2" fill="#edc25c"/>
        <rect x="3" y="6" width="2" height="6" fill="#edc25c"/>
        <rect x="11" y="6" width="2" height="6" fill="#edc25c"/>
        <rect x="3" y="6" width="1" height="6" fill="#e8b84a"/>
        <rect x="12" y="6" width="1" height="6" fill="#e8b84a"/>
        <rect x="5" y="6" width="6" height="5" fill="#f4cda0"/>
        <rect x="6" y="8" width="1" height="1" fill="#3a2a1a"/>
        <rect x="9" y="8" width="1" height="1" fill="#3a2a1a"/>
        <rect x="7" y="10" width="2" height="1" fill="#c46b5a"/>
        <rect x="4" y="11" width="8" height="6" fill="#2b2b38"/>
        <rect x="7" y="11" width="1" height="6" fill="#3f3f50"/>
        <rect x="3" y="12" width="1" height="4" fill="#24242f"/>
        <rect x="12" y="12" width="1" height="4" fill="#24242f"/>
        <rect x="5" y="17" width="2" height="4" fill="#1a1a24"/>
        <rect x="9" y="17" width="2" height="4" fill="#1a1a24"/>
      </svg>
    ),
    walk: (
      <svg viewBox="0 0 16 22" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="8" height="2" fill="#edc25c"/>
        <rect x="7" y="2" width="2" height="1" fill="#d9a838"/>
        <rect x="3" y="4" width="10" height="2" fill="#edc25c"/>
        <rect x="3" y="6" width="2" height="6" fill="#edc25c"/>
        <rect x="11" y="6" width="2" height="6" fill="#edc25c"/>
        <rect x="3" y="6" width="1" height="6" fill="#e8b84a"/>
        <rect x="12" y="6" width="1" height="6" fill="#e8b84a"/>
        <rect x="5" y="6" width="6" height="5" fill="#f4cda0"/>
        <rect x="6" y="8" width="1" height="1" fill="#3a2a1a"/>
        <rect x="9" y="8" width="1" height="1" fill="#3a2a1a"/>
        <rect x="7" y="10" width="2" height="1" fill="#c46b5a"/>
        <rect x="4" y="11" width="8" height="6" fill="#2b2b38"/>
        <rect x="7" y="11" width="1" height="6" fill="#3f3f50"/>
        <rect x="3" y="12" width="1" height="4" fill="#24242f"/>
        <rect x="12" y="13" width="1" height="3" fill="#24242f"/>
        <rect x="4" y="17" width="2" height="4" fill="#1a1a24"/>
        <rect x="10" y="17" width="2" height="3" fill="#1a1a24"/>
      </svg>
    ),
    cheer: (
      <svg viewBox="0 0 16 22" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="8" height="2" fill="#edc25c"/>
        <rect x="7" y="2" width="2" height="1" fill="#d9a838"/>
        <rect x="3" y="4" width="10" height="2" fill="#edc25c"/>
        <rect x="3" y="6" width="2" height="6" fill="#edc25c"/>
        <rect x="11" y="6" width="2" height="6" fill="#edc25c"/>
        <rect x="3" y="6" width="1" height="6" fill="#e8b84a"/>
        <rect x="12" y="6" width="1" height="6" fill="#e8b84a"/>
        <rect x="5" y="6" width="6" height="5" fill="#f4cda0"/>
        <rect x="6" y="8" width="1" height="1" fill="#3a2a1a"/>
        <rect x="9" y="8" width="1" height="1" fill="#3a2a1a"/>
        <rect x="6" y="10" width="4" height="1" fill="#c46b5a"/>
        <rect x="7" y="10" width="2" height="1" fill="#fff"/>
        <rect x="4" y="11" width="8" height="6" fill="#2b2b38"/>
        <rect x="7" y="11" width="1" height="6" fill="#3f3f50"/>
        <rect x="12" y="8" width="1" height="4" fill="#24242f"/>
        <rect x="3" y="12" width="1" height="4" fill="#24242f"/>
        <rect x="11" y="4" width="4" height="4" fill="#f2c14e"/>
        <rect x="11" y="4" width="4" height="1" fill="#fdf3d0"/>
        <rect x="5" y="17" width="2" height="4" fill="#1a1a24"/>
        <rect x="9" y="17" width="2" height="4" fill="#1a1a24"/>
      </svg>
    ),
  };

  return (
    <div style={{
      width: size,
      height: size * (22 / 16),
      imageRendering: 'pixelated',
      ...style,
    }}>
      {sprites[pose]}
    </div>
  );
}
