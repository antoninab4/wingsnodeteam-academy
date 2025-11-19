import React from 'react';
import { Zap, ChevronDown, Lightbulb, BrainCircuit } from 'lucide-react';
import { QuizQuestion, Level } from '../types';

interface QuizViewProps {
  activeLevel: Level;
  isQuizLoading: boolean;
  currentQuestionIndex: number;
  quizScore: number;
  currentQuizQuestions: QuizQuestion[];
  selectedAnswer: number | null;
  showExplanation: boolean;
  handleAnswerSelect: (index: number) => void;
  handleNextQuestion: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  activeLevel,
  isQuizLoading,
  currentQuestionIndex,
  quizScore,
  currentQuizQuestions,
  selectedAnswer,
  showExplanation,
  handleAnswerSelect,
  handleNextQuestion
}) => {
  if (isQuizLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="text-cyan-400 animate-pulse" size={24} />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-orbitron text-white mb-2">AI генерирует испытание...</h3>
          <p className="text-slate-400">Анализ материала уровня и подготовка сложных сценариев</p>
        </div>
      </div>
    );
  }

  const question = currentQuizQuestions[currentQuestionIndex];

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header - Fixed Height */}
      <div className="shrink-0 p-4 md:p-6 border-b border-slate-700 flex justify-between items-center bg-[#0F172A] z-10">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white font-orbitron">ЭКЗАМЕН: {activeLevel.title}</h3>
          <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400 border border-slate-700">
              Вопрос {currentQuestionIndex + 1} / {currentQuizQuestions.length}
            </span>
            {currentQuestionIndex >= activeLevel.quiz.length && (
              <span className="text-purple-400 flex items-center gap-1 text-xs">
                <Zap size={12} /> AI CHALLENGE
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">{quizScore * 100} XP</div>
        </div>
      </div>

      {/* Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 custom-scrollbar">
        <div className="mb-6">
          <p className="text-base md:text-lg text-white leading-relaxed font-medium break-words">
            {question.question}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {question.options.map((option, idx) => {
            let btnClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 relative overflow-hidden group break-words whitespace-normal h-auto ";
            if (selectedAnswer === null) {
              btnClass += "border-slate-700 bg-slate-800/50 hover:border-cyan-500 hover:bg-cyan-500/10 text-slate-200";
            } else if (idx === question.correctAnswerIndex) {
              btnClass += "border-emerald-500 bg-emerald-500/20 text-emerald-100";
            } else if (idx === selectedAnswer) {
              btnClass += "border-red-500 bg-red-500/20 text-red-100";
            } else {
              btnClass += "border-slate-800 bg-slate-900 text-slate-500 opacity-50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={selectedAnswer !== null}
                className={btnClass}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedAnswer !== null && idx === question.correctAnswerIndex ? 'border-emerald-500 bg-emerald-500 text-white' :
                    selectedAnswer === idx ? 'border-red-500 bg-red-500 text-white' :
                    'border-slate-500 text-slate-500 group-hover:border-cyan-400 group-hover:text-cyan-400'
                  }`}>
                    {['A', 'B', 'C', 'D'][idx]}
                  </div>
                  <span className="text-sm md:text-base">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation - In Flow */}
        {showExplanation && (
          <div className="mb-4 p-4 bg-slate-800/80 rounded-xl border-l-4 border-cyan-500 animate-in slide-in-from-bottom-2 fade-in">
            <h4 className="text-cyan-400 font-bold mb-1 flex items-center gap-2">
              <Lightbulb size={16} /> Анализ ситуации
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed break-words">
              {question.explanation}
            </p>
          </div>
        )}
        
        {/* Spacer to ensure last content isn't cut off on some screens */}
        <div className="h-8"></div>
      </div>

      {/* Footer - Fixed Height */}
      <div className="shrink-0 border-t border-slate-700 bg-[#0F172A] p-4 md:p-6 relative z-20">
        <button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            selectedAnswer !== null 
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {currentQuestionIndex < currentQuizQuestions.length - 1 ? 'Следующий вопрос' : 'Завершить Экзамен'}
          <ChevronDown className={`transform transition-transform ${selectedAnswer !== null ? '-rotate-90' : ''}`} />
        </button>
      </div>
    </div>
  );
};
