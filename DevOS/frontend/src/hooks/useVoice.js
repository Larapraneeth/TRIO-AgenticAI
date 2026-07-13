import { useState, useRef, useCallback } from 'react';
import { transcribeAudio, speakText } from '../services/api';

const pickMimeType = () => {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
};

export const useVoice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const mimeType = pickMimeType();
      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied or unavailable:', err);
      setIsRecording(false);
      throw err; // let the caller know the mic never started
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }
      recorder.onstop = async () => {
        const type = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        recorder.stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);

        if (!blob.size) {
          resolve(null);
          return;
        }

        setIsTranscribing(true);
        try {
          const text = await transcribeAudio(blob);
          resolve(text);
        } catch (err) {
          console.error('Transcription failed:', err);
          resolve(null);
        } finally {
          setIsTranscribing(false);
        }
      };
      recorder.stop();
    });
  }, []);

  const speak = useCallback(async (text) => {
    if (!text) return;
    setIsSpeaking(true);
    try {
      const arrayBuffer = await speakText(text);
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start(0);
    } catch (err) {
      console.error('Playback failed:', err);
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isRecording,
    isSpeaking,
    isTranscribing,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
};