
import React, { useState, useEffect, useRef } from 'react';
import { ACHIEVEMENTS_DATA, COINS_DATA as STATIC_COINS } from '../constants';
import { UserState } from '../types';
import { Terminal, User, Shield, Zap, Crown } from 'lucide-react';

// --- Custom Cursor ---
export const CustomCursor = () => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [hovering, setHovering] = useState(false);

    useEffect(() => {
        const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        const hoverOn = () => setHovering(true);
        const hoverOff = () => setHovering(false);

        window.addEventListener('mousemove', move);
        
        const observer = new MutationObserver(() => {
             const targets = document.querySelectorAll('button, a, input, .cursor-pointer');
             targets.forEach(el => {
                el.removeEventListener('mouseenter', hoverOn);
                el.removeEventListener('mouseleave', hoverOff);
                el.addEventListener('mouseenter', hoverOn);
                el.addEventListener('mouseleave', hoverOff);
             });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', move);
            observer.disconnect();
        };
    }, []);

    return (
        <>
            <div className="cursor-dot hidden md:block" style={{ left: `${pos.x}px`, top: `${pos.y}px` }}></div>
            <div className={`cursor-outline hidden md:block ${hovering ? 'border-cyan-400 bg-cyan-400/10 w-16 h-16' : ''}`} style={{ left: `${pos.x}px`, top: `${pos.y}px` }}></div>
        </>
    );
};

// --- Achievement Toast ---
export const AchievementManager = ({ user }: { user: UserState }) => {
    const [queue, setQueue] = useState<string[]>([]);
    const [visible, setVisible] = useState<string | null>(null);
    const processedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const newUnlocks: string[] = [];
        if (user.xp > 0 && !processedRef.current.has('first_steps')) newUnlocks.push('first_steps');
        if (user.level >= 3 && !processedRef.current.has('level_3')) newUnlocks.push('level_3');
        if (user.level >= 5 && !processedRef.current.has('level_5')) newUnlocks.push('level_5');
        if (user.score > 0 && !processedRef.current.has('quiz_master')) newUnlocks.push('quiz_master');
        if (user.completedLevelIds.length >= 8 && !processedRef.current.has('completion')) newUnlocks.push('completion');
        
        if (newUnlocks.length > 0) {
            newUnlocks.forEach(id => processedRef.current.add(id));
            setQueue(prev => [...prev, ...newUnlocks]);
        }
    }, [user]);

    useEffect(() => {
        if (visible || queue.length === 0) return;
        const next = queue[0];
        setVisible(next);
        setQueue(prev => prev.slice(1));
        const timer = setTimeout(() => setVisible(null), 7000);
        return () => clearTimeout(timer);
    }, [queue, visible]);

    if (!visible) return null;
    const achievement = ACHIEVEMENTS_DATA.find(a => a.id === visible);
    if (!achievement) return null;

    return (
        <div 
            className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right duration-500 fade-in cursor-pointer"
            onClick={() => setVisible(null)}
        >
            <div className="bg-slate-900/95 border border-yellow-500/50 rounded-xl p-4 shadow-[0_0_20px_rgba(234,179,8,0.2)] flex items-center gap-4 backdrop-blur-md max-w-sm hover:bg-slate-800 transition-colors">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-2xl border border-yellow-500 animate-bounce shrink-0">
                    {achievement.icon}
                </div>
                <div>
                    <div className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Achievement Unlocked</div>
                    <div className="font-bold text-white">{achievement.title}</div>
                    <div className="text-xs text-slate-400">{achievement.desc}</div>
                </div>
            </div>
        </div>
    );
};

// --- Crypto Ticker with Simulation ---
export const CryptoTicker = () => {
    const [coins, setCoins] = useState(STATIC_COINS.map(c => ({ 
        ...c, 
        priceNum: parseFloat(c.price.replace(',', '')),
        up: !c.change.startsWith('-')
    })));

    useEffect(() => {
        const interval = setInterval(() => {
            setCoins(prev => prev.map(coin => {
                const volatility = (Math.random() - 0.5) * 0.002; // 0.2% variance
                const newPrice = coin.priceNum * (1 + volatility);
                return {
                    ...coin,
                    priceNum: newPrice,
                    price: newPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    up: volatility >= 0
                };
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#0f172a] border-b border-slate-800/50 h-10 flex items-center overflow-hidden relative z-30 select-none">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#0f172a] to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#0f172a] to-transparent z-10"></div>
            <div className="whitespace-nowrap flex items-center animate-marquee">
                {[...coins, ...coins, ...coins].map((coin, i) => (
                    <div key={i} className="inline-flex items-center mx-6 text-xs font-mono">
                        <span className="font-bold text-slate-300 mr-2">{coin.symbol}</span>
                        <span className="text-white mr-2">${coin.price}</span>
                        <span className={coin.up ? "text-green-400" : "text-red-400"}>{coin.up ? "▲" : "▼"} {coin.change}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Dynamic User Avatar ---
export const UserAvatar = ({ level }: { level: number }) => {
    let Icon = User;
    let colorClass = "text-slate-300";
    let borderClass = "border-slate-500";
    let glowClass = "";
    let bgClass = "bg-slate-700";

    if (level >= 3 && level < 6) {
        Icon = Shield;
        colorClass = "text-cyan-300";
        borderClass = "border-cyan-500";
        bgClass = "bg-cyan-900/50";
        glowClass = "shadow-[0_0_10px_rgba(6,182,212,0.5)]";
    } else if (level >= 6 && level < 9) {
        Icon = Zap;
        colorClass = "text-purple-300";
        borderClass = "border-purple-500";
        bgClass = "bg-purple-900/50";
        glowClass = "shadow-[0_0_15px_rgba(168,85,247,0.6)]";
    } else if (level >= 9) {
        Icon = Crown;
        colorClass = "text-yellow-300";
        borderClass = "border-yellow-500";
        bgClass = "bg-yellow-900/50";
        glowClass = "shadow-[0_0_20px_rgba(234,179,8,0.8)] border-2";
    }

    return (
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center overflow-hidden relative group cursor-pointer transition-all duration-300 ${bgClass} border ${borderClass} ${glowClass}`}>
            <Icon size={20} className={`${colorClass} relative z-10`} />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {level >= 9 && <div className="absolute inset-0 animate-pulse bg-yellow-500/20"></div>}
        </div>
    );
};

// --- Tilt Card ---
export const TiltCard = ({ children, onClick, className }: { children?: React.ReactNode, onClick: () => void, className: string }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('');
    const [glare, setGlare] = useState('');

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
        setGlare(`radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 80%)`);
    };

    return (
        <div 
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { setTransform(''); setGlare(''); }}
            className={`${className} transition-transform duration-200 ease-out preserve-3d relative cursor-pointer`}
            style={{ transform }}
        >
            {children}
            <div className="absolute inset-0 rounded-3xl pointer-events-none mix-blend-overlay transition-opacity duration-200" style={{ background: glare }} />
        </div>
    );
};

// --- Progress Bar ---
export const ProgressBar = ({ value, max, colorClass, showText = false }: { value: number; max: number; colorClass: string; showText?: boolean }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between text-xs mb-1 text-slate-400 font-mono uppercase tracking-wider">
          <span>Прогресс модуля</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 md:h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div className={`h-full ${colorClass} transition-all duration-700 ease-out relative overflow-hidden`} style={{ width: `${percentage}%` }}>
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

// --- Code Block ---
export const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = 'javascript' }) => (
  <div className="bg-[#1E1E1E] rounded-lg overflow-hidden my-4 border border-slate-700 shadow-lg font-mono text-sm relative group">
    <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-slate-700">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
        <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
      </div>
      <span className="text-xs text-slate-400">{language}</span>
    </div>
    <pre className="p-4 overflow-x-auto text-[#D4D4D4]">
      <code>{code}</code>
    </pre>
  </div>
);

// --- Helper: Render Formatted Text ---
export const renderFormattedText = (text: string): React.ReactNode[] => {
  const parts = text.split('\n');
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  return parts.map((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const code = codeBuffer.join('\n');
        codeBuffer = [];
        return <CodeBlock key={`code-${index}`} code={code} language={codeLang} />;
      } else {
        inCodeBlock = true;
        codeLang = line.trim().replace('```', '') || 'text';
        return null;
      }
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      return null;
    }
    if (line.trim() === '') return <br key={index} />;
    
    if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold text-cyan-400 mt-6 mb-3">{line.replace('### ', '')}</h3>;
    }
    
    if (line.startsWith('> ')) {
        return (
            <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2 my-4 bg-yellow-500/10 rounded-r-lg text-slate-200 italic">
                {line.replace('> ', '')}
            </div>
        );
    }

    if (line.startsWith('* ')) {
        return (
            <li key={index} className="ml-4 text-slate-300 my-1 list-disc marker:text-cyan-500 pl-1">
                <span dangerouslySetInnerHTML={{ __html: line.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-mono text-xs">$1</code>') }} />
            </li>
        );
    }

    return (
      <p key={index} className="mb-3 text-slate-300 leading-relaxed break-words hyphens-auto" dangerouslySetInnerHTML={{ 
          __html: line
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-sm border border-slate-700">$1</code>')
      }} />
    );
  }).filter(Boolean);
};
