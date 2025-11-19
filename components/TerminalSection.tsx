import React, { useState, useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { UserState } from '../types';
import { getRank } from './CertificateView';

interface TerminalLine {
    type: 'input' | 'output';
    content: React.ReactNode;
}

export const TerminalSection = ({ user }: { user: UserState }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
      { type: 'output', content: <div className="text-emerald-400">Connected to WNT Command Center v2.5.0</div> },
      { type: 'output', content: <div className="text-slate-400">Secure Uplink Established. Type <span className="text-cyan-400">'help'</span> for available protocols.</div> }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
      if (interacted) {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [lines, interacted]);

  const handleCommand = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          setInteracted(true);
          const cmd = input.trim().toLowerCase();
          setLines(prev => [...prev, { type: 'input', content: <><span className="text-pink-500">root@wings-node:~#</span> {input}</> }]);
          
          let response: React.ReactNode;
          switch(cmd) {
              case 'help':
                  response = <div className="text-slate-300 grid grid-cols-1 gap-1">
                      <div>Available commands:</div>
                      <div><span className="text-yellow-400">status</span> - Check current user metrics</div>
                      <div><span className="text-yellow-400">wnt</span> - About WingsNodeTeam mission</div>
                      <div><span className="text-yellow-400">whoami</span> - User identity</div>
                      <div><span className="text-yellow-400">ping</span> - Check network latency</div>
                      <div><span className="text-yellow-400">clear</span> - Clear terminal</div>
                  </div>;
                  break;
              case 'status':
                  response = <div className="text-cyan-300">
                      <div>USER: {user.name}</div>
                      <div>LEVEL: {user.level}</div>
                      <div>XP: {user.xp}</div>
                      <div>SCORE: {user.score}</div>
                      <div>RANK: {getRank(user.score)}</div>
                      <div>SYSTEM: ONLINE</div>
                  </div>;
                  break;
              case 'wnt':
                  response = <div className="text-indigo-300">
                      WingsNodeTeam Academy - Образовательная инициатива по подготовке квалифицированных инженеров блокчейна.
                      Мы верим в открытый код, децентрализацию и силу знаний.
                      Цель: дать инструменты для самостоятельного плавания в Web3.
                  </div>;
                  break;
              case 'whoami':
                  response = <div className="text-emerald-400">uid=1000({user.name}) gid=1000(novice) groups=1000(novice),27(sudo)</div>;
                  break;
              case 'ping':
                  response = <div className="text-slate-400">
                      <div>64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=14.2 ms</div>
                      <div>64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=13.8 ms</div>
                      <div>--- 8.8.8.8 ping statistics ---</div>
                      <div>2 packets transmitted, 2 received, 0% packet loss</div>
                  </div>;
                  break;
              case 'clear':
                  setLines([]);
                  setInput('');
                  return;
              case '':
                  response = null;
                  break;
              default:
                  response = <div className="text-red-400">Command not found: {cmd}. Type 'help' for assistance.</div>;
          }
          
          if (response) {
              setLines(prev => [...prev, { type: 'output', content: response }]);
          }
          setInput('');
      }
  };

  return (
      <div className="w-full max-w-4xl mx-auto mt-20 mb-20 p-4">
          <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-2xl neon-box font-mono text-sm md:text-base">
              <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-2 text-slate-400 flex items-center gap-1"><Terminal size={14}/> bash — 80x24</div>
              </div>
              <div className="p-4 h-64 md:h-80 overflow-y-auto bg-black/90" onClick={() => document.getElementById('terminal-input')?.focus()}>
                  {lines.map((line, i) => (
                      <div key={i} className="mb-1 break-words">{line.content}</div>
                  ))}
                  <div ref={bottomRef} />
                  <div className="flex items-center gap-2 mt-2">
                      <span className="text-pink-500 shrink-0">root@wings-node:~#</span>
                      <input 
                          id="terminal-input"
                          type="text" 
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={handleCommand}
                          className="bg-transparent border-none outline-none text-slate-200 w-full focus:ring-0 p-0"
                          autoComplete="off"
                          
                      />
                  </div>
              </div>
          </div>
      </div>
  );
};
