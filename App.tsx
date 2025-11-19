
import React, { useState, useEffect, useRef } from 'react';
import { LEVELS_DATA, PLAYLIST } from './constants';
import { Level, UserState, ChatMessage, QuizQuestion } from './types';
import { sendMessageToGemini, generateChallengeQuestions } from './services/geminiService';
import { MessageSquare, Send, X, Rocket, Terminal, Code, Shield, Award, Lightbulb, Handshake, SkipForward, Lock, Layers, Star, Bot, Cpu } from 'lucide-react';
import { CustomCursor, AchievementManager, CryptoTicker, TiltCard, UserAvatar, renderFormattedText } from './components/UIComponents';
import { MusicPlayer } from './components/MusicPlayer';
import { Modal } from './components/Modal';
import { QuizView } from './components/QuizView';
import { LessonView } from './components/LessonView';
import { CertificateView } from './components/CertificateView';
import { TerminalSection } from './components/TerminalSection';

export default function App() {
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [currentLessonStep, setCurrentLessonStep] = useState(0);
  
  // AI Quiz State
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  
  // Quiz progress state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // User State
  const [user, setUser] = useState<UserState>({
    xp: 0,
    score: 0,
    level: 1,
    completedLevelIds: [],
    name: 'Cadet',
    totalTimeSeconds: 0
  });

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modals
  const [showCertificate, setShowCertificate] = useState(false);
  const [showPartnership, setShowPartnership] = useState(false);

  // Time Tracking
  useEffect(() => {
      const timer = setInterval(() => {
          if (document.visibilityState === 'visible') {
              setUser(u => ({ ...u, totalTimeSeconds: u.totalTimeSeconds + 1 }));
          }
      }, 1000);
      return () => clearInterval(timer);
  }, []);

  // Toggle Music Logic
  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
      // Ensure playing continues after track change if it was already playing or started by next button
      setIsPlaying(true); 
  };

  // Sync Audio Element with State
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.4; // Set comfortable volume

    const playAudio = async () => {
        try {
            if (isPlaying) {
                await audio.play();
            } else {
                audio.pause();
            }
        } catch (error) {
            console.log("Playback prevented or interrupted:", error);
            // We ignore interruptions as they are common when switching tracks quickly
        }
    };

    playAudio();
  }, [isPlaying, currentTrackIndex]); 

  const scrollToChat = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToChat();
  }, [chatHistory, isChatOpen]);

  const handleLevelClick = (level: Level) => {
    if (level.isLocked && !user.completedLevelIds.includes(level.id - 1) && level.id !== 1) {
      return; 
    }
    setActiveLevelId(level.id);
    setCurrentLessonStep(0);
  };

  const handleNextLesson = async () => {
    const activeLevel = LEVELS_DATA.find(l => l.id === activeLevelId);
    if (!activeLevel) return;

    if (currentLessonStep === activeLevel.lessons.length - 1) {
        setIsQuizLoading(true);
        setCurrentLessonStep(currentLessonStep + 1);
        
        let questions = [...activeLevel.quiz];
        const context = activeLevel.lessons.map(l => l.content).join('\n');
        const challengeQuestions = await generateChallengeQuestions(context);
        
        if (challengeQuestions.length > 0) {
            questions = [...questions, ...challengeQuestions];
        }
        
        setCurrentQuizQuestions(questions);
        setIsQuizLoading(false);
        
        setCurrentQuestionIndex(0);
        setQuizScore(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
    } else {
        setCurrentLessonStep(prev => prev + 1);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === currentQuizQuestions[currentQuestionIndex].correctAnswerIndex) {
        setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      completeLevel();
    }
  };

  const completeLevel = () => {
    const level = LEVELS_DATA.find(l => l.id === activeLevelId);
    if (!level) return;

    const accuracy = quizScore / currentQuizQuestions.length;
    const xpEarned = Math.round(level.xpReward * accuracy);
    const scoreEarned = Math.round(accuracy * 1000);

    setUser(prev => {
        const newCompleted = prev.completedLevelIds.includes(level.id) 
            ? prev.completedLevelIds 
            : [...prev.completedLevelIds, level.id];
        
        const isFirstTime = !prev.completedLevelIds.includes(level.id);
        const newXP = isFirstTime ? prev.xp + xpEarned : prev.xp;
        const newScore = isFirstTime ? prev.score + scoreEarned : prev.score;

        return {
            ...prev,
            xp: newXP,
            score: newScore,
            completedLevelIds: newCompleted,
            level: Math.floor(newXP / 500) + 1
        };
    });

    setActiveLevelId(null);
    if (level.id === LEVELS_DATA.length) {
        setShowCertificate(true);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: chatInput, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const responseText = await sendMessageToGemini(chatHistory, userMsg.text);
      setChatHistory(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Ошибка связи с нейросетью.", timestamp: Date.now() }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const activeLevel = LEVELS_DATA.find(l => l.id === activeLevelId);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-inter overflow-x-hidden selection:bg-cyan-500/30">
      {/* Audio Element - Hidden but active. Removed crossOrigin to fix playback issues. */}
      <audio 
        ref={audioRef}
        src={PLAYLIST[currentTrackIndex].url}
        onEnded={nextTrack}
        preload="auto"
      />

      <CustomCursor />
      <AchievementManager user={user} />
      <CryptoTicker />

      {/* Header */}
      <header className="fixed top-10 left-0 right-0 bg-[#0F172A]/80 backdrop-blur-lg border-b border-slate-800 z-40 h-16 md:h-20 transition-all">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                 <Rocket className="text-white" size={20} />
             </div>
             <h1 className="text-lg md:text-2xl font-orbitron font-black tracking-tighter text-white hidden md:block">
               WINGS<span className="text-cyan-400">NODE</span>TEAM
             </h1>
             <h1 className="text-lg font-orbitron font-black tracking-tighter text-white md:hidden">WNT</h1>
          </div>

          <MusicPlayer 
            isPlaying={isPlaying} 
            currentTrackIndex={currentTrackIndex}
            toggleMusic={toggleMusic}
            nextTrack={nextTrack}
          />

          <div className="flex items-center gap-2 md:gap-6">
             <div className="flex flex-col items-end">
                 <span className="text-xs text-slate-400 font-mono hidden md:block">USER STATUS</span>
                 <div className="flex items-center gap-2">
                     <span className="text-yellow-400 font-bold font-orbitron">{user.xp} XP</span>
                     <span className="text-slate-600">|</span>
                     <span className="text-cyan-400 font-bold">LVL {user.level}</span>
                 </div>
             </div>
             <UserAvatar level={user.level} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 md:pt-48 pb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
             <div className="inline-block relative group mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 animate-tilt"></div>
                <div className="relative px-6 py-2 bg-black ring-1 ring-slate-700 rounded-full flex items-center gap-2">
                   <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                   <span className="text-cyan-100 text-sm font-bold font-orbitron tracking-wider">START YOUR WEB3 CAREER</span>
                </div>
             </div>
             <h2 className="text-4xl md:text-7xl lg:text-8xl font-orbitron font-black text-white mb-6 leading-tight neon-text">
                 WEB3 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">MASTERY</span>
             </h2>
             <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                Web3 проще, чем кажется. Пройди интерактивный квест, разберись в крипте с нуля, заработай баллы и докажи свои навыки подтвержденным сертификатом.
             </p>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-cyan-500 transition-colors group">
                    <div className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform"><Terminal className="mx-auto"/></div>
                    <div className="font-bold text-white">Node Running</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-purple-500 transition-colors group">
                    <div className="text-purple-400 mb-2 group-hover:scale-110 transition-transform"><Code className="mx-auto"/></div>
                    <div className="font-bold text-white">Smart Contracts</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-green-500 transition-colors group">
                    <div className="text-green-400 mb-2 group-hover:scale-110 transition-transform"><Shield className="mx-auto"/></div>
                    <div className="font-bold text-white">Security</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-yellow-500 transition-colors group">
                    <div className="text-yellow-400 mb-2 group-hover:scale-110 transition-transform"><Award className="mx-auto"/></div>
                    <div className="font-bold text-white">Certification</div>
                </div>
             </div>
          </div>
      </section>

      {/* Levels Map */}
      <section className="py-20 container mx-auto px-4 relative">
         <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 via-blue-600 to-purple-600 opacity-30"></div>
         
         <div className="space-y-16 md:space-y-32">
             {LEVELS_DATA.map((level, index) => {
                 const isLeft = index % 2 === 0;
                 const isLocked = level.isLocked && !user.completedLevelIds.includes(level.id - 1) && level.id !== 1;
                 const isCompleted = user.completedLevelIds.includes(level.id);

                 return (
                     <div key={level.id} className={`relative flex items-center ${isLeft ? 'md:justify-end md:pr-16' : 'md:justify-start md:pl-16'} pl-12 md:pl-0`}>
                         <div className={`absolute left-0 md:left-1/2 -translate-x-[5px] md:-translate-x-1/2 w-4 h-4 md:w-6 md:h-6 rounded-full border-4 ${isCompleted ? 'bg-emerald-500 border-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : isLocked ? 'bg-slate-800 border-slate-600' : 'bg-cyan-500 border-cyan-900 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse'} z-10`}></div>
                         <TiltCard 
                             onClick={() => handleLevelClick(level)}
                             className={`w-full md:w-[500px] bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border transition-all duration-300 group ${
                                 isLocked 
                                 ? 'border-slate-800 opacity-50 cursor-not-allowed grayscale' 
                                 : 'border-slate-700 hover:border-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                             }`}
                         >
                             <div className="flex justify-between items-start mb-4">
                                 <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                     {level.icon}
                                 </div>
                                 <div className="text-right">
                                     <span className={`font-bold font-orbitron ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                                         {isCompleted ? 'COMPLETED' : `LEVEL 0${level.id}`}
                                     </span>
                                     {isLocked && <Lock size={16} className="ml-auto mt-1 text-slate-600" />}
                                 </div>
                             </div>
                             <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors font-orbitron">{level.title}</h3>
                             <p className="text-slate-400 text-sm mb-4 leading-relaxed">{level.description}</p>
                             <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                                 <span className="flex items-center gap-1"><Layers size={14}/> {level.lessons.length} MODULES</span>
                                 <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500"/> {level.xpReward} XP REWARD</span>
                             </div>
                             {isCompleted && (
                                 <div className="mt-4 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-500 w-full"></div>
                                 </div>
                             )}
                         </TiltCard>
                     </div>
                 );
             })}
         </div>
      </section>

      <TerminalSection user={user} />

      {/* Footer */}
      <footer className="bg-[#020617] border-t border-slate-800 py-12 mt-20">
          <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                      <h2 className="text-2xl font-orbitron font-black text-white mb-2">WINGS<span className="text-cyan-500">NODE</span>TEAM</h2>
                      <p className="text-slate-500 max-w-md text-sm">
                          Мы строим будущее децентрализованного интернета. Присоединяйся к нам, обучайся и строй свою карьеру в Web3. Открыты для предложений и сотрудничества.
                      </p>
                  </div>
                  <div className="flex gap-6">
                      <button 
                        onClick={() => setShowPartnership(true)} 
                        className="group relative inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all duration-200 bg-cyan-600 font-orbitron focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 rounded-lg hover:bg-cyan-500"
                      >
                          <Handshake size={20} className="mr-2" />
                          Сотрудничество
                          <div className="absolute -inset-3 rounded-lg bg-cyan-400 opacity-20 blur-lg group-hover:opacity-40 transition duration-200"></div>
                      </button>
                  </div>
              </div>
              <div className="text-center text-slate-600 text-xs mt-8 font-mono">
                  © 2025-2026 WingsNodeTeam. System Status: Operational. v3.0.0
              </div>
          </div>
      </footer>

      {/* Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center z-40 transition-all hover:scale-110 hover:rotate-12 group"
      >
        <Bot size={28} className="group-hover:animate-bounce" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0F172A] animate-pulse"></div>
      </button>

      {/* Chat Interface */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 md:bottom-32 md:right-10 w-[90vw] md:w-[450px] h-[600px] bg-[#0F172A]/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-2xl flex flex-col z-50 neon-box animate-in slide-in-from-bottom-10 fade-in overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/50">
                        <Bot className="text-cyan-400" size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-white font-orbitron text-sm">AI MENTOR PRO</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono uppercase">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Online • Senior Engineer
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"><X size={18}/></button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 custom-scrollbar scroll-smooth">
                {chatHistory.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <Cpu size={48} className="mx-auto mb-4 text-slate-600" />
                        <p className="text-sm text-slate-400">Задай вопрос по Web3, Solidity или Linux...</p>
                    </div>
                )}
                
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-cyan-600 text-white rounded-br-none shadow-[0_2px_10px_rgba(8,145,178,0.3)]' 
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
                        }`}>
                            {msg.role === 'user' ? msg.text : (
                                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                                    {renderFormattedText(msg.text)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {isChatLoading && (
                    <div className="flex justify-start animate-in fade-in">
                        <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-700/50 flex gap-1.5 items-center">
                            <div className="text-xs text-slate-400 font-mono mr-2">THINKING</div>
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="p-3 border-t border-slate-700 bg-slate-900">
                <div className="relative flex items-center">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                        placeholder="Введите запрос..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner placeholder:text-slate-600"
                        disabled={isChatLoading}
                    />
                    <button 
                        onClick={handleChatSend} 
                        disabled={!chatInput.trim() || isChatLoading}
                        className="absolute right-2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="text-[10px] text-center text-slate-600 mt-2 font-mono">
                    Powered by Gemini 2.5 Flash • WingsNodeTeam
                </div>
            </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={!!activeLevelId} onClose={() => { setActiveLevelId(null); setCurrentLessonStep(0); }}>
        {activeLevelId && activeLevel && (
          currentLessonStep < activeLevel.lessons.length ? (
            <LessonView 
              activeLevel={activeLevel}
              currentLessonStep={currentLessonStep}
              setCurrentLessonStep={setCurrentLessonStep}
              handleNextLesson={handleNextLesson}
            />
          ) : (
            <QuizView 
              activeLevel={activeLevel}
              isQuizLoading={isQuizLoading}
              currentQuestionIndex={currentQuestionIndex}
              quizScore={quizScore}
              currentQuizQuestions={currentQuizQuestions}
              selectedAnswer={selectedAnswer}
              showExplanation={showExplanation}
              handleAnswerSelect={handleAnswerSelect}
              handleNextQuestion={handleNextQuestion}
            />
          )
        )}
      </Modal>

      <Modal isOpen={showCertificate} onClose={() => setShowCertificate(false)}>
          <CertificateView user={user} />
      </Modal>

      <Modal isOpen={showPartnership} onClose={() => setShowPartnership(false)}>
         <div className="p-8 text-center">
             <Handshake size={64} className="mx-auto text-cyan-500 mb-6" />
             <h2 className="text-3xl font-bold text-white font-orbitron mb-4">Сотрудничество</h2>
             <p className="text-slate-400 mb-8 leading-relaxed">
                 Мы всегда открыты для новых идей и предложений. Будь то образовательные инициативы, технологическое партнерство или совместные мероприятия.
             </p>
             
             <div className="grid md:grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-cyan-500 transition-colors">
                     <h4 className="text-white font-bold mb-2">Business & Ideas</h4>
                     <p className="text-sm text-slate-400">Предложения по рекламе, интеграциям и развитию сообщества.</p>
                 </div>
                 <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-purple-500 transition-colors">
                     <h4 className="text-white font-bold mb-2">Dev & Education</h4>
                     <p className="text-sm text-slate-400">Интеграция ваших инструментов в нашу академию.</p>
                 </div>
             </div>

             <a href="https://t.me/wnt_admin_help" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:scale-105">
                 <Send size={20} />
                 Написать в Telegram
             </a>
         </div>
      </Modal>
    </div>
  );
}
