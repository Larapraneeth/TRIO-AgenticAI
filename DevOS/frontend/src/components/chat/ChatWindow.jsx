import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import useStore from '../../store/useStore';

const SUGGESTIONS = [
  { icon: '🌐', text: 'Find AI internships on LinkedIn' },
  { icon: '💻', text: 'Generate FastAPI CRUD endpoints' },
  { icon: '🐙', text: 'Review a GitHub repository' },
  { icon: '🎤', text: 'Conduct a Software Engineer interview' },
  { icon: '🐛', text: 'Debug my Python error' },
  { icon: '📄', text: 'Analyze my resume for ATS' },
];

export default function ChatWindow({ onSuggestion }) {
  const { messages, isLoading, thinkingSteps } = useStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, thinkingSteps]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', gap: 28,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 15,
            background: '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: '#fff',
          }}>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '0.1em' }}>TRI</span>
          </div>
          <h1 style={{
            fontSize: 30, fontWeight: 700, marginBottom: 4,
            color: '#ececec', letterSpacing: '0.18em',
          }}>TRIO</h1>
          <p style={{ color: '#3a3a3a', fontSize: 11, letterSpacing: '0.2em', marginBottom: 10 }}>
            AI OPERATING SYSTEM
          </p>
          <p style={{ color: '#555', fontSize: 14 }}>
            How can I help you today?
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8, maxWidth: 520, width: '100%',
        }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.text}
              onClick={() => onSuggestion(s.text)}
              style={{
                padding: '13px 14px',
                background: '#0e0e0e',
                border: '0.5px solid #1a1a1a',
                borderRadius: 10,
                color: '#666', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'flex-start', gap: 9,
                transition: 'all 0.15s', fontSize: 13,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#131313'; e.currentTarget.style.borderColor = '#252525'; e.currentTarget.style.color = '#ececec'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0e0e0e'; e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#666'; }}
            >
              <span style={{ fontSize: 17, flexShrink: 0 }}>{s.icon}</span>
              <span style={{ lineHeight: 1.4 }}>{s.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px' }}>
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} />
        ))}
        {isLoading && <ThinkingIndicator steps={thinkingSteps} />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
