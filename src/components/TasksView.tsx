import React, { useState } from 'react';
import { Task, Course } from '../types';
import { 
  Plus, 
  CheckSquare, 
  Square, 
  Calendar, 
  BarChart2, 
  Star, 
  Trash2, 
  Clock, 
  Check, 
  Play, 
  PlusCircle, 
  AlertCircle,
  TrendingUp,
  Bookmark,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  courses: Course[];
}

export default function TasksView({ tasks, setTasks, courses }: TasksViewProps) {
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCourseId, setTaskCourseId] = useState("");
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskIntensity, setTaskIntensity] = useState(3);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Toggle Task Completion
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'pending' ? 'completed' : 'pending' };
      }
      return t;
    }));
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Create Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: Task = {
      id: 'task_' + Date.now(),
      title: taskTitle,
      courseId: taskCourseId || undefined,
      dueDate: taskDueDate,
      status: 'pending',
      studyIntensity: Number(taskIntensity)
    };

    setTasks(prev => [newTask, ...prev]);
    setShowAddTaskForm(false);
    setTaskTitle("");
    setTaskCourseId("");
    setTaskIntensity(3);
  };

  // Find course details for a task
  const getCourseName = (courseId?: string) => {
    if (!courseId) return "General Study";
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : "General Study";
  };

  const getCourseColor = (courseId?: string) => {
    if (!courseId) return "#6bfb9a"; // default mint
    const course = courses.find(c => c.id === courseId);
    return course ? course.color : "#6bfb9a";
  };

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dynamicIntensityValues = [4.5, 3.0, 6.0, 1.5, 0.0, 2.5, 4.0]; // base values
  // Adjust based on pending tasks
  pendingTasks.forEach(t => {
    const dayIndex = new Date(t.dueDate).getDay(); // 0=Sun, 1=Mon...
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    if (adjustedIndex >= 0 && adjustedIndex < 7) {
      dynamicIntensityValues[adjustedIndex] += t.studyIntensity * 0.5;
    }
  });

  const maxIntensity = Math.max(...dynamicIntensityValues, 8);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in" id="tasks-manager-view">
      
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-widest text-[#6bfb9a] bg-[#6bfb9a]/10 border border-[#6bfb9a]/20 uppercase">
            Assignment Pipeline
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1.5 font-serif italic">Your Academic Assignments</h2>
          <p className="text-xs font-mono text-gray-400 flex items-center gap-1.5 mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#6bfb9a] glow-pulse" />
            Current Load: <span className="font-bold text-[#6bfb9a]">{pendingTasks.length} pending milestone deliverables</span>
          </p>
        </div>
        
        <button
          onClick={() => setShowAddTaskForm(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#6bfb9a] text-black rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(107,251,154,0.45)] cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      {/* Study Intensity Bar Chart */}
      <div className="glass-card rounded-2xl p-6 flex flex-col gap-5 border border-white/5">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#6bfb9a]" />
              Estimated Study Demand
            </h3>
            <span className="text-[9px] font-mono font-bold text-[#6bfb9a] bg-[#6bfb9a]/10 border border-[#6bfb9a]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Weekly Allocation Index
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Simulated workload distribution hours based on pending assignment intensity.</p>
        </div>

        {/* Bar Chart Representation */}
        <div className="flex items-end justify-between h-36 pt-4 px-2 bg-black/45 rounded-xl border border-white/5 relative overflow-hidden">
          {daysOfWeek.map((day, index) => {
            const heightPercentage = (dynamicIntensityValues[index] / maxIntensity) * 100;
            return (
              <div key={day} className="flex flex-col items-center gap-2 group w-full relative z-10">
                <div className="relative w-4 md:w-6 h-20 flex items-end">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-[#0a0f1d] border border-white/10 text-white text-[9px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 z-20 pointer-events-none whitespace-nowrap">
                    {dynamicIntensityValues[index].toFixed(1)} hrs
                  </div>
                  
                  {/* Bar with gradient and drop shadow glow */}
                  <div 
                    className="w-full bg-gradient-to-t from-purple-500/30 to-[#6bfb9a] rounded-t-md transition-all duration-500 ease-out shadow-[0_0_8px_rgba(107,251,154,0.1)] group-hover:shadow-[0_0_15px_rgba(107,251,154,0.45)]"
                    style={{ height: `${Math.max(heightPercentage, 6)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-500 font-bold group-hover:text-white transition-colors">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Creation Inline Modal */}
      {showAddTaskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card rounded-2xl w-full max-w-md overflow-hidden animate-scale-up border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#030712]">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
              <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">New Academic Assignment</h3>
              <button 
                onClick={() => setShowAddTaskForm(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-4 flex flex-col gap-3.5">
              <div>
                <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Write Literature Review & Outline"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                  Associated Course
                </label>
                <select
                  value={taskCourseId}
                  onChange={e => setTaskCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
                >
                  <option value="">General / Independent Study</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                    Study Demand (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={taskIntensity}
                    onChange={e => setTaskIntensity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6bfb9a] text-sm font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-[#6bfb9a] text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                Register study assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pending / In Progress Tasks */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono flex items-center justify-between border-b border-white/5 pb-2">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 glow-pulse" />
            In Progress milestones
          </span>
          <span>{pendingTasks.length} active</span>
        </h3>

        {pendingTasks.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4 border border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#6bfb9a] animate-pulse">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-white font-bold font-mono uppercase tracking-wider">All Deliverables Complete</p>
              <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
                Outstanding tasks are fully processed! Use this free space to explore new study notes or schedule future academic semesters.
              </p>
            </div>
            <button
              onClick={() => setShowAddTaskForm(true)}
              className="mt-2 px-5 py-2.5 bg-[#6bfb9a] hover:bg-[#6bfb9a]/90 text-black font-extrabold text-[10px] font-mono tracking-widest rounded-full hover:scale-105 transition-all uppercase"
            >
              + Create First Assignment
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingTasks.map((task) => (
              <div 
                key={task.id}
                className="glass-card rounded-2xl p-4.5 flex items-center justify-between gap-4 group border-l-4 hover:border-l-8 duration-300 hover:bg-white/[0.02]"
                style={{ borderLeftColor: getCourseColor(task.courseId) }}
              >
                <div className="flex items-start gap-3.5">
                  <button 
                    onClick={() => handleToggleTask(task.id)}
                    className="text-gray-500 hover:text-[#6bfb9a] transition-all shrink-0 mt-0.5 cursor-pointer hover:scale-115"
                    title="Complete Assignment"
                  >
                    <Square className="w-5 h-5 text-gray-400" />
                  </button>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: getCourseColor(task.courseId) }}>
                        {getCourseName(task.courseId)}
                      </span>
                      <span className="text-[10px] text-gray-600 font-mono">•</span>
                      <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" /> Due: {task.dueDate}
                      </span>
                      <span className="text-[10px] text-gray-600 font-mono">•</span>
                      <span className="text-[10px] font-mono font-bold text-[#6bfb9a] bg-[#6bfb9a]/5 border border-[#6bfb9a]/15 px-1.5 py-0.5 rounded">
                        Demand: {task.studyIntensity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono flex items-center justify-between border-b border-white/5 pb-2">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Completed Milestones
            </span>
            <span>{completedTasks.length} archived</span>
          </h3>

          <div className="flex flex-col gap-2.5 opacity-60">
            {completedTasks.map((task) => (
              <div 
                key={task.id}
                className="glass-card rounded-xl p-3.5 flex items-center justify-between gap-3 group bg-white/[0.01] hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleToggleTask(task.id)}
                    className="text-[#6bfb9a] hover:text-gray-400 transition-all shrink-0 mt-0.5 cursor-pointer hover:scale-115"
                    title="Re-open Assignment"
                  >
                    <CheckSquare className="w-5 h-5 text-[#6bfb9a] fill-[#6bfb9a]/10" />
                  </button>
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-gray-400 line-through leading-snug">{task.title}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">
                      Archived • {getCourseName(task.courseId)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
