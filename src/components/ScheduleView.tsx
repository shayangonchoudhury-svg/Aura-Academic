import React, { useState } from 'react';
import { Course, Task, AcademicSettings } from '../types';
import { 
  Calendar, 
  Plus, 
  Clock, 
  ChevronRight, 
  BarChart2, 
  Star, 
  PlusCircle, 
  CheckSquare, 
  Sparkles,
  Award,
  TrendingUp,
  MapPin,
  Compass,
  Zap,
  Edit,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleViewProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  tasks: Task[];
  settings: AcademicSettings;
  onAddClassOpen: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
}

export default function ScheduleView({ courses, setCourses, tasks, settings, onAddClassOpen, onEditCourse, onDeleteCourse }: ScheduleViewProps) {
  // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat, 7 = Sun
  const todayRaw = new Date().getDay();
  const currentDayOfWeek = todayRaw === 0 ? 7 : todayRaw;
  const [selectedDay, setSelectedDay] = useState<number>(currentDayOfWeek);

  // Get dynamic dates for Monday to Sunday of the current week
  const todayDate = new Date();
  const currentDayIndex = todayDate.getDay();
  const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
  const mondayDate = new Date(todayDate);
  mondayDate.setDate(todayDate.getDate() + mondayOffset);

  const daysList = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((label, i) => {
    const dayDate = new Date(mondayDate);
    dayDate.setDate(mondayDate.getDate() + i);
    return {
      label,
      num: i + 1,
      dateNum: dayDate.getDate()
    };
  });

  const currentMonthYear = todayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get courses for selected day
  const filteredCourses = courses
    .filter(c => c.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Study hours stats
  const totalStudyHours = courses.length * 1.5 + (tasks.length * 2);
  const consistencyRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0;

  // Calculate Tomorrow's Highlights
  const tomorrowDayNum = selectedDay === 7 ? 1 : selectedDay + 1;
  const tomorrowCourses = courses.filter(c => c.dayOfWeek === tomorrowDayNum);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in" id="schedule-flow-view">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-widest text-[#6bfb9a] bg-[#6bfb9a]/10 border border-[#6bfb9a]/20 uppercase">
            Timetable Flow
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1.5 font-serif italic">
            Your Academic Schedule
          </h2>
        </div>

        {/* Month Selector Bar */}
        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/5 rounded-xl self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-[#6bfb9a]" />
          <span className="text-xs font-mono font-bold text-gray-200">{currentMonthYear}</span>
        </div>
      </div>

      {/* Horizontal Scroll Days Slider */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-3">
        {daysList.map((day) => {
          const isSelected = selectedDay === day.num;
          const isCurrentToday = currentDayOfWeek === day.num;

          return (
            <button
              key={day.num}
              onClick={() => setSelectedDay(day.num)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-300 relative cursor-pointer ${
                isSelected
                  ? 'bg-[#6bfb9a] text-black border-[#6bfb9a] font-bold shadow-[0_0_20px_rgba(107,251,154,0.45)] scale-105 z-10'
                  : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:border-white/10 hover:scale-102'
              }`}
            >
              <span className={`text-[9px] font-mono font-extrabold tracking-wider mb-1 ${isSelected ? 'text-black' : 'text-gray-400'}`}>
                {day.label}
              </span>
              <span className="text-base font-extrabold font-mono">
                {day.dateNum}
              </span>
              {/* Pulsing indicator if today */}
              {isCurrentToday && !isSelected && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-[#6bfb9a] rounded-full glow-pulse" />
              )}
              {isSelected && (
                <div className="absolute bottom-1.5 w-1 h-1 bg-black rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Class Schedule for the Selected Day */}
      <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#6bfb9a]/1 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
            Courses for {daysList.find(d => d.num === selectedDay)?.label} timetable
          </span>
          <span className="text-xs font-mono text-[#6bfb9a] font-bold px-2 py-0.5 rounded-full bg-[#6bfb9a]/10 border border-[#6bfb9a]/20">
            {filteredCourses.length} Lectures
          </span>
        </div>

        <div className="relative z-10">
          {filteredCourses.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 animate-pulse">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white font-mono uppercase tracking-wider">No Scheduled Classes</p>
                <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
                  Your academic calendar is completely clear for this date. Perfect window for deep focus sessions or catch-up work.
                </p>
              </div>
              <button 
                onClick={onAddClassOpen}
                className="mt-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-[10px] font-mono tracking-widest rounded-full hover:scale-105 transition-all uppercase"
              >
                + Register Class
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {filteredCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="p-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border-l-4 flex items-start justify-between gap-4 transition-all hover:translate-x-1 group"
                  style={{ borderLeftColor: course.color }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-mono font-bold text-[#6bfb9a] px-2 py-0.5 rounded bg-white/5 border border-white/5" style={{ color: course.color }}>
                        {course.code}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {course.startTime} - {course.endTime}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{course.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-1.5 font-mono">
                      {course.instructor && (
                        <span className="bg-white/5 px-2 py-0.5 rounded text-gray-300">Prof. {course.instructor}</span>
                      )}
                      {course.room && (
                        <span className="text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-500" /> {course.room}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all shrink-0">
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Progress Analytics */}
      <div className="glass-card rounded-2xl p-6 flex flex-col gap-5 border border-white/5">
        <div className="flex items-center gap-2 text-white">
          <BarChart2 className="w-4.5 h-4.5 text-[#6bfb9a]" />
          <h3 className="text-xs font-bold tracking-widest uppercase font-mono">Weekly Analytics Summary</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 block">
              Estimated Total Study Hours
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono text-white">{totalStudyHours.toFixed(1)}</span>
                <span className="text-[10px] font-mono text-gray-400">Hrs</span>
              </div>
              <span className="text-[10px] font-mono text-[#6bfb9a] bg-[#6bfb9a]/10 px-2 py-0.5 rounded font-bold flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +12%</span>
            </div>
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 block">
              Timetable Task Consistency
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold font-mono text-white">{consistencyRate}%</span>
              <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Elite Tier
              </span>
            </div>
          </div>
        </div>

        {/* Motivational Prompt */}
        <div className="p-4 bg-[#6bfb9a]/5 rounded-xl border border-[#6bfb9a]/10 flex items-start gap-3">
          <Sparkles className="w-4.5 h-4.5 text-[#6bfb9a] shrink-0 mt-0.5 animate-pulse" />
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            "Your academic velocity is compounding. Maintaining this week's timetable rhythm puts you 4.2 hours ahead of your mid-term preparation milestone."
          </p>
        </div>
      </div>

      {/* Tomorrow's Highlights */}
      <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 border border-white/5">
        <h4 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold">
          Tomorrow's Timetable Highlights
        </h4>
        
        {tomorrowCourses.length === 0 ? (
          <div className="p-4 bg-white/[0.01] rounded-xl border border-dashed border-white/5 text-center">
            <p className="text-xs text-gray-400 font-mono">No upcoming lectures or laboratory sessions tomorrow.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tomorrowCourses.slice(0, 3).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-xl text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: course.color }} />
                  <div>
                    <span className="font-bold text-white">{course.name}</span>
                    <span className="text-[10px] text-gray-400 ml-2 font-mono">{course.code}</span>
                  </div>
                </div>
                <span className="font-mono text-gray-300 font-bold bg-white/5 px-2.5 py-1 rounded border border-white/5">{course.startTime}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
