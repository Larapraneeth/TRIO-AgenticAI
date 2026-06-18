import React, { useState, useRef, useEffect } from 'react';
import VoiceButton from '../voice/VoiceButton';
import { useVoice } from '../../hooks/useVoice';
import useStore from '../../store/useStore';

export default function ChatInput({ onSend }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const { isLoading, voiceEnabled } = useStore();
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoice();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || isLoading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '44px';
    onSend(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleVoiceStop = async () => {
    const text = await stopRecording();
    if (text) { onSend(text); }
  };

  return (
    <div style={{ padding: '10px 20px 18px', background: '#0d0d0d' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: '#111111',
          border: '1px solid #1f1f1f',
          borderRadius: 14, padding: '8px 10px',
          transition: 'border-color 0.2s',
        }}>
          {voiceEnabled && (
            <VoiceButton
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onStart={startRecording}
              onStop={handleVoiceStop}
            />
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? '🎤 Listening...' : 'Message DevOS...'}
            disabled={isLoading || isRecording}
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#ececec', fontSize: 14, resize: 'none',
              lineHeight: 1.6, minHeight: 24, maxHeight: 180,
              fontFamily: 'inherit', padding: '5px 0',
            }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: input.trim() && !isLoading ? '#7c3aed' : '#1e1e1e',
              border: 'none',
              cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              color: input.trim() && !isLoading ? '#fff' : '#333',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {isLoading
              ? <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : '↑'}
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#2a2a2a', marginTop: 6 }}>
          DevOS runs locally · No data leaves your machine
        </p>
      </div>
    </div>
  );
}
