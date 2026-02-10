import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import SyllabusInput from './components/SyllabusInput';
import PlanGenerator from './components/PlanGenerator';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import { Subject, UserPreferences, SyllabusData, Task, Priority, SUBJECT_COLORS } from './types';
import { generateStudyPlan } from './services/geminiService';
import { BookOpen, Plus, Sparkles, Edit3 } from 'lucide-react';

const App: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);
  const [view, setView] = useState<'selection' | 'upload' | 'setup' | 'dashboard'>('selection');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'tasks' | 'chat' | 'exam'>('dashboard');
  
  const [tempSyllabus, setTempSyllabus] = useState<SyllabusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('studypath_v6_subjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSubjects(parsed);
        if (parsed.length > 0) {
          setCurrentSubjectId(parsed[0].id);
          setView('dashboard');
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studypath_v6_subjects', JSON.stringify(subjects));
  }, [subjects]);

  const handleSyllabusSubmit = (syllabus: SyllabusData) => {
    setTempSyllabus(syllabus);
    setView('setup');
  };

  const handlePreferencesComplete = async (prefs: UserPreferences) => {
    if (!tempSyllabus) return;
    setIsLoading(true);
    try {
      const globalTasks = subjects.flatMap(s => s.plan.flatMap(w => w.tasks));
      const subjectName = tempSyllabus.fileName?.split('.')[0] || "New Subject";
      const aiPlan = await generateStudyPlan(subjectName, tempSyllabus.content, prefs, globalTasks);
      const color = SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length].bg;

      const newId = crypto.randomUUID();
      const processedPlan = aiPlan.map(week => ({
        ...week,
        tasks: week.tasks.map(t => ({
          ...t,
          id: crypto.randomUUID(),
          subjectId: newId,
          subjectName,
          color,
          isCompleted: false,
          weekNumber: week.weekNumber
        }))
      }));

      const newSubject: Subject = {
        id: newId,
        name: subjectName,
        color,
        syllabusContent: tempSyllabus.content,
        plan: processedPlan,
        preferences: prefs,
        createdAt: Date.now()
      };

      setSubjects(prev => [...prev, newSubject]);
      setCurrentSubjectId(newId);
      setView('dashboard');
      setActiveTab('dashboard');
    } catch (err) {
      alert("AI Generation failed. Check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskToggle = useCallback((taskId: string) => {
    setSubjects(prev => prev.map(s => ({
      ...s,
      plan: s.plan.map(w => ({
        ...w,
        tasks: w.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
      }))
    })));
  }, []);

  const handleTaskMove = useCallback((taskId: string, newDate: string) => {
    setSubjects(prev => prev.map(s => ({
      ...s,
      plan: s.plan.map(w => ({
        ...w,
        tasks: w.tasks.map(t => t.id === taskId ? { ...t, assignedDate: newDate } : t)
      }))
    })));
  }, []);

  const handleAddTask = (subjectId: string, data: Partial<Task>) => {
    setSubjects(prev => prev.map(s => {
      const targetId = subjectId || currentSubjectId;
      if (s.id !== targetId) return s;
      const newPlan = [...s.plan];
      if (newPlan.length === 0) {
        newPlan.push({ weekNumber: 1, theme: "Self-Paced Learning", tasks: [] });
      }
      newPlan[0].tasks.push({
        id: crypto.randomUUID(),
        subjectId: s.id,
        subjectName: s.name,
        color: s.color,
        title: data.title || "Untitled Task",
        description: data.description || "Manually added task",
        priority: data.priority || Priority.MEDIUM,
        estimatedMinutes: data.estimatedMinutes || 30,
        isCompleted: false,
        weekNumber: 1,
        assignedDate: data.assignedDate || new Date().toISOString().split('T')[0]
      });
      return { ...s, plan: newPlan };
    }));
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm("Delete this subject nexus? All progress will be cleared.")) {
      setSubjects(prev => {
        const next = prev.filter(s => s.id !== id);
        if (currentSubjectId === id) setCurrentSubjectId(next[0]?.id || null);
        if (next.length === 0) setView('selection');
        return next;
      });
    }
  };

  const handleUpdateSubjectName = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const currentSubject = subjects.find(s => s.id === currentSubjectId);

  if (view === 'selection' || (view === 'dashboard' && subjects.length === 0)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/10" />
        <div className="max-w-5xl w-full text-center space-y-16 animate-in zoom-in-95 duration-1000">
          <div className="space-y-6">
            <div className="bg-blue-600 text-white p-7 rounded-[2.5rem] shadow-2xl shadow-blue-200 inline-block mb-4 hover:rotate-12 transition-transform cursor-default">
               <Sparkles className="w-12 h-12" />
            </div>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase">StudyPath<span className="text-blue-600">AI</span></h1>
            <p className="text-xl text-slate-400 font-bold uppercase tracking-[0.3em] max-w-2xl mx-auto leading-relaxed">Intelligence-Driven Workspace</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl mx-auto">
             {subjects.map(s => (
               <div key={s.id} className="relative group">
                 <button onClick={() => { setCurrentSubjectId(s.id); setView('dashboard'); }} className="w-full bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 text-left hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                   <div className={`absolute top-0 left-0 w-2.5 h-full ${s.color} rounded-l-[3.5rem]`} />
                   <h3 className="font-black text-slate-900 text-xl mb-1 truncate pr-8">{s.name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.plan.length} Weeks Active</p>
                 </button>
                 <button onClick={() => {
                   const next = prompt("Enter new subject name:", s.name);
                   if (next) handleUpdateSubjectName(s.id, next);
                 }} className="absolute top-8 right-8 p-3 text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100">
                    <Edit3 className="w-4 h-4" />
                 </button>
               </div>
             ))}
             <button 
              onClick={() => setView('upload')}
              className="bg-white p-12 rounded-[3.5rem] border-2 border-dashed border-slate-200 text-slate-300 hover:border-blue-400 hover:text-blue-600 transition-all flex flex-col items-center justify-center gap-4 group shadow-sm hover:shadow-xl"
             >
               <Plus className="w-10 h-10 group-hover:scale-110 transition-transform" />
               <span className="font-black uppercase tracking-widest text-[10px]">Add Subject</span>
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'upload' || view === 'setup') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <button onClick={() => setView('selection')} className="mb-12 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-[0.3em] transition-colors">← Cancel Session</button>
          {view === 'upload' ? <SyllabusInput onSubmit={handleSyllabusSubmit} isLoading={isLoading} /> : <PlanGenerator onComplete={handlePreferencesComplete} isLoading={isLoading} />}
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab as any} onTabChange={setActiveTab as any}>
      <div className="h-full flex flex-col overflow-hidden relative">
        <header className="px-12 py-8 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-6">
             <div className={`${currentSubject?.color || 'bg-blue-600'} p-3.5 rounded-2xl shadow-xl shadow-slate-100`}>
               <BookOpen className="w-7 h-7 text-white" />
             </div>
             <div>
               <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase truncate max-w-[300px]">{currentSubject?.name}</h2>
                 <button onClick={() => {
                   const next = prompt("Rename subject:", currentSubject?.name);
                   if (next && currentSubjectId) handleUpdateSubjectName(currentSubjectId, next);
                 }} className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                   <Edit3 className="w-3.5 h-3.5" />
                 </button>
               </div>
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Workspace</span>
             </div>
          </div>
          <button onClick={() => setView('selection')} className="text-[10px] font-black text-slate-400 hover:text-slate-900 bg-slate-50 px-8 py-3.5 rounded-2xl transition-all uppercase tracking-widest border border-slate-100 shadow-sm">Workspace</button>
        </header>

        <div className="flex-1 overflow-auto">
          {activeTab === 'chat' && currentSubject ? (
            <div className="p-12 max-w-6xl mx-auto h-full flex flex-col">
              <ChatBot subject={currentSubject} />
            </div>
          ) : (
            <Dashboard 
              subjects={subjects}
              currentSubjectId={currentSubjectId}
              onTaskToggle={handleTaskToggle} 
              onTaskMove={handleTaskMove}
              onAddTask={handleAddTask}
              onDeleteSubject={handleDeleteSubject}
              onUpdateSubjectName={handleUpdateSubjectName} 
              activeView={activeTab as any} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;