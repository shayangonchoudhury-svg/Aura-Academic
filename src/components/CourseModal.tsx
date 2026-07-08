import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { X } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  editingCourse: Course | null;
  courses: Course[];
  showToast?: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export default function CourseModal({
  isOpen,
  onClose,
  onSave,
  editingCourse,
  courses,
  showToast
}: CourseModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [instructor, setInstructor] = useState("");
  const [room, setRoom] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:30");
  const [color, setColor] = useState("#6bfb9a");

  useEffect(() => {
    if (editingCourse) {
      setName(editingCourse.name);
      setCode(editingCourse.code);
      setInstructor(editingCourse.instructor || "");
      setRoom(editingCourse.room || "");
      setDayOfWeek(editingCourse.dayOfWeek);
      setStartTime(editingCourse.startTime);
      setEndTime(editingCourse.endTime);
      setColor(editingCourse.color);
    } else {
      setName("");
      setCode("");
      setInstructor("");
      setRoom("");
      setDayOfWeek(1);
      setStartTime("09:00");
      setEndTime("10:30");
      setColor("#6bfb9a");
    }
  }, [editingCourse, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast?.("Course name cannot be empty.", "error");
      return;
    }
    if (!code.trim()) {
      showToast?.("Course code cannot be empty.", "error");
      return;
    }

    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);

    if (endMins <= startMins) {
      showToast?.("End time must be after start time.", "error");
      return;
    }

    // Overlap validation
    const hasOverlap = courses.some(c => {
      if (editingCourse && c.id === editingCourse.id) return false;
      if (c.dayOfWeek !== dayOfWeek) return false;

      const cStart = parseTimeToMinutes(c.startTime);
      const cEnd = parseTimeToMinutes(c.endTime);

      return startMins < cEnd && cStart < endMins;
    });

    if (hasOverlap) {
      showToast?.("A class already exists during this time slot on this day.", "error");
      return;
    }

    const savedCourse: Course = {
      id: editingCourse ? editingCourse.id : 'course_' + Date.now(),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      instructor: instructor.trim(),
      room: room.trim(),
      dayOfWeek: dayOfWeek,
      startTime,
      endTime,
      color
    };

    onSave(savedCourse);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card rounded-2xl w-full max-w-md overflow-hidden animate-scale-up border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#030712]">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">
            {editingCourse ? "Edit Academic Course" : "Register Academic Course"}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleFormSubmit} className="p-4 flex flex-col gap-3">
          <div>
            <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
              Course / Lecture Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Advanced Calculus & Topology"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MATH-301"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(Number(e.target.value))}
                className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
                <option value={7}>Sunday</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
              Instructor / Professor
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Roberts"
              value={instructor}
              onChange={e => setInstructor(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                Room / Lecture Hall
              </label>
              <input
                type="text"
                placeholder="e.g. Euler Hall 402"
                value={room}
                onChange={e => setRoom(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-1.5 mt-1">
                {["#6bfb9a", "#bdc2ff", "#ffd6d9", "#f59e0b", "#3b82f6", "#ec4899"].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                      color === col ? 'border-white scale-120' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 bg-[#6bfb9a] text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
          >
            {editingCourse ? "Save Changes" : "Register timetabled class"}
          </button>
        </form>
      </div>
    </div>
  );
}
