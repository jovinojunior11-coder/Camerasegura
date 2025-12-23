
import React, { useState, useEffect } from 'react';
import { AppMode } from './types.ts';
import CameraMode from './components/CameraMode.tsx';
import MonitorMode from './components/MonitorMode.tsx';
import Home from './components/Home.tsx';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.IDLE);
  const [targetId, setTargetId] = useState<string>('');

  useEffect(() => {
    const handleNavigation = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');

      // Prioridade 1: Deep Link de monitoramento (se tiver id na URL)
      if (idParam) {
        setTargetId(idParam.toUpperCase());
        setMode(AppMode.MONITOR);
      } 
      // Prioridade 2: Navegação via Hash
      else if (hash === '#camera') {
        setMode(AppMode.CAMERA);
      } else if (hash === '#monitor') {
        setMode(AppMode.MONITOR);
      } 
      // Prioridade 3: Tela Inicial
      else {
        setMode(AppMode.IDLE);
      }
    };

    // Escuta mudanças de hash para navegação "voltar" do navegador
    window.addEventListener('hashchange', handleNavigation);
    
    // Execução inicial
    handleNavigation();

    return () => window.removeEventListener('hashchange', handleNavigation);
  }, []);

  const navigateTo = (newMode: AppMode) => {
    if (newMode === AppMode.CAMERA) {
      window.location.hash = 'camera';
    } else if (newMode === AppMode.MONITOR) {
      window.location.hash = 'monitor';
    } else {
      // Limpa URL completamente ao voltar para o início
      const url = new URL(window.location.href);
      url.search = '';
      url.hash = '';
      window.history.replaceState({}, '', url.toString());
      setMode(AppMode.IDLE);
      setTargetId('');
    }
  };

  return (
    <div className="min-h-screen text-slate-200 p-4 md:p-8 flex flex-col items-center bg-[#0f172a]">
      <header className="w-full max-w-5xl flex justify-between items-center mb-10 md:mb-16">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo(AppMode.IDLE)}>
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
            <i className="fas fa-user-shield text-xl text-white"></i>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">
              SpyPhone <span className="text-blue-500">Security</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">v5.0 stable</span>
          </div>
        </div>
        
        {mode !== AppMode.IDLE && (
          <button 
            onClick={() => navigateTo(AppMode.IDLE)}
            className="bg-slate-800/50 hover:bg-slate-800 px-5 py-2.5 rounded-xl text-slate-300 transition-all border border-white/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm"
          >
            <i className="fas fa-home"></i> Início
          </button>
        )}
      </header>

      <main className="w-full max-w-5xl flex-grow flex flex-col items-center">
        {mode === AppMode.IDLE && <Home onSelectMode={navigateTo} />}
        {mode === AppMode.CAMERA && <CameraMode />}
        {mode === AppMode.MONITOR && <MonitorMode initialTargetId={targetId} />}
      </main>

      <footer className="mt-20 py-10 border-t border-white/5 w-full max-w-5xl text-center">
        <div className="flex justify-center gap-6 mb-4 text-slate-500 text-lg">
            <i className="fab fa-github hover:text-white cursor-pointer transition-colors"></i>
            <i className="fas fa-lock hover:text-white cursor-pointer transition-colors"></i>
            <i className="fas fa-shield-halved hover:text-white cursor-pointer transition-colors"></i>
        </div>
        <p className="text-slate-600 text-[9px] font-black tracking-[0.4em] uppercase">
          SpyPhone Cam &copy; {new Date().getFullYear()} • Conexão P2P Segura
        </p>
      </footer>
    </div>
  );
};

export default App;
