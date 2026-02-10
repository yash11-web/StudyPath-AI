import React, { useMemo } from 'react';
import { Sparkles, Calendar, CheckSquare, LayoutDashboard, MessageSquare, Zap, Quote } from 'lucide-react';
import { MOTIVATION_QUOTES } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'calendar' | 'tasks' | 'chat' | 'exam';
  onTabChange: (tab: 'dashboard' | 'calendar' | 'tasks' | 'chat' | 'exam') => void;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, showSidebar = true }) => {
  const dailyQuote = useMemo(() => {
    return MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
  }, []);

  if (!showSidebar) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'DASHBOARD' },
    { id: 'calendar', icon: Calendar, label: 'CALENDAR' },
    { id: 'tasks', icon: CheckSquare, label: 'TASKS' },
    { id: 'exam', icon: Zap, label: 'EXAM PREP' },
    { id: 'chat', icon: MessageSquare, label: 'AI TUTOR' }
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <aside className="w-24 lg:w-72 bg-white border-r border-slate-100 flex flex-col z-20 shadow-xl shadow-slate-200/20">
        <div className="p-10 flex items-center justify-center lg:justify-start gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
             <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 hidden lg:block tracking-tighter uppercase">StudyPath<span className="text-blue-600">AI</span></h1>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as any)}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block uppercase tracking-widest text-[10px]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8">
          <div className="bg-blue-50/50 p-6 rounded-3xl hidden lg:block border border-blue-100/50">
            <Quote className="w-5 h-5 text-blue-300 mb-3" />
            <p className="text-[11px] text-slate-600 font-bold leading-relaxed italic">
              "{dailyQuote}"
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {children}
      </main>
    </div>
  );
};

export default Layout;