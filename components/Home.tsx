
import React from 'react';
import { AppMode } from '../types.ts';

interface HomeProps {
  onSelectMode: (mode: AppMode) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center w-full mt-8 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-white mb-2">SpyPhone <span className="text-blue-500">Security Cam</span></h2>
        <p className="text-slate-400 text-sm">Transforme seu dispositivo em uma sentinela privada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* Camera */}
        <div className="spy-card p-10 flex flex-col items-center text-center gap-6 hover:border-blue-500/50 transition-all cursor-pointer group" onClick={() => onSelectMode(AppMode.CAMERA)}>
            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-video text-4xl text-blue-500"></i>
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2">Modo Transmissor</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Este aparelho será a câmera. Ative o modo tela cheia para evitar que o sistema entre em repouso.</p>
            </div>
            <button className="btn-primary w-full py-4 rounded-xl font-bold text-xs tracking-widest uppercase">Iniciar Câmera</button>
        </div>

        {/* Monitor */}
        <div className="spy-card p-10 flex flex-col items-center text-center gap-6 hover:border-red-500/50 transition-all cursor-pointer group" onClick={() => onSelectMode(AppMode.MONITOR)}>
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-desktop text-4xl text-red-500"></i>
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2">Modo Monitor</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Acesse o feed remoto de outro dispositivo. Insira o ID ou escaneie o QR Code para visualizar.</p>
            </div>
            <button className="btn-danger w-full py-4 rounded-xl font-bold text-xs tracking-widest uppercase text-white">Centro de Comando</button>
        </div>
      </div>
      
      <div className="mt-16 text-[10px] text-slate-600 font-bold tracking-[0.3em] uppercase border-t border-slate-800 pt-8 w-full text-center">
        Segurança P2P Criptografada • Versão 5.0 Enterprise
      </div>
    </div>
  );
};

export default Home;
