import React, { useState } from 'react';
import { UserPreferences, SUPPORTED_DAYS, SyllabusData } from '../types';
import { ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react';

interface PlanGeneratorProps {
  onComplete: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const PlanGenerator: React.FC<PlanGeneratorProps> = ({ onComplete, isLoading }) => {
  const [prefs, setPrefs] = useState<UserPreferences>({
    studyDays: ["Monday", "Wednesday", "Friday"],
    hoursPerDay: 2,
    durationWeeks: 4,
    startDate: new Date().toISOString().split('T')[0]
  });

  const toggleDay = (day: string) => {
    setPrefs(p => ({
      ...p,
      studyDays: p.studyDays.includes(day) ? p.studyDays.filter(d => d !== day) : [...p.studyDays, day]
    }));
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">Customise your path</h2>
        <p className="text-slate-500 mt-2">How do you want to tackle this subject?</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
        <div>
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-blue-600" /> Which days can you study?
          </label>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_DAYS.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  prefs.studyDays.includes(day) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {day.slice(0,3)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-3">Intensity (h/day)</label>
            <div className="flex items-center gap-3">
               <input 
                  type="number" min="1" max="12" 
                  value={prefs.hoursPerDay}
                  onChange={e => setPrefs({...prefs, hoursPerDay: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
               />
               <Clock className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-3">Duration (weeks)</label>
            <input 
              type="number" min="1" max="52" 
              value={prefs.durationWeeks}
              onChange={e => setPrefs({...prefs, durationWeeks: parseInt(e.target.value)})}
              className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={() => onComplete(prefs)}
          disabled={isLoading || prefs.studyDays.length === 0}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating Plan...</>
          ) : (
            <><BookOpen className="w-6 h-6" /> Generate Study Plan <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default PlanGenerator;