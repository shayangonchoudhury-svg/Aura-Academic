import React, { useState, useEffect } from 'react';
import { Course, Task, Note, AcademicSettings } from './types';
import { 
  INITIAL_COURSES, 
  INITIAL_TASKS, 
  INITIAL_NOTES, 
  DEFAULT_SETTINGS 
} from './utils/initialData';

// Import Views
import HomeView from './components/HomeView';
import ScheduleView from './components/ScheduleView';
import CourseModal from './components/CourseModal';
import TasksView from './components/TasksView';
import NotesView from './components/NotesView';
import SettingsView from './components/SettingsView';

// Icons & Motion
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Brain, 
  Settings, 
  Bell, 
  ArrowRight, 
  Sparkles,
  ChevronDown,
  Search,
  Command,
  HelpCircle,
  Clock,
  X,
  Volume2,
  Bookmark,
  Award,
  BookOpen,
  Layers,
  Sparkle,
  Download
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export default function App() {
  // Global State with LocalStorage Persistence
  const [tab, setTab] = useState<string>(() => {
    return localStorage.getItem('aura_active_tab') || 'welcome';
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('aura_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('aura_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('aura_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [settings, setSettings] = useState<AcademicSettings>(() => {
    const saved = localStorage.getItem('aura_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Toasts state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Catch the PWA beforeinstallprompt and appinstalled events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
      showToast("Aura Academic successfully installed!", "success");
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast("Thank you for installing Aura Suite!", "success");
    } else {
      showToast("Installation cancelled.", "info");
    }
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // Command palette state
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  // Course Modal and Deletion State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // One-time cleanup of old demo data from localStorage to ensure a completely clean start
  useEffect(() => {
    const isCleaned = localStorage.getItem('aura_production_clean_v1');
    if (!isCleaned) {
      localStorage.removeItem('aura_courses');
      localStorage.removeItem('aura_tasks');
      localStorage.removeItem('aura_notes');
      localStorage.removeItem('aura_settings');
      localStorage.removeItem('aura_folders');
      localStorage.removeItem('aura_focus_streak');
      localStorage.removeItem('aura_focus_sessions_completed');
      localStorage.removeItem('aura_xp_points');
      localStorage.removeItem('aura_ambient_theme');
      localStorage.setItem('aura_production_clean_v1', 'true');
      
      // Update states
      setCourses([]);
      setTasks([]);
      setNotes([]);
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Sync to LocalStorage on modifications
  useEffect(() => {
    localStorage.setItem('aura_active_tab', tab);
  }, [tab]);

  useEffect(() => {
    localStorage.setItem('aura_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('aura_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aura_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('aura_settings', JSON.stringify(settings));
  }, [settings]);

  // Global Command Palette & Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowPalette(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTriggerAddClass = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (updatedCourse: Course) => {
    setCourses((prev) => {
      const exists = prev.some((c) => c.id === updatedCourse.id);
      if (exists) {
        showToast(`Saved changes to ${updatedCourse.name}!`, 'success');
        return prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c));
      } else {
        showToast(`Registered ${updatedCourse.name} to timetable!`, 'success');
        return [...prev, updatedCourse];
      }
    });
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  };

  // Filter commands
  const commands = [
    { name: "Go to Dashboard Home", description: "Open core statistics and Focus timer", action: () => { setTab('home'); setShowPalette(false); } },
    { name: "Go to Weekly Schedule", description: "Review and manage academic timetable", action: () => { setTab('schedule'); setShowPalette(false); } },
    { name: "Go to Assignment Manager", description: "Review study tasks and assignments", action: () => { setTab('tasks'); setShowPalette(false); } },
    { name: "Go to Study Notes & AI Summary", description: "Read, edit, and leverage AI Highlights", action: () => { setTab('notes'); setShowPalette(false); } },
    { name: "Go to Academic Settings", description: "Update profile, GPA targets, and metrics", action: () => { setTab('settings'); setShowPalette(false); } },
    { name: "Reset All App Storage", description: "Clear localized databases and preferences", action: () => { 
        localStorage.clear(); 
        setCourses([]); 
        setTasks([]); 
        setNotes([]); 
        setSettings(DEFAULT_SETTINGS); 
        setTab('welcome'); 
        setShowPalette(false); 
        showToast("All databases successfully reset.", "warning");
      } 
    }
  ];

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(paletteQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen mesh-gradient flex flex-col justify-between text-[#dae2fd] relative overflow-x-hidden selection:bg-[#6bfb9a]/30 selection:text-[#6bfb9a]">
      
      {/* Immersive Floating Aurora background blur circles */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#6bfb9a]/5 rounded-full blur-[140px] animate-aurora-1" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-[#8b5cf6]/6 rounded-full blur-[160px] animate-aurora-2" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[350px] h-[350px] bg-blue-500/3 rounded-full blur-[120px] animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {tab === 'welcome' ? (
          /* Premium Landing Screen inspired by Apple, Linear, and Stripe */
          <motion.main 
            key="welcome-landing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow flex flex-col items-center justify-center px-6 py-16 relative"
          >
            {/* Supressed header brand */}
            <header className="absolute top-0 w-full flex justify-between items-center max-w-5xl px-6 py-8 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-[#6bfb9a] rounded-full glow-pulse" />
                <span className="font-sans text-xs md:text-sm font-extrabold tracking-[0.2em] text-[#dae2fd] uppercase">
                  Aura Academic
                </span>
              </div>
              <div className="flex items-center gap-3">
                {showInstallBtn && (
                  <button 
                    onClick={handleInstallApp}
                    className="text-xs font-semibold text-[#6bfb9a] border border-[#6bfb9a]/20 bg-[#6bfb9a]/10 hover:bg-[#6bfb9a]/20 hover:border-[#6bfb9a]/40 px-4 py-2 rounded-full font-mono flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install App
                  </button>
                )}
                <button 
                  onClick={() => {
                    setTab('home');
                    showToast("Welcome back to Aura Suite!", "success");
                  }}
                  className="text-xs font-semibold hover:text-[#6bfb9a] transition-colors border border-white/5 bg-white/5 hover:bg-[#6bfb9a]/10 hover:border-[#6bfb9a]/20 px-4 py-2 rounded-full font-mono"
                >
                  Launch App
                </button>
              </div>
            </header>

            {/* Glowing circular icon with multiple orbiting rings */}
            <div className="relative mb-10 animate-slow-float mt-16">
              {/* Core glow blur */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#6bfb9a]/30 to-[#8b5cf6]/30 blur-3xl rounded-full scale-125" />
              
              {/* Double orbits */}
              <div className="absolute -inset-4 rounded-full border border-dashed border-white/5 animate-[spin_40s_linear_infinite]" />
              <div className="absolute -inset-8 rounded-full border border-dashed border-[#6bfb9a]/10 animate-[spin_60s_linear_infinite_reverse]" />

              <div className="glass-card p-7 rounded-full relative shadow-[0_0_60px_rgba(107,251,154,0.2)] border border-white/10">
                <Sparkles className="w-16 h-16 text-[#6bfb9a] animate-pulse" />
              </div>
            </div>

            {/* Headlines */}
            <div className="text-center max-w-3xl flex flex-col items-center z-10">
              <span className="px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-[#6bfb9a] bg-[#6bfb9a]/10 border border-[#6bfb9a]/20 mb-5 font-bold animate-pulse">
                The Student Mindspace • Redefined
              </span>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                Master Your Academic <br />
                <span className="bg-gradient-to-r from-[#6bfb9a] via-cyan-400 to-[#8b5cf6] bg-clip-text text-transparent italic font-serif">
                  Cognitive Flow
                </span>
              </h1>
              
              <p className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed mb-10">
                A highly-curated, minimal SaaS workspace engineered for peak focus, timetable tracking, and AI lecture synthesis. Step into the zone of deep study.
              </p>

              {/* Enter Button with magnetic feedback look */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={() => {
                    setTab('home');
                    showToast("Dashboard initiated.", "success");
                  }}
                  className="group relative flex items-center gap-3 px-8 py-4.5 bg-[#6bfb9a] text-black rounded-full transition-all duration-500 hover:scale-[1.04] hover:shadow-[0_0_40px_rgba(107,251,154,0.45)] font-bold text-xs uppercase tracking-widest active:scale-95 cursor-pointer"
                >
                  Enter Dashboard Workspace
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
                </button>
              </div>

              {/* Secondary link */}
              <button 
                onClick={() => {
                  setTab('home');
                  setTimeout(() => {
                    document.getElementById("lofi-ambient-player")?.scrollIntoView({ behavior: 'smooth' });
                  }, 300);
                }}
                className="group flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#6bfb9a] transition-colors mt-8 font-mono font-bold uppercase tracking-wider"
              >
                Listen to Focus Sounds
                <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* Bottom Bento Preview Glimpse */}
            <div className="absolute bottom-[-10px] w-full max-w-4xl hidden md:grid grid-cols-4 gap-4 opacity-25 select-none pointer-events-none mt-12">
              <div className="glass-card h-28 rounded-xl p-4 flex flex-col justify-end border-t border-[#6bfb9a]/20">
                <div className="w-10 h-1 bg-[#6bfb9a]/40 rounded mb-2" />
                <div className="w-20 h-1 bg-white/10 rounded" />
              </div>
              <div className="glass-card h-36 rounded-xl p-4 flex flex-col justify-end transform translate-y-[-10px] border-t border-purple-500/20">
                <div className="w-14 h-1 bg-purple-500/40 rounded mb-2" />
                <div className="w-28 h-1 bg-white/10 rounded" />
              </div>
              <div className="glass-card h-36 rounded-xl p-4 flex flex-col justify-end transform translate-y-[-10px] border-t border-blue-500/20">
                <div className="w-16 h-1 bg-blue-500/40 rounded mb-2" />
                <div className="w-24 h-1 bg-white/10 rounded" />
              </div>
              <div className="glass-card h-28 rounded-xl p-4 flex flex-col justify-end border-t border-[#6bfb9a]/20">
                <div className="w-8 h-1 bg-[#6bfb9a]/40 rounded mb-2" />
                <div className="w-16 h-1 bg-white/10 rounded" />
              </div>
            </div>
          </motion.main>
        ) : (
          /* Global Main Dashboard with Shared Navigation */
          <div className="flex-grow flex flex-col justify-between" key="dashboard-main">
            
            {/* Brand Header */}
            <header className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setTab('welcome')}>
                <div className="w-2.5 h-2.5 bg-[#6bfb9a] rounded-full glow-pulse group-hover:scale-125 transition-transform" />
                <span className="font-extrabold text-sm md:text-base font-sans tracking-widest text-[#dae2fd] uppercase group-hover:text-white transition-colors">
                  Aura <span className="text-[#6bfb9a] italic font-serif lowercase">academic</span>
                </span>
              </div>

              {/* Search & Global Controls */}
              <div className="flex items-center gap-2">
                {showInstallBtn && (
                  <button
                    onClick={handleInstallApp}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#6bfb9a]/10 border border-[#6bfb9a]/20 hover:border-[#6bfb9a]/40 text-xs text-[#6bfb9a] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer animate-pulse"
                    title="Install Aura Academic App"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Install App</span>
                  </button>
                )}

                <button
                  onClick={() => setShowPalette(true)}
                  className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-xs text-gray-400 hover:text-white transition-all font-mono"
                  title="Search & Quick Actions"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search commands...</span>
                  <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-[9px]">
                    <Command className="w-2.5 h-2.5" />
                    <span>K</span>
                  </div>
                </button>

                <button
                  onClick={() => setShowPalette(true)}
                  className="p-2 md:hidden text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/5"
                >
                  <Search className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    showToast("Workspace data synchronized.", "info");
                  }}
                  className="p-2 text-gray-400 hover:text-[#6bfb9a] rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all relative group"
                  title="Storage Status"
                >
                  <Bell className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#6bfb9a] rounded-full" />
                </button>
              </div>
            </header>

            {/* Dashboard Workspace */}
            <main className="flex-grow max-w-4xl w-full mx-auto px-4 md:px-6 py-8 pb-32">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {tab === 'home' && (
                    <HomeView 
                      courses={courses} 
                      setCourses={setCourses} 
                      tasks={tasks} 
                      settings={settings}
                      setTab={setTab}
                      showToast={showToast}
                      onEditCourse={(course) => {
                        setEditingCourse(course);
                        setIsCourseModalOpen(true);
                      }}
                      onDeleteCourse={(course) => {
                        setCourseToDelete(course);
                        setIsDeleteConfirmOpen(true);
                      }}
                      onAddClassOpen={() => {
                        setEditingCourse(null);
                        setIsCourseModalOpen(true);
                      }}
                    />
                  )}
                  {tab === 'schedule' && (
                    <ScheduleView 
                      courses={courses} 
                      setCourses={setCourses} 
                      tasks={tasks} 
                      settings={settings}
                      onAddClassOpen={() => {
                        setEditingCourse(null);
                        setIsCourseModalOpen(true);
                      }}
                      onEditCourse={(course) => {
                        setEditingCourse(course);
                        setIsCourseModalOpen(true);
                      }}
                      onDeleteCourse={(course) => {
                        setCourseToDelete(course);
                        setIsDeleteConfirmOpen(true);
                      }}
                    />
                  )}
                  {tab === 'tasks' && (
                    <TasksView 
                      tasks={tasks} 
                      setTasks={setTasks} 
                      courses={courses} 
                    />
                  )}
                  {tab === 'notes' && (
                    <NotesView 
                      notes={notes} 
                      setNotes={setNotes} 
                    />
                  )}
                  {tab === 'settings' && (
                    <SettingsView 
                      settings={settings} 
                      setSettings={setSettings} 
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Floating Glass Dock (Inspired by Apple & Arc) */}
            <nav className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
              <div className="glass-dock rounded-2xl px-3 py-2 flex items-center gap-1 md:gap-2 pointer-events-auto hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all max-w-md w-full justify-around">
                {[
                  { id: 'home', label: 'Home', icon: LayoutDashboard },
                  { id: 'schedule', label: 'Schedule', icon: Calendar },
                  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                  { id: 'notes', label: 'Notes', icon: Brain },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((item) => {
                  const IconComponent = item.icon;
                  const isActive = tab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTab(item.id);
                        showToast(`Switched to ${item.label} workspace`, 'info');
                      }}
                      className="flex flex-col items-center justify-center py-1.5 px-3 relative cursor-pointer group rounded-xl transition-all"
                    >
                      {/* Active highlight background glide */}
                      {isActive && (
                        <motion.div 
                          layoutId="active-dock-pill"
                          className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl -z-10 shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        />
                      )}
                      
                      <IconComponent className={`w-5 h-5 mb-0.5 transition-all duration-300 ${
                        isActive 
                          ? 'text-[#6bfb9a] scale-110 drop-shadow-[0_0_8px_rgba(107,251,154,0.4)]' 
                          : 'text-gray-400 group-hover:text-white group-hover:scale-105'
                      }`} />
                      
                      <span className={`text-[9px] font-bold tracking-wider uppercase font-mono ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-In Toast Notification Toaster */}
      <div className="fixed bottom-24 right-6 z-[60] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-xl p-3.5 border border-white/10 flex items-center justify-between gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto bg-[#0a0f1d]/90"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  toast.type === 'success' ? 'bg-[#6bfb9a] glow-pulse' :
                  toast.type === 'error' ? 'bg-red-500' :
                  toast.type === 'warning' ? 'bg-yellow-500 animate-pulse' : 'bg-cyan-400'
                }`} />
                <p className="text-xs font-semibold text-gray-200">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Ctrl+K Global Command Palette Dialog */}
      <AnimatePresence>
        {showPalette && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/70 backdrop-blur-md pt-[10vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.8)]"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-[#0a0f1d]/80">
                <Command className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Type a command or lookup view..."
                  value={paletteQuery}
                  onChange={e => setPaletteQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-white placeholder-gray-400 outline-none text-sm font-mono"
                  autoFocus
                />
                <button 
                  onClick={() => setShowPalette(false)}
                  className="text-gray-500 hover:text-white text-xs border border-white/5 px-2 py-1 rounded bg-white/5 font-mono"
                >
                  ESC
                </button>
              </div>

              {/* Commands List */}
              <div className="p-2 max-h-72 overflow-y-auto bg-[#030712]/40">
                {filteredCommands.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 font-mono">
                    No commands matched your query.
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={cmd.action}
                      className="w-full flex items-center justify-between text-left p-2.5 rounded-xl hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/5"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-200 group-hover:text-[#6bfb9a] transition-colors">
                          {cmd.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {cmd.description}
                        </p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 -rotate-90 group-hover:translate-x-1 duration-200" />
                    </button>
                  ))
                )}
              </div>

              {/* Footer status bar */}
              <div className="p-3 border-t border-white/5 bg-[#0a0f1d]/60 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Sparkle className="w-3 h-3 text-[#6bfb9a] animate-spin" />
                  <span>Interactive Command Engine</span>
                </div>
                <span>Ctrl+K to dismiss</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Universal Footer */}
      <footer className="w-full py-6 px-6 border-t border-white/5 text-center z-10 bg-[#030712]/60 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-4 text-xs mt-12">
        <p className="text-gray-400 font-medium font-mono">
          © 2026 Aura Academic Suite • Redesigned for World-Class Focus
        </p>
        <div className="flex gap-4 font-mono text-[11px]">
          <a href="#" className="text-gray-400 hover:text-[#6bfb9a] transition-colors">Privacy</a>
          <a href="#" className="text-gray-400 hover:text-[#6bfb9a] transition-colors">Terms</a>
          <a href="#" className="text-gray-400 hover:text-[#6bfb9a] transition-colors">Support</a>
        </div>
      </footer>

      {/* Reusable Course Modal (Create & Edit) */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
        editingCourse={editingCourse}
        courses={courses}
        showToast={showToast}
      />

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card rounded-2xl w-full max-w-sm overflow-hidden animate-scale-up border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#030712]">
            <div className="p-6 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 animate-scale-up">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">Confirm Deletion</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Are you sure you want to delete this class?
                </p>
                <p className="text-xs font-bold text-[#6bfb9a] mt-2 font-mono">
                  {courseToDelete.name} ({courseToDelete.code})
                </p>
              </div>
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setCourseToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (courseToDelete) {
                      setCourses(prev => prev.filter(c => c.id !== courseToDelete.id));
                      showToast?.(`Removed ${courseToDelete.name} from timetable.`, 'warning');
                    }
                    setIsDeleteConfirmOpen(false);
                    setCourseToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
