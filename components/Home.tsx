
import React from 'react';
import { AppMode } from '../types';

interface HomeProps {
  onSelectMode: (mode: AppMode) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mt-12 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Proteja o que é <span className="text-blue-500">importante.</span>
        </h2>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          Sistema de vigilância P2P de alta performance. Sem servidores, sem logs, privacidade absoluta por design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Camera Option */}
        <div 
          onClick={() => onSelectMode(AppMode.CAMERA)}
          className="glass p-10 rounded-[2.5rem] flex flex-col items-center gap-8 cursor-pointer hover:bg-slate-800/80 transition-all group border-transparent hover:border-blue-500/30 relative overflow-hidden active:scale-[0.98]"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 blur-3xl rounded-full"></div>
          <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-red-500/5">
            <i className="fas fa-video text-5xl text-red-500"></i>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black mb-3 text-white">Modo Câmera</h2>
            <p className="text-slate-500 text-sm leading-relaxed px-4">
              Transmita vídeo e áudio em tempo real deste dispositivo de forma segura.
            </p>
          </div>
          <div className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-red-900/30 transition-all flex items-center justify-center gap-2">
            INICIAR TRANSMISSÃO <i className="fas fa-chevron-right text-[10px]"></i>
          </div>
        </div>

        {/* Monitor Option */}
        <div 
          onClick={() => onSelectMode(AppMode.MONITOR)}
          className="glass p-10 rounded-[2.5rem] flex flex-col items-center gap-8 cursor-pointer hover:bg-slate-800/80 transition-all group border-transparent hover:border-blue-500/30 relative overflow-hidden active:scale-[0.98]"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
          <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-xl shadow-blue-500/5">
            <i className="fas fa-desktop text-5xl text-blue-500"></i>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black mb-3 text-white">Modo Monitor</h2>
            <p className="text-slate-500 text-sm leading-relaxed px-4">
              Acesse e visualize remotamente qualquer câmera ativa usando o ID seguro.
            </p>
          </div>
          <div className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-blue-900/30 transition-all flex items-center justify-center gap-2">
            CENTRO DE CONTROLE <i className="fas fa-chevron-right text-[10px]"></i>
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 text-slate-500">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="w-12 h-[1px] bg-slate-800"></span>
          Como funciona
          <span className="w-12 h-[1px] bg-slate-800"></span>
        </div>
        <p className="text-[11px] text-center max-w-sm opacity-60">
          A câmera gera um ID único. O monitor se conecta a esse ID através de um túnel criptografado direto (P2P). Use o QR Code para conexões instantâneas.
        </p>
      </div>

      <div className="mt-12 flex items-center gap-4 text-slate-600 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <i className="fab fa-github text-2xl"></i>
        <span className="text-[10px] font-black tracking-[0.4em] uppercase">WebSecure Open-Source Project</span>
      </div>
    </div>
  );
};

export default Home;
