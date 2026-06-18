import React from 'react';

const STEPS_DISPLAY = [
  'Thinking...',
  'Analyzing request...',
  'Selecting tools...',
  'Executing actions...',
];

export default function ThinkingIndicator({ steps = [] }) {
  const display = steps.length > 0 ? steps : STEPS_DISPLAY.slice(0, 1);
  const latest = display[display.length - 1];

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: '#7c3aed',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color: '#fff', flexShrink: 0, marginTop: 2,
      }}>⚡</div>

      <div style={{ paddingTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#7c3aed',
                animation: `bounce 1.2s infinite ${i * 0.2}s`,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#555' }}>{latest}</span>
        </div>

        {steps.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {steps.slice(0, -1).map((s, i) => (
              <div key={i} style={{ fontSize: 11, color: '#3a3a3a', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
