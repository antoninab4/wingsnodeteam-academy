import React from 'react';
import { BookOpen, SkipForward } from 'lucide-react';
import { Level } from '../types';
import { ProgressBar, renderFormattedText } from './UIComponents';

interface LessonViewProps {
  activeLevel: Level;
  currentLessonStep: number;
  setCurrentLessonStep: React.Dispatch<React.SetStateAction<number>>;
  handleNextLesson: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  activeLevel,
  currentLessonStep,
  setCurrentLessonStep,
  handleNextLesson
}) => {
  const lesson = activeLevel.lessons[currentLessonStep];

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-40 md:h-56 shrink-0 overflow-hidden group">
        <img 
          src={lesson.image} 
          alt={lesson.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-cyan-400 font-mono text-sm mb-2 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-cyan-500/20 rounded border border-cyan-500/30">MODULE {activeLevel.id}.{currentLessonStep + 1}</span>
                <span>{activeLevel.title}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white font-orbitron leading-tight neon-text">{lesson.title}</h2>
            </div>
            <div className="hidden md:block">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <BookOpen className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="prose prose-invert prose-lg max-w-none">
          {renderFormattedText(lesson.content)}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 md:p-6 border-t border-slate-800 bg-[#0F172A]/95 backdrop-blur flex items-center justify-between shrink-0 gap-4">
        <div className="w-1/3 hidden md:block">
          <ProgressBar value={currentLessonStep + 1} max={activeLevel.lessons.length + 1} colorClass="bg-cyan-500" showText />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto justify-end">
          {currentLessonStep > 0 && (
            <button 
              onClick={() => setCurrentLessonStep(prev => prev - 1)}
              className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 font-bold transition-colors"
            >
              Назад
            </button>
          )}
          
          <button 
            onClick={handleNextLesson}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)] flex items-center gap-2 hover:translate-x-1"
          >
            {currentLessonStep === activeLevel.lessons.length - 1 ? 'Начать Экзамен' : 'Далее'}
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
