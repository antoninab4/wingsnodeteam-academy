
import React from 'react';
import { Play, Pause, SkipForward, Music } from 'lucide-react';
import { PLAYLIST } from '../constants';

interface MusicPlayerProps {
  isPlaying: boolean;
  currentTrackIndex: number;
  toggleMusic: () => void;
  nextTrack: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isPlaying, currentTrackIndex, toggleMusic, nextTrack }) => {
  return (
    <div className="hidden md:flex items-center gap-4 bg-black/30 backdrop-blur-md rounded-full px-5 py-2 border border-white/10 shadow-lg hover:border-cyan-500/30 transition-colors group">
        <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
            <Music size={14} className={`text-cyan-400 ${isPlaying ? 'animate-pulse' : ''}`} />
        </div>

        <div className="flex flex-col w-32">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Now Playing</span>
            <span className="text-xs text-white font-bold truncate font-orbitron tracking-wide">
                {PLAYLIST[currentTrackIndex].title}
            </span>
        </div>

        <div className="flex items-center gap-2">
             <button 
                onClick={toggleMusic} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-cyan-500 hover:text-white text-cyan-400 transition-all"
            >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>
            <button 
                onClick={nextTrack} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-slate-400 hover:text-white transition-all"
            >
                <SkipForward size={14} fill="currentColor" />
            </button>
        </div>

        {/* Visualizer */}
        <div className="flex items-end gap-0.5 h-5 ml-2">
            {[1,2,3,4,5].map(i => (
                <div 
                    key={i} 
                    className={`w-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-full ${isPlaying ? 'animate-[music-bar_0.6s_ease-in-out_infinite]' : 'h-1 opacity-30'}`} 
                    style={{ 
                        height: isPlaying ? `${30 + Math.random() * 70}%` : '4px', 
                        animationDelay: `${i * 0.05}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                    }}
                ></div>
            ))}
        </div>
    </div>
  );
};
