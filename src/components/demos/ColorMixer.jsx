import { useState } from 'react';

function toHex(r, g, b) {
  const clamp = (n) => Math.max(0, Math.min(255, n));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
  );
}

export default function ColorMixer() {
  const [r, setR] = useState(125);
  const [g, setG] = useState(180);
  const [b, setB] = useState(220);

  const hex = toHex(r, g, b);

  const sliders = [
    { label: 'R', value: r, set: setR },
    { label: 'G', value: g, set: setG },
    { label: 'B', value: b, set: setB },
  ];

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '0.5rem',
          background: hex,
          border: '1px solid rgba(128,128,128,0.4)',
          flexShrink: 0,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 220 }}>
        {sliders.map(({ label, value, set }) => (
          <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ width: '1ch' }}>{label}</span>
            <input
              type="range"
              min={0}
              max={255}
              value={value}
              onChange={(e) => set(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ width: '3ch', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
          </label>
        ))}
        <code style={{ fontSize: '0.875rem' }}>{hex}</code>
      </div>
    </div>
  );
}
