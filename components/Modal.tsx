import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      {/* CRITICAL: h-[85vh] for mobile ensures a fixed container height, forcing internal scroll */}
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] md:h-auto md:max-h-[85vh] overflow-hidden relative shadow-2xl neon-box flex flex-col">
        <button 
            onClick={onClose} 
            className="absolute top-3 right-3 md:top-5 md:right-5 text-slate-400 hover:text-white transition-colors z-20 bg-black/50 rounded-full p-2 hover:bg-red-500/20 border border-white/10 cursor-pointer"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};
