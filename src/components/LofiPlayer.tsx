import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Sliders, Music, Wind } from 'lucide-react';

export default function LofiPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundType, setSoundType] = useState<'brown' | 'binaural' | 'rain'>('brown');
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const oscillatorNode1Ref = useRef<OscillatorNode | null>(null);
  const oscillatorNode2Ref = useRef<OscillatorNode | null>(null);

  // Initialize Audio Context on demand
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Generate Brownian Noise buffer (very smooth, deep roar)
  const createBrownNoiseBuffer = () => {
    if (!audioCtxRef.current) return null;
    const bufferSize = audioCtxRef.current.sampleRate * 2; // 2 seconds
    const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brownian formula: accumulate previous value with a tiny fraction of white noise
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // boost volume slightly
    }
    return buffer;
  };

  const stopActiveNodes = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e){}
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (oscillatorNode1Ref.current) {
      try { oscillatorNode1Ref.current.stop(); } catch(e){}
      oscillatorNode1Ref.current.disconnect();
      oscillatorNode1Ref.current = null;
    }
    if (oscillatorNode2Ref.current) {
      try { oscillatorNode2Ref.current.stop(); } catch(e){}
      oscillatorNode2Ref.current.disconnect();
      oscillatorNode2Ref.current = null;
    }
  };

  const playSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    stopActiveNodes();

    // Set up standard Gain Node for master volume
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;

    if (soundType === 'brown') {
      // Create Brown Noise Source
      const buffer = createBrownNoiseBuffer();
      if (!buffer) return;

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      // Lowpass filter to make it sound deeper
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      noiseNode.connect(filter);
      filter.connect(gainNode);
      
      noiseNode.start();
      sourceNodeRef.current = noiseNode;
      filterNodeRef.current = filter;

    } else if (soundType === 'rain') {
      // Rain simulation: Brown noise with a highpass filter and a random crackle filter
      const buffer = createBrownNoiseBuffer();
      if (!buffer) return;

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(800, ctx.currentTime);
      bandpass.Q.setValueAtTime(1.0, ctx.currentTime);

      noiseNode.connect(bandpass);
      bandpass.connect(gainNode);

      noiseNode.start();
      sourceNodeRef.current = noiseNode;
      filterNodeRef.current = bandpass;

    } else if (soundType === 'binaural') {
      // Binaural alpha waves: 150Hz in left ear, 160Hz in right ear
      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(140, ctx.currentTime); // Carrier

      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(150, ctx.currentTime); // 10Hz offset (Alpha State)

      const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      if (pannerL && pannerR) {
        pannerL.pan.setValueAtTime(-1, ctx.currentTime);
        pannerR.pan.setValueAtTime(1, ctx.currentTime);

        oscL.connect(pannerL);
        pannerL.connect(gainNode);

        oscR.connect(pannerR);
        pannerR.connect(gainNode);
      } else {
        // Fallback for browsers without StereoPanner
        oscL.connect(gainNode);
        oscR.connect(gainNode);
      }

      oscL.start();
      oscR.start();

      oscillatorNode1Ref.current = oscL;
      oscillatorNode2Ref.current = oscR;
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playSound();
    } else {
      stopActiveNodes();
    }
    return () => {
      stopActiveNodes();
    };
  }, [isPlaying, soundType]);

  // Adjust volume dynamically
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="glass-card rounded-xl p-4 md:p-6 w-full max-w-md mx-auto" id="lofi-ambient-player">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-primary/10 text-primary transition-all ${isPlaying ? 'glow-pulse scale-105' : ''}`}>
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-label-md font-bold text-on-surface">Focus Sounds</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-on-surface-variant font-mono">Lo-fi Library Ambience</p>
              {/* Pulsing sound state indicator */}
              {isPlaying && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Animated sound spectrum bar graph */}
          {isPlaying && (
            <div className="flex items-end gap-[3px] h-6 px-1 shrink-0">
              <div className="w-1 bg-primary rounded-full animate-soundwave-1" />
              <div className="w-1 bg-primary/80 rounded-full animate-soundwave-2" />
              <div className="w-1 bg-secondary rounded-full animate-soundwave-3" />
              <div className="w-1 bg-primary/90 rounded-full animate-soundwave-4" />
              <div className="w-1 bg-primary/60 rounded-full animate-soundwave-5" />
            </div>
          )}

          <button
            onClick={togglePlayback}
            className={`p-3 rounded-full transition-all duration-300 ${
              isPlaying ? 'bg-primary text-surface shadow-[0_0_15px_rgba(74,222,128,0.4)] hover:scale-105' : 'bg-surface-container text-on-surface hover:text-primary hover:scale-105'
            }`}
            title={isPlaying ? 'Pause Focus Sounds' : 'Play Focus Sounds'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Preset Selectors */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => setSoundType('brown')}
          className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all ${
            soundType === 'brown'
              ? 'bg-primary/10 border-primary text-primary font-bold'
              : 'bg-surface-container-lowest/30 border-outline-variant/20 text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Brown Noise
        </button>
        <button
          onClick={() => setSoundType('rain')}
          className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all ${
            soundType === 'rain'
              ? 'bg-primary/10 border-primary text-primary font-bold'
              : 'bg-surface-container-lowest/30 border-outline-variant/20 text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Library Rain
        </button>
        <button
          onClick={() => setSoundType('binaural')}
          className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all ${
            soundType === 'binaural'
              ? 'bg-primary/10 border-primary text-primary font-bold'
              : 'bg-surface-container-lowest/30 border-outline-variant/20 text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Alpha Waves
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 bg-surface-container-low/50 rounded-lg p-2.5">
        <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className="text-on-surface-variant hover:text-primary transition-colors">
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full accent-primary bg-surface-container h-1 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-[10px] font-mono text-on-surface-variant w-8 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}
