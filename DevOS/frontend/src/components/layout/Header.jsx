import React, { useEffect } from 'react';
import { getSystemInfo } from '../../services/api';
import useStore from '../../store/useStore';

export default function Header({ onVoiceOpen }) {
  const {
    toggleSidebar, voiceEnabled, toggleVoice,
    systemInfo, setSystemInfo, activeConversationTitle,
  } = useStore();

  useEffect(() => {
    getSystemInfo().then(setSystemInfo).catch(() => {});
  }, []);

  const ollamaOnline = systemInfo?.ollama === 'online';

  const handleVoiceClick = () => {
    toggleVoice();
    if (!voiceEnabled) onVoiceOpen();
  };

  return (
    <header style={{
      height: 50,
      background: '#0d0d0d',
      borderBottom: '0.5px solid #1a1a1a',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      flexShrink: 0,
    }}>
      <button
        onClick={toggleSidebar}
        style={{
          background: 'none', border: 'none',
          color: '#444', cursor: 'pointer', fontSize: 17,
          padding: '4px 6px', borderRadius: 6,
          display: 'flex', alignItems: 'center',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#888'}
        onMouseLeave={e => e.currentTarget.style.color = '#444'}
        aria-label="Toggle sidebar"
      >☰</button>

      <span style={{
        fontSize: 13, color: '#555',
        flex: 1,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {activeConversationTitle === 'New Chat' ? '' : activeConversationTitle}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: ollamaOnline ? '#10b981' : '#ef4444',
          }} />
          <span style={{ fontSize: 11, color: '#444' }}>
            {ollamaOnline ? systemInfo?.active_model : 'Offline'}
          </span>
        </div>

        <button
          onClick={handleVoiceClick}
          style={{
            padding: '5px 14px',
            background: voiceEnabled ? 'rgba(124,58,237,0.15)' : 'transparent',
            border: `0.5px solid ${voiceEnabled ? '#7c3aed' : '#2a2a2a'}`,
            borderRadius: 20,
            color: voiceEnabled ? '#8b5cf6' : '#555',
            cursor: 'pointer',
            fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 7,
            letterSpacing: '0.03em',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!voiceEnabled) { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = '#888'; } }}
          onMouseLeave={e => { if (!voiceEnabled) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#555'; } }}
        >
          <span style={{ fontSize: 13 }}>🎙</span>
          {voiceEnabled ? 'TRIO Active' : 'Activate TRIO'}
        </button>
      </div>
    </header>
  );
}
