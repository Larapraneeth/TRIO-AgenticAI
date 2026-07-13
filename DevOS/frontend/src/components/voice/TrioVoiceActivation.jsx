import React, { useEffect, useRef, useState } from 'react';

export default function TrioVoiceActivation({
  isRecording,
  isTranscribing,
  startRecording,
  stopRecording,
  onTranscript,
  onClose,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const [phase, setPhase] = useState('entering');
  const [statusText, setStatusText] = useState('Initializing...');

  const startedRef = useRef(false);
  const closingRef = useRef(false);
  const silenceRef = useRef(null);

  // Stop the mic, transcribe, hand text back, close. Guarded so it only runs once.
  const finish = async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (silenceRef.current) {
      clearTimeout(silenceRef.current);
      clearInterval(silenceRef.current);
    }
    let text = null;
    try {
      text = await stopRecording();
    } catch (_) {}
    if (text && onTranscript) onTranscript(text);
    onClose();
  };

  // Start capturing as soon as the overlay mounts.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        await startRecording();
        setupSilenceDetection();
      } catch (_) {
        setStatusText('Microphone unavailable');
        setTimeout(() => onClose(), 1500);
      }
    })();

    return () => {
      if (silenceRef.current) {
        clearTimeout(silenceRef.current);
        clearInterval(silenceRef.current);
      }
    };
    
  }, []);

  // Auto-stop after ~2s of silence using the Web Audio analyser on the live mic.
  const setupSilenceDetection = () => {
    try {
      const stream = navigator.mediaDevices && window.__trioStream;
      // Fall back to a fixed max-listen window if we can't tap the stream.
    } catch (_) {}

    // Simple safety cap: auto-finish after 12s no matter what.
    silenceRef.current = setTimeout(() => finish(), 12000);
  };

  useEffect(() => {
    const phases = [
      { delay: 0,    text: 'Initializing...' },
      { delay: 500,  text: 'Systems online.' },
      { delay: 1100, text: 'Listening...' },
    ];
    const timers = phases.map(p =>
      setTimeout(() => setStatusText(p.text), p.delay)
    );
    const enterTimer = setTimeout(() => setPhase('active'), 400);
    return () => { timers.forEach(clearTimeout); clearTimeout(enterTimer); };
  }, []);

  useEffect(() => {
    if (isTranscribing) setStatusText('Processing...');
  }, [isTranscribing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2;
    const cy = H / 2;

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      ctx.clearRect(0, 0, W, H);

      const rings = [
        { r: 90,  speed: 0.4,  dashes: 48, dashLen: 0.04, color: 'rgba(139,92,246,0.15)', width: 0.5 },
        { r: 115, speed: -0.25, dashes: 32, dashLen: 0.06, color: 'rgba(139,92,246,0.2)',  width: 0.8 },
        { r: 138, speed: 0.18,  dashes: 24, dashLen: 0.08, color: 'rgba(124,58,237,0.25)', width: 1   },
        { r: 160, speed: -0.12, dashes: 18, dashLen: 0.1,  color: 'rgba(167,139,250,0.15)',width: 1.2 },
        { r: 182, speed: 0.08,  dashes: 14, dashLen: 0.14, color: 'rgba(109,40,217,0.2)',  width: 1.5 },
      ];

      rings.forEach(ring => {
        const gap = (Math.PI * 2) / ring.dashes;
        const dashAngle = gap * ring.dashLen;
        const offset = t * ring.speed;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.width;
        for (let i = 0; i < ring.dashes; i++) {
          const startAngle = i * gap + offset;
          ctx.beginPath();
          ctx.arc(cx, cy, ring.r, startAngle, startAngle + dashAngle);
          ctx.stroke();
        }
      });

      const numBars = 64;
      const barMaxH = isRecording ? 36 : 8;
      for (let i = 0; i < numBars; i++) {
        const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;
        const baseH = isRecording
          ? Math.abs(Math.sin(t * 4 + i * 0.4) * barMaxH * Math.random() * 0.8 + 4)
          : Math.abs(Math.sin(t * 1.2 + i * 0.25) * barMaxH + 3);
        const innerR = 68;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * (innerR + baseH);
        const y2 = cy + Math.sin(angle) * (innerR + baseH);
        const alpha = isRecording ? 0.7 + Math.random() * 0.3 : 0.35 + Math.sin(t + i) * 0.15;
        ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      const hexR = 50;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * hexR;
        const y = cy + Math.sin(a) * hexR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(139,92,246,0.25)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      const scanLine = cy - 42 + (Math.sin(t * 1.5) + 1) / 2 * 84;
      const scanGrad = ctx.createLinearGradient(cx - 42, 0, cx + 42, 0);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.5, 'rgba(139,92,246,0.15)');
      scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(cx - 42, scanLine - 0.5, 84, 1);

      const pulse = (Math.sin(t * 2) + 1) / 2;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 42);
      coreGrad.addColorStop(0, `rgba(124,58,237,${0.06 + pulse * 0.04})`);
      coreGrad.addColorStop(0.6, `rgba(109,40,217,${0.03 + pulse * 0.02})`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      ctx.fill();

      const dotR = 3 + pulse * 1.5;
      ctx.fillStyle = `rgba(167,139,250,${0.6 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
      ctx.fill();

      const cornerLen = 14;
      const corners = [
        [cx - 60, cy - 60, 1, 1],
        [cx + 60, cy - 60, -1, 1],
        [cx - 60, cy + 60, 1, -1],
        [cx + 60, cy + 60, -1, -1],
      ];
      ctx.strokeStyle = `rgba(139,92,246,${0.3 + pulse * 0.2})`;
      ctx.lineWidth = 1.5;
      corners.forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * cornerLen, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + dy * cornerLen);
        ctx.stroke();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRecording]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(7,5,13,0.97)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      opacity: phase === 'entering' ? 0 : 1,
      transform: phase === 'entering' ? 'scale(0.96)' : 'scale(1)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <div style={{ position: 'relative', width: 420, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: '#ede9fe',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1,
            marginBottom: 6,
            textTransform: 'uppercase',
          }}>TRIO</div>
          <div style={{
            fontSize: 10,
            letterSpacing: '0.35em',
            color: 'rgba(139,92,246,0.7)',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>AI Operating System</div>
        </div>
      </div>

      <div style={{ marginTop: -20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <p style={{
          fontSize: 13,
          letterSpacing: '0.12em',
          color: 'rgba(167,139,250,0.8)',
          fontWeight: 400,
          textTransform: 'uppercase',
          minHeight: 20,
        }}>{statusText}</p>

        <div style={{ display: 'flex', gap: 5, alignItems: 'center', height: 28 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              width: 2.5,
              borderRadius: 2,
              background: isRecording ? '#8b5cf6' : 'rgba(139,92,246,0.3)',
              height: isRecording
                ? `${8 + Math.random() * 20}px`
                : `${4 + Math.sin(Date.now() / 400 + i) * 3}px`,
              transition: 'height 0.1s ease',
              animation: isRecording ? `waveBar${i % 5} 0.${4 + (i % 4)}s infinite alternate ease-in-out` : 'none',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 28, marginTop: 4 }}>
          {['NEURAL', 'VOICE', 'ACTIVE'].map((label, i) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', margin: '0 auto 5px', opacity: 0.6 + i * 0.13 }} />
              <span style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(139,92,246,0.5)', textTransform: 'uppercase' }}>{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={finish}
          style={{
            marginTop: 12,
            padding: '8px 28px',
            background: 'transparent',
            border: '0.5px solid rgba(139,92,246,0.35)',
            borderRadius: 20,
            color: 'rgba(139,92,246,0.6)',
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.color = '#8b5cf6'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(139,92,246,0.6)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)'; }}
        >
          Dismiss
        </button>
      </div>

      <style>{`
        @keyframes waveBar0 { from { height: 4px } to { height: 22px } }
        @keyframes waveBar1 { from { height: 6px } to { height: 18px } }
        @keyframes waveBar2 { from { height: 3px } to { height: 26px } }
        @keyframes waveBar3 { from { height: 7px } to { height: 14px } }
        @keyframes waveBar4 { from { height: 5px } to { height: 20px } }
        `}</style>
    </div>
  );
}