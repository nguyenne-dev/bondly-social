import React, { useState } from 'react';
import { Volume2, Play, Zap, CheckCircle2, RotateCcw, Heart } from 'lucide-react';

export const SoundboardWidget = () => {
  const [activeSound, setActiveSound] = useState(null);

  const playSynthesizedSound = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      setActiveSound(type);

      if (type === 'message') {
        // 880Hz -> 1760Hz double chime
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'reaction') {
        // 600Hz -> 1400Hz chirp
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } else if (type === 'success') {
        // C5-E5-G5 harmonic chord
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.06);
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + idx * 0.06);
          osc.stop(audioCtx.currentTime + 0.35);
        });
      } else if (type === 'recall') {
        // 450Hz -> 120Hz sweep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }

      setTimeout(() => {
        setActiveSound(null);
      }, 350);
    } catch (e) {
      console.warn('AudioContext requires user gesture');
    }
  };

  const sounds = [
    { id: 'message', name: 'Tin Nhắn Đến (Chime)', icon: <Zap size={16} color="var(--primary)" />, desc: 'Tần số 880Hz ➔ 1760Hz' },
    { id: 'reaction', name: 'Thả Cảm Xúc (Chirp)', icon: <Heart size={16} color="#ec4899" />, desc: 'Tần số 600Hz ➔ 1400Hz' },
    { id: 'success', name: 'Kết Nối Thành Công', icon: <CheckCircle2 size={16} color="#10b981" />, desc: 'Hợp âm Đô Trưởng' },
    { id: 'recall', name: 'Thu Hồi Tin Nhắn', icon: <RotateCcw size={16} color="#f59e0b" />, desc: 'Hạ tần số 450Hz ➔ 120Hz' },
  ];

  return (
    <div
      className="glass-card cyber-card"
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        marginTop: '28px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Volume2 size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Web Audio Soundboard</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nghe thử âm thanh tổng hợp thời gian thực của NexChat</p>
          </div>
        </div>

        {/* Equalizer Waveform */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '18px' }}>
          {[10, 16, 12, 18, 14, 11, 16].map((h, i) => (
            <div
              key={i}
              className="sound-bar"
              style={{
                height: activeSound ? `${h}px` : '4px',
                animationDuration: `${0.8 + i * 0.15}s`,
                transition: 'height 0.15s ease',
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
        }}
      >
        {sounds.map((s) => {
          const isPlaying = activeSound === s.id;
          return (
            <button
              key={s.id}
              onClick={() => playSynthesizedSound(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: isPlaying ? '1px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: isPlaying ? 'var(--primary-light)' : 'var(--bg-subtle)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {s.icon}
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{s.desc}</div>
                </div>
              </div>
              <Play size={13} color="var(--primary)" style={{ opacity: isPlaying ? 1 : 0.6 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SoundboardWidget;
