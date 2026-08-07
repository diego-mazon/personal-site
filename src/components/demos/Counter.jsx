import { useState } from 'react';

export default function Counter({ start = 0 }) {
  const [count, setCount] = useState(start);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <button onClick={() => setCount((c) => c - 1)} aria-label="Decrement">
        −
      </button>
      <span style={{ minWidth: '2ch', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
        {count}
      </span>
      <button onClick={() => setCount((c) => c + 1)} aria-label="Increment">
        +
      </button>
      <button onClick={() => setCount(start)} style={{ marginLeft: '0.5rem' }}>
        Reset
      </button>
    </div>
  );
}
