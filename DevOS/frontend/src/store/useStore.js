import { create } from 'zustand';

const useStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  conversations: [],
  activeConversationId: null,
  activeConversationTitle: 'New Chat',
  sidebarOpen: true,
  voiceEnabled: false,
  systemInfo: null,
  thinkingSteps: [],
  showTracePanel: false,
  lastTrace: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastMessage: (fields) => set((s) => {
    const msgs = [...s.messages];
    if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...fields };
    return { messages: msgs };
  }),

  setLoading: (val) => set({ isLoading: val }),
  setThinkingSteps: (steps) => set({ thinkingSteps: steps }),
  addThinkingStep: (step) => set((s) => ({ thinkingSteps: [...s.thinkingSteps, step] })),
  clearThinking: () => set({ thinkingSteps: [] }),

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id, title) => set({ activeConversationId: id, activeConversationTitle: title || 'New Chat' }),
  updateConversationTitle: (id, title) => set((s) => ({
    conversations: s.conversations.map(c => c.id === id ? { ...c, title } : c),
    activeConversationTitle: s.activeConversationId === id ? title : s.activeConversationTitle,
  })),
  addConversation: (conv) => set((s) => ({ conversations: [conv, ...s.conversations] })),
  removeConversation: (id) => set((s) => ({
    conversations: s.conversations.filter(c => c.id !== id),
    activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
    messages: s.activeConversationId === id ? [] : s.messages,
  })),

  setSidebarOpen: (val) => set({ sidebarOpen: val }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
  setSystemInfo: (info) => set({ systemInfo: info }),
  setShowTracePanel: (val) => set({ showTracePanel: val }),
  setLastTrace: (trace) => set({ lastTrace: trace }),

  startNewChat: () => set({
    messages: [],
    activeConversationId: null,
    activeConversationTitle: 'New Chat',
    thinkingSteps: [],
    lastTrace: null,
    showTracePanel: false,
  }),

  getHistory: () => get().messages.map((m) => ({ role: m.role, content: m.content })),
}));

export default useStore;
