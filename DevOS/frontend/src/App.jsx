import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ChatWindow from './components/chat/ChatWindow';
import ChatInput from './components/chat/ChatInput';
import TrioVoiceActivation from './components/voice/TrioVoiceActivation';
import { sendMessage, speakText, getConversations } from './services/api';
import useStore from './store/useStore';
import './index.css';

export default function App() {
  const {
    addMessage, setLoading, isLoading, voiceEnabled, toggleVoice,
    activeConversationId, setActiveConversation,
    setConversations, addConversation,
    setThinkingSteps, clearThinking,
  } = useStore();

  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);

  useEffect(() => {
    getConversations().then(setConversations).catch(() => {});
  }, []);

  const handleVoiceOpen = () => setShowVoiceOverlay(true);

  const handleVoiceClose = () => {
    setShowVoiceOverlay(false);
    if (voiceEnabled) toggleVoice();
  };

  const simulateThinking = useCallback((intervalRef) => {
    const steps = ['Thinking...', 'Analyzing request...', 'Selecting tools...', 'Executing actions...'];
    let i = 0;
    setThinkingSteps([steps[0]]);
    intervalRef.current = setInterval(() => {
      i++;
      if (i < steps.length) setThinkingSteps(steps.slice(0, i + 1));
    }, 900);
  }, [setThinkingSteps]);

  const handleSend = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    addMessage({ role: 'user', content: text, timestamp: new Date().toISOString() });
    setLoading(true);
    clearThinking();

    const intervalRef = { current: null };
    simulateThinking(intervalRef);

    try {
      const result = await sendMessage(text, activeConversationId);
      clearInterval(intervalRef.current);
      clearThinking();

      if (!activeConversationId) {
        addConversation({
          id: result.conversation_id,
          title: 'New Chat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setActiveConversation(result.conversation_id, 'New Chat');
      }

      getConversations().then(convs => {
        setConversations(convs);
        const updated = convs.find(c => c.id === result.conversation_id);
        if (updated) setActiveConversation(updated.id, updated.title);
      });

      addMessage({
        id: result.message_id,
        role: 'assistant',
        content: result.response,
        agents_used: result.agents_used || [],
        execution_steps: result.execution_steps || [],
        intent: result.intent || '',
        timestamp: new Date().toISOString(),
      });

      if (voiceEnabled && result.response) {
        speakText(result.response.slice(0, 300)).catch(() => {});
      }
    } catch (err) {
      clearInterval(intervalRef.current);
      clearThinking();
      addMessage({
        role: 'assistant',
        content: `**Connection error.** Make sure TRIO backend is running on port 8000.\n\n\`${err.message || 'Network error'}\``,
        agents_used: [],
        execution_steps: [],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [isLoading, voiceEnabled, activeConversationId, addMessage, setLoading, clearThinking, simulateThinking, addConversation, setActiveConversation, setConversations]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0d0d0d', position: 'relative' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header onVoiceOpen={handleVoiceOpen} />
        <ChatWindow onSuggestion={handleSend} />
        <ChatInput onSend={handleSend} />
      </div>

      {showVoiceOverlay && (
        <TrioVoiceActivation
          isRecording={false}
          isTranscribing={false}
          onClose={handleVoiceClose}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-7px); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }
      `}</style>
    </div>
  );
}
