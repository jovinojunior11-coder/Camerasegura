
import React from 'react';
import { AppMode } from '../types.ts';

interface HomeProps {
  onSelectMode: (mode: AppMode) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center w-full mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Vigilância <span className="text-blue-500">Privada</span>
        </h2>
        <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Transforme instantaneamente qualquer dispositivo em uma câmera de segurança de alta performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        {/* Card Transmissor */}
        <div 
            className="spy-card p-8 md:p-12 flex flex-col items-center text-center gap-8 hover:border-blue-500/40 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => onSelectMode(AppMode.CAMERA)}
        >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            
            <div className="w-24 h-24 bg-blue-600/10 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600/20 transition-all duration-300">
                <i className="fas fa-video text-5xl text-blue-500"></i>
            </div>
            
            <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Modo Câmera</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">
                    Ative este aparelho como o transmissor de vídeo. Ideal para monitorar ambientes fixos.
                </p>
            </div>
            
            <button className="btn-primary w-full py-5 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase text-white shadow-lg shadow-blue-900/30">
                Iniciar Transmissão
            </button>
        </div>

        {/* Card Monitor */}
        <div 
            className="spy-card p-8 md:p-12 flex flex-col items-center text-center gap-8 hover:border-red-500/40 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => onSelectMode(AppMode.MONITOR)}
        >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors"></div>

            <div className="w-24 h-24 bg-red-600/10 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600/20 transition-all duration-300">
                <i className="fas fa-display text-5xl text-red-500"></i>
            </div>
            
            <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Centro de Comando</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">
                    Visualize remotamente o feed de vídeo. Acesse de qualquer lugar do mundo via P2P.
                </p>
            </div>
            
            <button className="btn-danger w-full py-5 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase text-white shadow-lg shadow-red-900/30">
                Monitorar Agora
            </button>
        </div>
      </div>
      
      <div className="mt-20 bg-slate-900/30 border border-white/5 px-6 py-3 rounded-full flex items-center gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Servidores P2P Operacionais</span>
      </div>
    </div>
  );
};

export default Home;
