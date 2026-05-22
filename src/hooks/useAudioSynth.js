import { useRef, useState, useCallback } from 'react';

export function useAudioSynth() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef(null);

  const initCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      // Create new audio context
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    
    // Resume context if suspended (browser security blocks autoplay)
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTone = useCallback((value, max = 100) => {
    if (!soundEnabled) return;
    
    try {
      initCtx();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      // Base sound parameters
      const duration = 0.08; // duration of beep in seconds
      const volume = 0.08; // soft volume to avoid overwhelming

      // Scale value linearly between 220Hz (A3) and 1000Hz (C6)
      const minFreq = 220;
      const maxFreq = 1000;
      const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0.5;
      const frequency = minFreq + ratio * (maxFreq - minFreq);

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle'; // triangle has a sweet, retro game-boy sound
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Volume Envelope (prevents popping)
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration + 0.01);
    } catch (error) {
      console.warn("Audio Synthesis Error:", error);
    }
  }, [soundEnabled, initCtx]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      if (next) {
        initCtx();
      }
      return next;
    });
  }, [initCtx]);

  return {
    soundEnabled,
    toggleSound,
    playTone
  };
}
