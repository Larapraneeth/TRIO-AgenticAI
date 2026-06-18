import React from 'react';
import useStore from '../../store/useStore';

const STATUS_COLOR = {
  running: 'var(--accent-light)',
  done: 'var(--green)',
  error: 'var(--red)',
};

const STATUS_ICON = {
  running: '⟳',
  done: '✓',
  error: '✗',
};

export default function AgentStatusPanel() {
  const { agentStatuses, isLoading } = useStore();

  if (!isLoading && agentStatuses.length === 0) return null;

  return (
    <div style={{
      maxWidth: 780, margin: '0 auto', padding: '0 20px 8px',
    }}>
      <div style={{
        background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)', padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>AGENTS</span>
        {agentStatuses.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              fontSize: 13, color: STATUS_COLOR[s.status] || 'var(--text-secondary)',
              animation: s.status === 'running' ? 'spin 1s linear infinite' : 'none',
              display: 'inline-block',
            }}>{STATUS_ICON[s.status]}</span>
            <span style={{ fontSize: 12, color: STATUS_COLOR[s.status] || 'var(--text-secondary)', fontWeight: 500 }}>
              {s.agent}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
