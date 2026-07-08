import React, { useState, useEffect, useRef } from 'react';
import { Course, Task, AcademicSettings } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Edit, 
  Trash2, 
  Award, 
  Clock, 
  BookOpen, 
  Plus, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Coffee, 
  CloudRain, 
  Trees, 
  Moon, 
  Flame, 
  ChevronRight, 
  Trophy, 
  Activity, 
  Zap, 
  Layers,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeViewProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  tasks: Task[];
  settings: AcademicSettings;
  setTab: (tab: string) => void;
  showToast?: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onAddClassOpen: () => void;
}

const ACADEMIC_QUOTES = [
  "The quiet hours are where the loudest academic progress is made.",
  "Focus is the master-key to unraveling complex algorithms.",
  "Consistency is the compound interest of student intelligence.",
  "Your potential expands the moment you step into the flow state.",
  "Deep study is a deliberate practice of cognitive architecture."
];

export default function HomeView({ courses, setCourses, tasks, settings, setTab, showToast, onEditCourse, onDeleteCourse, onAddClassOpen }: HomeViewProps) {
  // Focus Timer States (Default 25 minutes pomodoro)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerMaxSeconds, setTimerMaxSeconds] = useState(25 * 60);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Focus Statistics & Gamification
  const [focusStreak, setFocusStreak] = useState(() => {
    return Number(localStorage.getItem('aura_focus_streak') || '0');
  });
  const [focusSessionsCompleted, setFocusSessionsCompleted] = useState(() => {
    return Number(localStorage.getItem('aura_focus_sessions_completed') || '0');
  });
  const [xpPoints, setXpPoints] = useState(() => {
    return Number(localStorage.getItem('aura_xp_points') || '0');
  });

  // Ambient Sounds / Themes
  const [ambientTheme, setAmbientTheme] = useState<'rain' | 'forest' | 'cafe' | 'night'>(() => {
    return (localStorage.getItem('aura_ambient_theme') as any) || 'rain';
  });
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.4);

  // Web Audio Context reference for synthetic focus soundscapes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<any[]>([]);

  // Quote State
  const [currentQuote, setCurrentQuote] = useState(ACADEMIC_QUOTES[0]);

  // Dynamic achievements calculated based on actual user progress
  const achievements = [
    { 
      id: 'streak_3', 
      name: 'Tri-Fire Streak', 
      desc: 'Maintain a 3-day deep study streak', 
      icon: Flame, 
      unlocked: focusStreak >= 3, 
      color: 'text-orange-400 border-orange-500/20 bg-orange-500/5' 
    },
    { 
      id: 'calc_master', 
      name: 'Euler Disciple', 
      desc: 'Register at least 2 courses in your timetable', 
      icon: Award, 
      unlocked: courses.length >= 2, 
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
    },
    { 
      id: 'focus_deep', 
      name: 'Hyper-Focus', 
      desc: 'Gain 150 or more total study XP points', 
      icon: Trophy, 
      unlocked: xpPoints >= 150, 
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' 
    },
  ];

  // Timer Countdown logic
  useEffect(() => {
    if (timerIsActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerIsActive(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            
            // Increment focus stats & awards
            const nextCompleted = focusSessionsCompleted + 1;
            const nextXp = xpPoints + 50;
            const nextStreak = focusStreak + 1;
            setFocusSessionsCompleted(nextCompleted);
            setXpPoints(nextXp);
            setFocusStreak(nextStreak);
            localStorage.setItem('aura_focus_sessions_completed', String(nextCompleted));
            localStorage.setItem('aura_xp_points', String(nextXp));
            localStorage.setItem('aura_focus_streak', String(nextStreak));

            showToast?.("Phenomenal focus interval completed! +50 XP", "success");

            // Play completion sound effect
            try {
              const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
              const ctx = new AudioCtxClass();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
              osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
              osc.type = 'sine';
              gain.gain.setValueAtTime(0.12, ctx.currentTime);
              osc.start();
              osc.stop(ctx.currentTime + 0.6);
            } catch (e) {}

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerIsActive, focusSessionsCompleted, xpPoints, focusStreak]);

  // Audio synthesis for immersive ambient sounds
  useEffect(() => {
    if (soundEnabled && timerIsActive) {
      startSynth();
    } else {
      stopSynth();
    }
    return () => {
      stopSynth();
    };
  }, [soundEnabled, ambientTheme, timerIsActive]);

  // Adjust volume dynamically
  useEffect(() => {
    if (audioNodesRef.current) {
      audioNodesRef.current.forEach(node => {
        if (node instanceof GainNode) {
          node.gain.setValueAtTime(soundVolume, audioCtxRef.current?.currentTime || 0);
        }
      });
    }
  }, [soundVolume]);

  const startSynth = () => {
    try {
      stopSynth();
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      // Master Gain Node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(soundVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      audioNodesRef.current.push(masterGain);

      if (ambientTheme === 'rain') {
        // Synthesizing rain using brown/pink noise filtering
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.0; // Boost
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(350, ctx.currentTime);

        source.connect(lowpass);
        lowpass.connect(masterGain);
        source.start();

        audioNodesRef.current.push(source, lowpass);
      } else if (ambientTheme === 'forest') {
        // Synthesizing gentle wind draft (extremely filtered slow noise modulation)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.015 * white)) / 1.015;
          lastOut = data[i];
          data[i] *= 2.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(220, ctx.currentTime);
        bandpass.Q.setValueAtTime(1.5, ctx.currentTime);

        source.connect(bandpass);
        bandpass.connect(masterGain);
        source.start();

        // Plus periodic soft bird sine chirps
        const birdOsc = ctx.createOscillator();
        birdOsc.type = 'sine';
        birdOsc.frequency.setValueAtTime(2200, ctx.currentTime);

        const birdGain = ctx.createGain();
        birdGain.gain.setValueAtTime(0.0, ctx.currentTime);

        // Simple periodic mod
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.2; // slow chirp repeat
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 250;

        lfo.connect(lfoGain);
        lfoGain.connect(birdOsc.frequency);
        birdOsc.connect(birdGain);
        birdGain.connect(masterGain);

        lfo.start();
        birdOsc.start();

        audioNodesRef.current.push(source, bandpass, birdOsc, birdGain, lfo);
      } else if (ambientTheme === 'cafe') {
        // Synthesizing cozy café ambient drone (overlapping smooth multi-frequency waves)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(110, ctx.currentTime); // Deep hum

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(220, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);

        osc1.start();
        osc2.start();

        audioNodesRef.current.push(osc1, osc2, filter);
      } else if (ambientTheme === 'night') {
        // Deep binaural state waves for dream space/focused clarity
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(180, ctx.currentTime); // left ear

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(188, ctx.currentTime); // right ear (8Hz alpha state beat!)

        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-1, ctx.currentTime);
          pannerR.pan.setValueAtTime(1, ctx.currentTime);

          oscL.connect(pannerL);
          pannerL.connect(masterGain);

          oscR.connect(pannerR);
          pannerR.connect(masterGain);
          audioNodesRef.current.push(pannerL, pannerR);
        } else {
          oscL.connect(masterGain);
          oscR.connect(masterGain);
        }

        oscL.start();
        oscR.start();
        audioNodesRef.current.push(oscL, oscR);
      }
    } catch (e) {
      console.warn("Audio Context failure", e);
    }
  };

  const stopSynth = () => {
    try {
      audioNodesRef.current.forEach(node => {
        try { node.stop(); } catch(e){}
        try { node.disconnect(); } catch(e){}
      });
      audioNodesRef.current = [];
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch(e){}
  };

  const changeTheme = (theme: 'rain' | 'forest' | 'cafe' | 'night') => {
    setAmbientTheme(theme);
    localStorage.setItem('aura_ambient_theme', theme);
    showToast?.(`Loaded ${theme.toUpperCase()} Focus ambience`, 'info');
  };

  // Handle Preset select for Timer
  const setTimerPreset = (minutes: number) => {
    setTimerIsActive(false);
    setTimerSeconds(minutes * 60);
    setTimerMaxSeconds(minutes * 60);
    showToast?.(`Focus set to ${minutes}m interval`, 'info');
  };

  const toggleTimer = () => {
    const nextState = !timerIsActive;
    setTimerIsActive(nextState);
    showToast?.(nextState ? "Focus Interval activated. Enjoy study zone." : "Focus Interval paused.", nextState ? "success" : "info");
  };

  const resetTimer = () => {
    setTimerIsActive(false);
    setTimerSeconds(25 * 60);
    setTimerMaxSeconds(25 * 60);
    showToast?.("Focus reset to 25m", "info");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Rotate quotes
  const rotateQuote = () => {
    const currentIndex = ACADEMIC_QUOTES.indexOf(currentQuote);
    const nextIndex = (currentIndex + 1) % ACADEMIC_QUOTES.length;
    setCurrentQuote(ACADEMIC_QUOTES[nextIndex]);
    showToast?.("Refreshed academic quote", "info");
  };

  // DayOfWeek calculation
  const todayRaw = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const currentDayOfWeek = todayRaw === 0 ? 7 : todayRaw;

  // Filter courses for today
  const todaysCourses = courses
    .filter(c => c.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getDayName = (dayNum: number) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[dayNum - 1] || "Today";
  };

  const attendanceRate = settings.attendanceTarget;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const consistencyRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Timer Progress percentage
  const timerPercentage = ((timerMaxSeconds - timerSeconds) / timerMaxSeconds) * 100;

  // Level determination based on XP
  const scholarLevel = Math.floor(xpPoints / 150) + 1;
  const levelProgress = (xpPoints % 150) / 150 * 100;

  // Heatmap calculated dynamically based on completed tasks for the current week's days
  const todayDate = new Date();
  const currentDayIndex = todayDate.getDay();
  const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
  const mondayDate = new Date(todayDate);
  mondayDate.setDate(todayDate.getDate() + mondayOffset);

  const heatmapData = ["M", "T", "W", "T", "F", "S", "S"].map((label, i) => {
    const dayDate = new Date(mondayDate);
    dayDate.setDate(mondayDate.getDate() + i);
    const dateStr = dayDate.toISOString().split('T')[0];

    // Calculate completed tasks on this specific date
    const completedOnDay = tasks.filter(t => t.dueDate === dateStr && t.status === 'completed');
    const intensity = Math.min(completedOnDay.length * 2, 5); // scales to max level 5

    return {
      label,
      intensity
    };
  });

  // Theme-specific CSS styling classes for Pomodoro container
  const themeClassMap = {
    rain: 'from-[#0f172a] via-[#1e293b] to-indigo-950/60 border-indigo-500/20 text-indigo-200',
    forest: 'from-[#064e3b] via-[#022c22] to-[#0f172a] border-emerald-500/20 text-emerald-200',
    cafe: 'from-[#7c2d12] via-[#451a03] to-[#1e1b4b]/80 border-amber-600/20 text-amber-100',
    night: 'from-[#030712] via-[#111827] to-[#581c87]/40 border-purple-500/25 text-purple-200'
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in" id="home-dashboard-view">
      
      {/* Upper Grid: Gamification & Profile Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Scholar level profile card */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="w-24 h-24 text-[#6bfb9a]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6bfb9a] glow-pulse" />
              <span className="text-[10px] font-bold font-mono tracking-widest text-[#6bfb9a] uppercase">Academic Class Rank</span>
            </div>
            <h3 className="text-lg font-extrabold text-white mt-1 leading-tight font-serif italic">Level {scholarLevel} Scholar</h3>
            <p className="text-xs text-gray-400 mt-1">Gained +50 XP for every completed study interval.</p>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
              <span>{xpPoints} / {(scholarLevel) * 150} XP</span>
              <span>XP Level Goal</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6bfb9a] to-cyan-400 transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Productivity Heatmap */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-40">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono tracking-widest text-gray-400 uppercase">Productivity Wave</span>
              <span className="text-[10px] font-mono text-[#6bfb9a] font-bold uppercase">7d Active</span>
            </div>
            <p className="text-xs text-gray-300 mt-1.5">Your study activity index based on tasks completed:</p>
          </div>

          <div className="flex justify-around items-end h-16 pt-2">
            {heatmapData.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 w-full">
                <div 
                  className={`w-5.5 rounded-md transition-all duration-300 hover:scale-115 ${
                    day.intensity === 0 ? 'bg-white/5 h-2' :
                    day.intensity === 1 ? 'bg-[#6bfb9a]/20 h-4' :
                    day.intensity == 2 ? 'bg-[#6bfb9a]/40 h-6' :
                    day.intensity === 3 ? 'bg-cyan-500/40 h-8' :
                    day.intensity === 4 ? 'bg-[#6bfb9a]/70 h-10 border border-[#6bfb9a]/20' :
                    'bg-[#6bfb9a] h-12 shadow-[0_0_12px_rgba(107,251,154,0.4)]'
                  }`}
                  title={`${day.label}: Level ${day.intensity} study`}
                />
                <span className="text-[10px] font-mono text-gray-500 font-bold">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Streaks & Quick Counter stats */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono tracking-widest text-orange-400 uppercase">Fire Streaks</span>
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          </div>

          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-tighter">{focusStreak}</span>
            <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider font-mono">Daily Streak</span>
          </div>

          <div className="text-[11px] text-gray-400 font-mono flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            <span>Sessions Run: <b>{focusSessionsCompleted}</b></span>
            <span className="text-[#6bfb9a]">Gold Scholar badge</span>
          </div>
        </div>

      </div>

      {/* Immersive Pomodoro Focus Experience Box */}
      <div className={`glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden bg-gradient-to-br ${themeClassMap[ambientTheme]} border transition-all duration-1000 shadow-[0_16px_50px_rgba(0,0,0,0.5)]`}>
        {/* Soft glowing ambient orb behind the timer */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-[100px] transition-all duration-1000 ${
          timerIsActive ? 'scale-150 opacity-100' : 'scale-100 opacity-20'
        } ${
          ambientTheme === 'rain' ? 'bg-indigo-500/20' :
          ambientTheme === 'forest' ? 'bg-emerald-500/20' :
          ambientTheme === 'cafe' ? 'bg-amber-500/20' : 'bg-purple-500/20'
        }`} />

        {/* Decorative theme background particle triggers */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          {ambientTheme === 'rain' && (
            <div className="absolute inset-0 flex justify-around select-none">
              <CloudRain className="w-5 h-5 text-indigo-400 animate-bounce mt-8" />
              <CloudRain className="w-5 h-5 text-indigo-400 animate-bounce mt-16 delay-300" />
              <CloudRain className="w-5 h-5 text-indigo-400 animate-bounce mt-10 delay-100" />
            </div>
          )}
          {ambientTheme === 'forest' && (
            <div className="absolute inset-0 flex justify-around select-none">
              <Trees className="w-5 h-5 text-emerald-400 animate-pulse mt-12" />
              <Trees className="w-5 h-5 text-emerald-400 animate-pulse mt-24 delay-200" />
            </div>
          )}
          {ambientTheme === 'cafe' && (
            <div className="absolute inset-0 flex justify-around select-none">
              <Coffee className="w-5 h-5 text-amber-500 animate-pulse mt-6" />
              <Coffee className="w-5 h-5 text-amber-500 animate-pulse mt-20 delay-150" />
            </div>
          )}
          {ambientTheme === 'night' && (
            <div className="absolute inset-0 flex justify-around select-none">
              <Moon className="w-5 h-5 text-purple-400 animate-pulse mt-14" />
              <Moon className="w-5 h-5 text-purple-400 animate-pulse mt-2 delay-500" />
            </div>
          )}
        </div>

        {/* Progress bar line at top */}
        <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
          <div 
            className={`h-full transition-all duration-300 ${
              ambientTheme === 'rain' ? 'bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]' :
              ambientTheme === 'forest' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' :
              ambientTheme === 'cafe' ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]' :
              'bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.5)]'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>

        {/* Top Header Row of the Timer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 z-10 relative">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              timerIsActive ? 'bg-[#6bfb9a] glow-pulse' : 'bg-gray-500 opacity-60'
            }`} />
            <p className="text-[10px] tracking-widest text-gray-300 font-mono uppercase font-bold">
              Cognitive Focus Chamber
            </p>
          </div>

          {/* Ambient Sounds selection bar */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-full p-1">
            {[
              { id: 'rain', icon: CloudRain, label: 'Rain' },
              { id: 'forest', icon: Trees, label: 'Forest' },
              { id: 'cafe', icon: Coffee, label: 'Café' },
              { id: 'night', icon: Moon, label: 'Night' }
            ].map((theme) => {
              const Icon = theme.icon;
              const isSelected = ambientTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => changeTheme(theme.id as any)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${
                    isSelected 
                      ? 'bg-white/10 text-white shadow-md' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Change background to ${theme.label} with sound controls`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big circular progress indicator */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 my-4 z-10 relative">
          
          {/* Circular ring */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                className="stroke-white/5"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                className={`${
                  ambientTheme === 'rain' ? 'stroke-indigo-400' :
                  ambientTheme === 'forest' ? 'stroke-emerald-400' :
                  ambientTheme === 'cafe' ? 'stroke-amber-400' :
                  'stroke-purple-400'
                }`}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="251%"
                strokeDashoffset={`${251 * (1 - (timerMaxSeconds - timerSeconds) / timerMaxSeconds)}%`}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dashoffset 0.4s ease",
                  filter: "drop-shadow(0 0 10px currentColor)"
                }}
              />
            </svg>

            {/* Inner text content */}
            <div className="flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white font-mono tracking-widest select-none">
                {formatTime(timerSeconds)}
              </h2>
              <span className="text-[10px] font-bold font-mono tracking-wider uppercase mt-1 text-gray-400">
                {timerIsActive ? "Deep Study" : "Paused"}
              </span>

              {/* Little ambient sound waves when active */}
              {timerIsActive && (
                <div className="flex items-end gap-[2px] h-3.5 mt-3">
                  <div className={`w-[2px] rounded-full animate-soundwave-1 ${
                    ambientTheme === 'rain' ? 'bg-indigo-400' :
                    ambientTheme === 'forest' ? 'bg-emerald-400' :
                    ambientTheme === 'cafe' ? 'bg-amber-400' : 'bg-purple-400'
                  }`} />
                  <div className={`w-[2px] rounded-full animate-soundwave-2 ${
                    ambientTheme === 'rain' ? 'bg-indigo-400' :
                    ambientTheme === 'forest' ? 'bg-emerald-400' :
                    ambientTheme === 'cafe' ? 'bg-amber-400' : 'bg-purple-400'
                  }`} />
                  <div className={`w-[2px] rounded-full animate-soundwave-3 ${
                    ambientTheme === 'rain' ? 'bg-indigo-400' :
                    ambientTheme === 'forest' ? 'bg-emerald-400' :
                    ambientTheme === 'cafe' ? 'bg-amber-400' : 'bg-purple-400'
                  }`} />
                </div>
              )}
            </div>
          </div>

          {/* Right side controls & volume slider */}
          <div className="flex flex-col gap-4 max-w-xs w-full text-center md:text-left">
            <div>
              <p className="text-xs text-gray-400 font-mono font-bold uppercase tracking-widest">Active Sound Controls</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg border transition-all ${
                    soundEnabled 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'bg-black/20 border-white/5 text-gray-400 hover:text-white'
                  }`}
                  title={soundEnabled ? "Disable ambient background synthesizer" : "Enable ambient background synthesizer"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <span className="text-[11px] font-mono font-semibold text-gray-300">
                  {soundEnabled ? "Ambience Synth Active" : "Ambient Synth Muted"}
                </span>
              </div>
            </div>

            {/* Volume slider */}
            {soundEnabled && (
              <div className="flex items-center gap-3 bg-black/35 rounded-xl px-3 py-2 border border-white/5">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="w-full accent-white bg-white/10 h-1 rounded cursor-pointer appearance-none"
                />
                <span className="text-[10px] font-mono text-gray-300">{Math.round(soundVolume * 100)}%</span>
              </div>
            )}

            {/* Presets buttons row */}
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
              <button 
                onClick={() => setTimerPreset(15)} 
                className={`px-3 py-1.5 text-[10px] font-mono rounded-full border transition-all ${
                  timerMaxSeconds === 15 * 60 ? 'bg-white/10 border-white/30 text-white font-bold' : 'bg-black/20 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                15m (Short)
              </button>
              <button 
                onClick={() => setTimerPreset(25)} 
                className={`px-3 py-1.5 text-[10px] font-mono rounded-full border transition-all ${
                  timerMaxSeconds === 25 * 60 ? 'bg-white/10 border-white/30 text-white font-bold' : 'bg-black/20 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                25m (Standard)
              </button>
              <button 
                onClick={() => setTimerPreset(50)} 
                className={`px-3 py-1.5 text-[10px] font-mono rounded-full border transition-all ${
                  timerMaxSeconds === 50 * 60 ? 'bg-white/10 border-white/30 text-white font-bold' : 'bg-black/20 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                50m (Deep study)
              </button>
            </div>
          </div>
        </div>

        {/* Buttons tray */}
        <div className="flex items-center justify-center gap-3 mt-6 z-10 relative">
          <button
            onClick={toggleTimer}
            className="flex items-center gap-2 px-8 py-3.5 bg-white text-black rounded-full font-extrabold uppercase tracking-widest text-xs transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_25px_rgba(255,255,255,0.45)] active:scale-95 cursor-pointer"
          >
            {timerIsActive ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Pause Focus
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Enter Zone
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="p-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full transition-all hover:scale-105"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid for Academic Status (Attendance & CGPA targets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Attendance gauge */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center justify-between gap-4 hover:border-[#6bfb9a]/20 duration-300">
          <div className="max-w-xs">
            <span className="text-[10px] font-bold font-mono tracking-widest text-gray-400 uppercase">TIMETABLE Target</span>
            <h4 className="text-base font-extrabold text-white mt-1 leading-tight font-serif italic">Minimum Attendance</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">Required percentage to retain university honors and exam validation status.</p>
          </div>
          
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-white/5"
                strokeWidth="6.5"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-[#6bfb9a]"
                strokeWidth="6.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - attendanceRate / 100)}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(107,251,154,0.3))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-extrabold text-[#6bfb9a] font-mono">{attendanceRate}%</span>
              <span className="text-[8px] text-gray-400 font-bold tracking-wider uppercase">Goal</span>
            </div>
          </div>
        </div>

        {/* CGPA gauge */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center justify-between gap-4 hover:border-purple-500/20 duration-300">
          <div className="max-w-xs">
            <span className="text-[10px] font-bold font-mono tracking-widest text-purple-400 uppercase">CGPA benchmark</span>
            <h4 className="text-base font-extrabold text-white mt-1 leading-tight font-serif italic">Goal Semester CGPA</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">Determined Target CGPA set in preferences to achieve cumulative honors.</p>
          </div>
          
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-white/5"
                strokeWidth="6.5"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-purple-400"
                strokeWidth="6.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - settings.gpaTarget / 10.0)}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(168,85,247,0.3))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-extrabold text-purple-400 font-mono">{settings.gpaTarget.toFixed(2)}</span>
              <span className="text-[8px] text-gray-400 font-bold tracking-wider uppercase">Goal</span>
            </div>
          </div>
        </div>

      </div>

      {/* Today's Schedule Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-white tracking-widest uppercase flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-[#6bfb9a]" />
            Timetable Agenda (Today)
          </h3>
          <button 
            onClick={onAddClassOpen}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6bfb9a]/10 hover:bg-[#6bfb9a]/15 text-[#6bfb9a] border border-[#6bfb9a]/20 hover:border-[#6bfb9a]/30 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Class
          </button>
        </div>

        {todaysCourses.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4 border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gray-400 border border-white/5">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-white font-bold font-mono uppercase tracking-wider">Your Timetable is Empty</p>
              <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
                No university lectures or lab sessions are scheduled today. Add your academic courses or trigger the Ctrl+K command menu to inject elite presets.
              </p>
            </div>
            <button
              onClick={onAddClassOpen}
              className="mt-2 px-5 py-2.5 bg-[#6bfb9a] hover:bg-[#6bfb9a]/90 text-black font-extrabold text-[10px] font-mono tracking-widest rounded-full hover:scale-105 transition-all uppercase"
            >
              + Create First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todaysCourses.map((course) => (
              <div 
                key={course.id} 
                className="glass-card rounded-2xl p-4.5 border-l-4 relative group hover:border-l-8 duration-300"
                style={{ borderLeftColor: course.color }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#6bfb9a] px-2 py-0.5 rounded bg-[#6bfb9a]/10" style={{ color: course.color, backgroundColor: `${course.color}15` }}>
                        {course.code}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {course.startTime} - {course.endTime}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm md:text-base">{course.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      {course.instructor && `Prof: ${course.instructor}`}
                      {course.room && ` • Room: ${course.room}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all">
                    <button
                      onClick={() => onEditCourse(course)}
                      className="p-1.5 text-gray-400 hover:text-[#6bfb9a] rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                      title="Edit Class"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCourse(course)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievement Unlocks Row */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold font-mono text-white tracking-widest uppercase flex items-center gap-2">
          <Trophy className="w-4.5 h-4.5 text-yellow-500" />
          Unlocked Achievements
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div 
                key={ach.id}
                className={`border rounded-2xl p-4 flex items-start gap-3 transition-all relative overflow-hidden ${
                  ach.unlocked 
                    ? `${ach.color} opacity-100` 
                    : 'border-white/5 bg-white/[0.01] opacity-50'
                }`}
              >
                <div className={`p-2 rounded-xl border ${
                  ach.unlocked ? 'border-current/10 bg-current/5' : 'border-white/5 bg-white/5'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{ach.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{ach.desc}</p>
                </div>
                {!ach.unlocked && (
                  <span className="absolute top-2 right-2 text-[8px] font-mono bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-gray-400">Locked</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quote / Reflection Board */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-[#0c0f1d] to-[#040712] border border-white/5 text-center flex flex-col items-center justify-center min-h-24">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,rgba(107,251,154,0.02),transparent_50%)] pointer-events-none" />
        <span className="text-[#6bfb9a] opacity-20 font-serif text-4xl leading-none select-none">“</span>
        <p className="font-sans italic text-sm md:text-base font-semibold text-gray-200 leading-relaxed max-w-lg mb-2">
          {currentQuote}
        </p>
        <button 
          onClick={rotateQuote}
          className="text-[9px] font-mono uppercase tracking-widest text-[#6bfb9a]/80 hover:text-[#6bfb9a] transition-all mt-1"
        >
          Generate Mental Reflection
        </button>
      </div>
    </div>
  );
}
