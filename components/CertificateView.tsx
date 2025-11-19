
import React, { useRef, useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';
import { UserState } from '../types';

export const getRank = (score: number) => {
    if (score > 4000) return "ЛЕГЕНДА";
    if (score > 2500) return "ЭКСПЕРТ";
    if (score > 1000) return "СПЕЦИАЛИСТ";
    return "НОВИЧОК";
};

export const CertificateView: React.FC<{ user: UserState }> = ({ user }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rank = getRank(user.score);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                // Background - Dark Tech
                const gradient = ctx.createLinearGradient(0, 0, 800, 600);
                gradient.addColorStop(0, '#0B1120'); // Slate-950
                gradient.addColorStop(1, '#1E293B'); // Slate-800
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 800, 600);

                // Decorative Borders
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#06b6d4'; // Cyan
                ctx.strokeRect(30, 30, 740, 540);
                
                // Inner corners
                ctx.fillStyle = '#06b6d4';
                ctx.fillRect(30, 30, 20, 20);
                ctx.fillRect(750, 30, 20, 20);
                ctx.fillRect(30, 550, 20, 20);
                ctx.fillRect(750, 550, 20, 20);

                // Header
                ctx.font = 'bold 50px Orbitron';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.shadowColor = "rgba(6, 182, 212, 0.5)";
                ctx.shadowBlur = 15;
                ctx.fillText('СЕРТИФИКАТ', 400, 100);
                ctx.shadowBlur = 0;

                ctx.font = '24px Orbitron';
                ctx.fillStyle = '#06b6d4';
                ctx.letterSpacing = "4px";
                ctx.fillText('О ПРОХОЖДЕНИИ ОБУЧЕНИЯ', 400, 140);
                
                // Body
                ctx.font = '20px Inter';
                ctx.fillStyle = '#94a3b8';
                ctx.letterSpacing = "0px";
                ctx.fillText('Настоящим подтверждается, что', 400, 220);

                // Name (Golden/Glowing)
                ctx.font = 'bold 55px Orbitron';
                ctx.shadowColor = "rgba(234, 179, 8, 0.6)";
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#facc15'; // Yellow-400
                ctx.fillText(user.name, 400, 290);
                ctx.shadowBlur = 0;

                // Context
                ctx.font = '20px Inter';
                ctx.fillStyle = '#94a3b8';
                ctx.fillText('Успешно завершил курс по специальности', 400, 350);
                ctx.font = 'bold 28px Orbitron';
                ctx.fillStyle = '#fff';
                ctx.fillText('WEB3 ARCHITECT & NODE OPERATOR', 400, 390);

                // Stats Box
                ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
                ctx.fillRect(150, 430, 500, 100);
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 1;
                ctx.strokeRect(150, 430, 500, 100);

                // Stats Text
                ctx.font = 'bold 16px Orbitron';
                ctx.fillStyle = '#06b6d4';
                ctx.fillText('БАЛЛЫ', 275, 460);
                ctx.fillText('РАНГ', 525, 460);

                ctx.font = 'bold 32px Orbitron';
                ctx.fillStyle = '#fff';
                ctx.fillText(user.score.toString(), 275, 500);
                ctx.fillStyle = '#facc15';
                ctx.fillText(rank, 525, 500);

                // Footer
                ctx.font = 'italic 16px Inter';
                ctx.fillStyle = '#64748b';
                ctx.textAlign = 'left';
                ctx.fillText('WingsNodeTeam Academy', 50, 550);
                ctx.textAlign = 'right';
                ctx.fillText(new Date().toLocaleDateString('ru-RU'), 750, 550);
            }
        }
    }, [user, rank]);

    const downloadCertificate = () => {
        const link = document.createElement('a');
        link.download = 'WNT_Certificate.png';
        link.href = canvasRef.current?.toDataURL() || '';
        link.click();
    };

    const shareTelegram = () => {
        const text = `Я получил квалификацию ${rank} в WingsNodeTeam Academy! Мой счет: ${user.score}. Сможешь обогнать? #Web3 #WNT`;
        const url = "https://wingsnodeteam.ru";
        window.open(`https://t.me/share/url?url=${url}&text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="flex flex-col items-center gap-8 p-8 animate-in zoom-in duration-500">
            <canvas ref={canvasRef} width={800} height={600} className="w-full max-w-3xl shadow-[0_0_40px_rgba(6,182,212,0.3)] rounded-xl border border-slate-700 bg-[#0f172a]" />
            <div className="flex gap-4 flex-wrap justify-center">
                <button onClick={downloadCertificate} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg transition-transform hover:scale-105">
                    <Download size={20} /> Скачать сертификат
                </button>
                <button onClick={shareTelegram} className="bg-[#229ED9] hover:bg-[#1c86b8] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg transition-transform hover:scale-105">
                    <Share2 size={20} /> Поделиться в Telegram
                </button>
            </div>
        </div>
    );
};
