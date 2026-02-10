import React, { useState, useRef } from 'react';
import { Upload, FileText, ArrowRight, Loader2, BookOpen, Check } from 'lucide-react';
import { SyllabusData } from '../types';
import { extractTextFromFile } from './FileProcessor';

interface SyllabusInputProps {
  onSubmit: (syllabus: SyllabusData) => void;
  isLoading: boolean;
}

const SyllabusInput: React.FC<SyllabusInputProps> = ({ onSubmit, isLoading }) => {
  const [syllabusText, setSyllabusText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        setFileName(file.name);
        const text = await extractTextFromFile(file);
        setSyllabusText(text);
      } catch (err) {
        alert("Failed to read file.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-white p-6 rounded-3xl shadow-2xl border border-blue-50">
             <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        </div>
        <h2 className="mt-8 text-3xl font-black text-slate-800 tracking-tight">Assembling Your Knowledge</h2>
        <p className="mt-4 text-slate-500 max-w-md mx-auto text-lg leading-relaxed">
          Gemini is analyzing your syllabus to construct the most efficient study trajectory.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 block">Knowledge Ingestion</span>
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">Upload Your <span className="text-blue-600">Syllabus</span></h1>
        <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">PDF, DOCX, or Text. We handle the heavy lifting of reading through the documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group flex flex-col items-center justify-center"
        >
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          ) : (
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-100">
              <Upload className="w-10 h-10" />
            </div>
          )}
          <h3 className="text-xl font-bold text-slate-800">Drop your file here</h3>
          <p className="text-slate-400 mt-2">Supports PDF, DOCX, TXT</p>
          {fileName && (
            <div className="mt-6 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold border border-green-100 animate-in zoom-in-95 duration-300">
              <Check className="w-5 h-5" /> {fileName}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Manual Input / Preview</label>
          <textarea
            className="flex-1 w-full bg-slate-50 border-none rounded-2xl p-4 text-sm text-slate-600 leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[200px]"
            placeholder="Or paste the content directly..."
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => onSubmit({ content: syllabusText, fileName: fileName || "Untitled Subject" })}
          disabled={!syllabusText.trim()}
          className="flex items-center gap-3 bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all disabled:opacity-20"
        >
          Confirm Syllabus <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default SyllabusInput;