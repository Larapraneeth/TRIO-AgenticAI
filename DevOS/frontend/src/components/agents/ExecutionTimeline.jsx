import React, { useState } from 'react';
import useStore from '../../store/useStore';

const STEP_ICONS = {
  'Intent detected': '🎯',
  'Response ready': '✅',
};

function getStepIcon(step) {
  if (STEP_ICONS[step]) return STEP_ICONS[step];
  if (step.toLowerCase().includes('routing')) return '⚡';
  if (step.toLowerCase().includes('running')) return '⟳';
  if (step.toLowerCase().includes('completed')) return '✓';
  if (step.toLowerCase().includes('combining')) return '🔗';
  if (step.toLowerCase().includes('failed')) return '✗';
  return '·';
}

function getStepColor(step) {
  if (step.toLowerCase().includes('failed')) return '#ef4444';
  if (step.toLowerCase().includes('completed') || step === 'Response ready') return '#10b981';
  if (step.toLowerCase().includes('running')) return '#8b5cf6';
  return '#555';
}

export default function ExecutionTimeline({ steps = [], agents = [], intent = '', isLive = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'none', border: 'none',
          color: '#555', cursor: 'pointer',
          fontSize: 11, padding: '4px 0',
          display: 'flex', alignItems: 'center', gap: 5,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#888'}
        onMouseLeave={e => e.currentTarget.style.color = '#555'}
      >
        <span style={{
          display: 'inline-block',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
          fontSize: 10,
        }}>▶</span>
        {isLive ? 'Processing...' : `${agents.join(', ')} · ${steps.length} steps`}
      </button>

      {expanded && (
        <div style={{
          marginTop: 6,
          padding: '10px 12px',
          background: '#111',
          border: '1px solid #1e1e1e',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          {intent && (
            <div style={{ fontSize: 11, color: '#555', marginBottom: 4, fontStyle: 'italic' }}>
              Intent: {intent}
            </div>
          )}
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 12,
                color: getStepColor(step),
                animation: isLive && i === steps.length - 1 && step.toLowerCase().includes('running')
                  ? 'spin 1s linear infinite' : 'none',
                display: 'inline-block',
                width: 14, textAlign: 'center',
              }}>
                {getStepIcon(step)}
              </span>
              <span style={{
                fontSize: 12,
                color: getStepColor(step),
              }}>{step}</span>
            </div>
          ))}
          {agents.length > 0 && (
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #1e1e1e', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {agents.map(a => (
                <span key={a} style={{
                  padding: '2px 8px', borderRadius: 10,
                  fontSize: 10, fontWeight: 500,
                  background: 'rgba(124,58,237,0.12)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}>{a}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
