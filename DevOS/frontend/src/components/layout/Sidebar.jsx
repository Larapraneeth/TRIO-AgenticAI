import React, { useEffect, useState } from 'react';
import { getConversations, getConversation, deleteConversation } from '../../services/api';
import useStore from '../../store/useStore';

function groupConversations(convs) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const week = new Date(today);
  week.setDate(week.getDate() - 7);

  const groups = { Today: [], Yesterday: [], 'Previous 7 days': [], Older: [] };
  convs.forEach((c) => {
    const d = new Date(c.updated_at);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day >= today) groups['Today'].push(c);
    else if (day >= yesterday) groups['Yesterday'].push(c);
    else if (day >= week) groups['Previous 7 days'].push(c);
    else groups['Older'].push(c);
  });
  return groups;
}

export default function Sidebar() {
  const {
    conversations, setConversations, activeConversationId,
    setActiveConversation, setMessages, startNewChat,
    removeConversation, sidebarOpen,
  } = useStore();
  const [hoverId, setHoverId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    getConversations().then(setConversations).catch(() => {});
  }, []);

  const handleSelect = async (conv) => {
    if (conv.id === activeConversationId) return;
    setLoadingId(conv.id);
    try {
      const data = await getConversation(conv.id);
      setMessages(data.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        agents_used: m.agents_used || [],
        execution_steps: m.execution_steps || [],
        intent: m.intent || '',
        timestamp: m.created_at,
      })));
      setActiveConversation(conv.id, conv.title);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      removeConversation(id);
    } catch (err) {
      console.error(err);
    }
  };

  if (!sidebarOpen) return null;

  const groups = groupConversations(conversations);

  return (
    <aside style={{
      width: 255,
      background: '#0a0a0a',
      borderRight: '0.5px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      <div style={{ padding: '16px 14px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid #141414' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: '#7c3aed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: '#fff', flexShrink: 0,
          letterSpacing: '0.05em',
        }}>
          <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.1em' }}>TRI</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#ececec', letterSpacing: '0.12em' }}>TRIO</div>
          <div style={{ fontSize: 9, color: '#4a4a4a', letterSpacing: '0.15em', marginTop: 1 }}>AI OPERATING SYSTEM</div>
        </div>
      </div>

      <div style={{ padding: '10px 10px 6px' }}>
        <button
          onClick={startNewChat}
          style={{
            width: '100%', padding: '8px 12px',
            background: 'transparent',
            border: '0.5px solid #1e1e1e',
            borderRadius: 8,
            color: '#8e8ea0',
            cursor: 'pointer',
            fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#141414'; e.currentTarget.style.color = '#ececec'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8e8ea0'; }}
        >
          <span style={{ fontSize: 14 }}>✏️</span> New chat
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
        {Object.entries(groups).map(([group, items]) => {
          if (!items.length) return null;
          return (
            <div key={group} style={{ marginBottom: 6 }}>
              <p style={{
                fontSize: 10, color: '#3a3a3a', fontWeight: 500,
                padding: '8px 8px 4px', letterSpacing: '0.05em',
              }}>{group}</p>
              {items.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelect(conv)}
                  onMouseEnter={() => setHoverId(conv.id)}
                  onMouseLeave={() => setHoverId(null)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 7,
                    cursor: 'pointer',
                    background: activeConversationId === conv.id ? '#161616' : hoverId === conv.id ? '#111' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{
                    flex: 1, fontSize: 12,
                    color: activeConversationId === conv.id ? '#d4d4d4' : '#565656',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {loadingId === conv.id ? '...' : conv.title}
                  </span>
                  {hoverId === conv.id && (
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      style={{ background: 'none', border: 'none', color: '#3a3a3a', cursor: 'pointer', fontSize: 13, padding: '2px 3px', borderRadius: 4, lineHeight: 1 }}
                    >🗑</button>
                  )}
                </div>
              ))}
            </div>
          );
        })}
        {conversations.length === 0 && (
          <div style={{ padding: '24px 14px', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#333' }}>No conversations yet</p>
            <p style={{ fontSize: 10, color: '#252525', marginTop: 4 }}>Start chatting to see history</p>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 14px', borderTop: '0.5px solid #141414' }}>
        <p style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: '0.08em' }}>
          TRIO v2.0 · LOCAL MODEL · PRIVATE
        </p>
      </div>
    </aside>
  );
}
