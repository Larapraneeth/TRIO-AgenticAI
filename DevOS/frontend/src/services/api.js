import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 180000,
});

export const sendMessage = async (message, conversationId = null) => {
  const { data } = await api.post('/chat/', { message, conversation_id: conversationId });
  return data;
};

export const getConversations = async () => {
  const { data } = await api.get('/conversations/');
  return data.conversations;
};

export const getConversation = async (id) => {
  const { data } = await api.get(`/conversations/${id}`);
  return data;
};

export const createConversation = async (title = 'New Chat') => {
  const { data } = await api.post('/conversations/', { title });
  return data;
};

export const deleteConversation = async (id) => {
  await api.delete(`/conversations/${id}`);
};

export const transcribeAudio = async (audioBlob) => {
  const form = new FormData();
  form.append('audio', audioBlob, 'recording.wav');
  const { data } = await api.post('/voice/transcribe', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.text;
};

export const speakText = async (text) => {
  const { data } = await api.post('/voice/speak', { text }, { responseType: 'arraybuffer' });
  return data;
};

export const getSystemInfo = async () => {
  const { data } = await api.get('/system/info');
  return data;
};