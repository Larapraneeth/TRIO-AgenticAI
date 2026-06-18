import React from 'react';

export default function VoiceButton({ isRecording, isTranscribing, onStart, onStop }) {
  const handleClick = () => {
    if (isRecording) onStop();
    else onStart();
  };

  return (
    <button
      onClick={handleClick}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
      style={{
        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${isRecording ? 'var(--red)' : 'var(--border)'}`,
        background: isRecording ? 'rgba(239,68,68,0.1)' : 'var(--bg-tertiary)',
        color: isRecording ? 'var(--red)' : 'var(--text-secondary)',
        cursor: 'pointer', fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: isRecording ? '0 0 16px rgba(239,68,68,0.3)' : 'none',
      }}
    >
      {isTranscribing ? (
        <div style={{
          width: 16, height: 16, border: '2px solid var(--accent-light)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      ) : isRecording ? '⏹' : '🎤'}
    </button>
  );
}
