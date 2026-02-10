import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, AlertTriangle, Play, Pause, RotateCcw, Plus, Trash2, Edit3, Settings, Zap, BookOpen, ChevronLeft, ChevronRight, FileText, Loader2, Sparkles, Bell, Calendar as CalIcon, Layers, RefreshCw, PlusCircle } from 'lucide-react';
import { Subject, Task, Priority, SUBJECT_COLORS, Flashcard } from '../types';
import { generateExamPrep } from '../services/geminiService';
import ResourceLinks from './ResourceLinks';

interface DashboardProps {
  subjects: Subject[];
  currentSubjectId: string | null;
  onTaskToggle: (taskId: string) => void;
  onTaskMove: (taskId: string, newDate: string) => void;
  onAddTask: (subjectId: string, data: Partial<Task>) => void;
  onDeleteSubject: (id: string) => void;
  onUpdateSubjectName: (id: string, newName: string) => void;
  activeView: 'dashboard' | 'calendar' | 'tasks' | 'exam';
}

const Dashboard: React.FC<DashboardProps> = ({ 
  subjects, 
  currentSubjectId, 
  onTaskToggle, 
  onTaskMove,
  onAddTask, 
  onDeleteSubject, 
  onUpdateSubjectName,
  activeView 
}) => {
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [showAddTaskModal, setShowAddTaskModal] = useState<{show: boolean, date?: string}>({show: false});
  const [newTaskData, setNewTaskData] = useState({ title: '', duration: 30, time: '09:00', priority: Priority.MEDIUM });

  const [examData, setExamData] = useState<{questions: string[], summaries: string[], flashcards: Flashcard[]} | null>(null);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const allTasks = useMemo(() => subjects.flatMap(s => s.plan.flatMap(w => w.tasks)), [subjects]);
  const currentSubject = subjects.find(s => s.id === currentSubjectId);

  const stats = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.isCompleted).length;
    return {
      total,
      completed,
      percentage: total ? Math.round((completed / total) * 100) : 0,
      upcoming: allTasks.filter(t => !t.isCompleted && new Date(t.assignedDate) >= new Date()).length
    };
  }, [allTasks]);

  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(d => ({
      name: d,
      completed: Math.floor(Math.random() * 5),
      planned: Math.floor(Math.random() * 8)
    }));
  }, [allTasks]);

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleGenerateExam = async () => {
    if (!currentSubject) return;
    setIsGeneratingExam(true);
    try {
      const data = await generateExamPrep(currentSubject.name, currentSubject.syllabusContent);
      setExamData(data);
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const renderAnalytics = () => (
    <div className="p-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Productivity Hub</h2>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-[10px] font-black uppercase text-slate-400 tracking-widest">
             <Bell className="w-3.5 h-3.5 text-blue-500" /> {stats.upcoming} Reminders
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Mastery Score', val: `${stats.percentage}%`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Task Load', val: stats.total, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Sessions Run', val: stats.completed, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Remaining', val: stats.total - stats.completed, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">{s.val}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">Completion Velocity</h3>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                  <YAxis hide />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="completed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-center">
            <div className="text-center relative z-10">
              <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Flow Session</h3>
              <div className="text-7xl font-black text-white mb-12 font-mono tracking-tighter tabular-nums">{formatTime(timer)}</div>
              <div className="flex justify-center gap-4">
                <button onClick={() => setIsActive(!isActive)} className="bg-blue-600 text-white p-5 rounded-2xl hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                  {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <button onClick={() => {setTimer(25*60); setIsActive(false);}} className="bg-slate-800 text-slate-400 p-5 rounded-2xl hover:bg-slate-700 transition-colors">
                  <RotateCcw className="w-6 h-6" />
                </button>
                <button onClick={() => setShowTimerSettings(!showTimerSettings)} className="bg-slate-800 text-slate-400 p-5 rounded-2xl hover:bg-slate-700 transition-colors">
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>
            {showTimerSettings && (
               <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm p-10 flex flex-col justify-center animate-in fade-in">
                  <h4 className="text-white font-black text-center mb-6 text-sm uppercase tracking-widest">Adjust Duration</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[25, 45, 60].map(m => (
                      <button key={m} onClick={() => {setTimer(m*60); setShowTimerSettings(false);}} className="bg-slate-800 text-white py-4 rounded-xl text-[10px] font-black hover:bg-blue-600 uppercase">
                        {m}m
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowTimerSettings(false)} className="mt-6 text-slate-500 font-bold text-xs uppercase tracking-widest">Back</button>
               </div>
            )}
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const calendarDays = [];
    for (let i = 0; i < startOffset; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(year, month, i));

    return (
      <div className="p-10 animate-in fade-in duration-700">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Calendar</h2>
            <p className="text-slate-400 font-bold text-xs tracking-widest uppercase mt-1">Timeline Management</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <span className="font-black text-slate-900 text-sm min-w-[150px] text-center uppercase tracking-widest">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-400 tracking-[0.2em] mb-4 uppercase">{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            if (!day) return <div key={i} className="min-h-[150px] opacity-10 bg-slate-200 rounded-[2rem]" />;
            const dateStr = day.toISOString().split('T')[0];
            const dayTasks = allTasks.filter(t => t.assignedDate === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div 
                key={i} 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const tid = e.dataTransfer.getData('taskId');
                  if (tid) onTaskMove(tid, dateStr);
                }}
                className={`min-h-[150px] bg-white rounded-[2rem] p-5 border-2 transition-all group relative flex flex-col ${
                  isToday ? 'border-blue-600 shadow-xl shadow-blue-50' : 'border-slate-50 hover:border-blue-100'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[10px] font-black ${isToday ? 'text-blue-600' : 'text-slate-300'}`}>{day.getDate()}</span>
                  <button onClick={() => setShowAddTaskModal({show: true, date: dateStr})} className="p-1 rounded-lg text-slate-200 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-[90px] pr-1">
                  {dayTasks.map(t => (
                    <div 
                      key={t.id} 
                      draggable 
                      onDragStart={(e) => {
                        e.dataTransfer.setData('taskId', t.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`text-[9px] p-2.5 rounded-xl font-bold truncate cursor-grab active:cursor-grabbing border ${
                        t.isCompleted ? 'bg-slate-50 text-slate-300 border-slate-50 grayscale' : `${t.color} text-white border-transparent shadow-sm`
                      }`}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {showAddTaskModal.show && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl animate-in zoom-in-95">
               <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Manual Integration</h3>
               <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Task Title</label>
                    <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none text-sm font-bold focus:ring-2 focus:ring-blue-500" placeholder="Session objective..." value={newTaskData.title} onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Duration</label>
                       <input type="number" className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none text-sm font-bold" value={newTaskData.duration} onChange={e => setNewTaskData({...newTaskData, duration: parseInt(e.target.value)})} />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Priority</label>
                       <select className="w-full bg-slate-50 p-4 rounded-2xl border-none outline-none text-xs font-black uppercase" value={newTaskData.priority} onChange={e => setNewTaskData({...newTaskData, priority: e.target.value as any})}>
                          <option value={Priority.HIGH}>High</option>
                          <option value={Priority.MEDIUM}>Medium</option>
                          <option value={Priority.LOW}>Low</option>
                       </select>
                     </div>
                  </div>
               </div>
               <div className="mt-10 flex gap-4">
                  <button onClick={() => setShowAddTaskModal({show: false})} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                  <button onClick={() => {
                    onAddTask(currentSubjectId || '', { title: newTaskData.title, estimatedMinutes: newTaskData.duration, assignedDate: showAddTaskModal.date, priority: newTaskData.priority });
                    setShowAddTaskModal({show: false});
                  }} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-200 hover:bg-blue-700">Integrate</button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExamPrep = () => (
    <div className="p-10 max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-8">
       <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Exam Prep</h2>
          <button onClick={handleGenerateExam} disabled={isGeneratingExam} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50">
            {isGeneratingExam ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh High-Yield
          </button>
       </div>

       <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-[2.5rem] flex gap-6 items-center">
          <div className="bg-amber-100 p-3.5 rounded-2xl"><AlertTriangle className="text-amber-600 w-5 h-5" /></div>
          <p className="text-amber-900/80 text-[11px] font-black uppercase tracking-widest leading-relaxed">
            Note: Quick Revision tool. For mastery, use the Tasks section.
          </p>
       </div>

       {examData ? (
         <div className="space-y-12">
            <div className="flex flex-col items-center gap-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Flashcards</h3>
              <div onClick={() => setIsFlipped(!isFlipped)} className="w-full max-w-lg h-72 cursor-pointer perspective-1000 relative">
                <div className={`w-full h-full transition-all duration-700 transform-style-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 bg-white border border-slate-100 rounded-[3rem] shadow-xl p-12 flex flex-col items-center justify-center text-center backface-hidden">
                     <p className="text-xl font-bold text-slate-800 leading-relaxed">{examData.flashcards[currentFlashcardIdx]?.question}</p>
                     <span className="mt-8 text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-50">Click to Flip</span>
                  </div>
                  <div className="absolute inset-0 bg-blue-600 rounded-[3rem] shadow-xl p-12 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180">
                     <p className="text-lg font-bold text-white leading-relaxed">{examData.flashcards[currentFlashcardIdx]?.answer}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <button onClick={(e) => {e.stopPropagation(); setCurrentFlashcardIdx((prev) => (prev - 1 + examData.flashcards.length) % examData.flashcards.length); setIsFlipped(false);}} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                <span className="text-xs font-black text-slate-400">{currentFlashcardIdx + 1} / {examData.flashcards.length}</span>
                <button onClick={(e) => {e.stopPropagation(); setCurrentFlashcardIdx((prev) => (prev + 1) % examData.flashcards.length); setIsFlipped(false);}} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" /> Target Questions</h3>
                  <div className="space-y-4">
                    {examData.questions.map((q, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm font-medium text-slate-700 leading-relaxed hover:border-indigo-100 transition-colors">
                        <span className="text-blue-600 font-black mr-2 text-[10px]">Q{i+1}.</span> {q}
                      </div>
                    ))}
                  </div>
               </div>
               <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><BookOpen className="w-4 h-4 text-green-600" /> Key Summaries</h3>
                  <div className="space-y-4">
                    {examData.summaries.map((s, i) => (
                      <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500 rounded-l-3xl opacity-20 group-hover:opacity-100 transition-opacity" />
                        <p className="text-slate-700 font-medium leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
         </div>
       ) : (
         <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 border-dashed flex flex-col items-center">
            {isGeneratingExam ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synthesizing Core Knowledge...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <Sparkles className="w-12 h-12 text-slate-200" />
                <div>
                  <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">No Prep Data</h3>
                  <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mt-1">Ignite forge to start</p>
                </div>
              </div>
            )}
         </div>
       )}
    </div>
  );

  const renderTasks = () => (
    <div className="p-10 max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Task Mastery</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Full Curriculum Hub</p>
        </div>
        <button onClick={() => setShowAddTaskModal({show: true})} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Add Task
        </button>
      </div>

      {currentSubject?.plan.map((week) => (
        <div key={week.weekNumber} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="bg-slate-50/50 px-10 py-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-white w-14 h-14 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-blue-600">
                {week.weekNumber}
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{week.theme}</h3>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{week.tasks.filter(t => t.isCompleted).length} / {week.tasks.length} Completed</span>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {week.tasks.map((task) => (
              <div key={task.id} className="p-10 hover:bg-slate-50/20 transition-all group">
                <div className="flex items-start gap-8">
                  <button onClick={() => onTaskToggle(task.id)} className={`mt-1 w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-100' : 'border-slate-100 hover:border-blue-500 text-transparent'}`}>
                    <CheckCircle className="w-6 h-6" />
                  </button>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                       <h4 className={`text-xl font-black text-slate-800 tracking-tight ${task.isCompleted ? 'line-through text-slate-200' : ''}`}>{task.title}</h4>
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${task.priority === Priority.HIGH ? 'bg-rose-50 text-rose-600 border-rose-100' : task.priority === Priority.MEDIUM ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                         {task.priority}
                       </span>
                    </div>
                    <p className="text-slate-500 text-base font-medium leading-relaxed mb-8 max-w-3xl">{task.description}</p>
                    <div className="flex items-center gap-8">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5"><Clock className="w-4 h-4" /> {task.estimatedMinutes} M</div>
                       <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2.5"><CalIcon className="w-4 h-4" /> {task.assignedDate}</div>
                       <button onClick={() => {setTimer(task.estimatedMinutes * 60); setIsActive(true);}} className="text-[10px] font-black text-slate-900 hover:text-blue-600 uppercase flex items-center gap-2.5 group-hover:translate-x-2 transition-transform">
                         <Play className="w-3.5 h-3.5" /> Start Flow
                       </button>
                    </div>
                    {!task.isCompleted && <ResourceLinks topic={task.title} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (activeView === 'tasks') return renderTasks();
  if (activeView === 'calendar') return renderCalendar();
  if (activeView === 'exam') return renderExamPrep();
  return renderAnalytics();
};

export default Dashboard;