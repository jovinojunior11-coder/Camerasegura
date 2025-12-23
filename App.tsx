
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

      if (hash === '#camera') {
        setMode(AppMode.CAMERA);
      } else if (hash === '#monitor' || idParam) {
        setMode(AppMode.MONITOR);
        if (idParam) {
          setTargetId(idParam);
          // Se entramos via link de ID, garante o hash correto
          if (hash !== '#monitor') window.location.hash = 'monitor';
        }
      } else {
        setMode(AppMode.IDLE);
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('load', handleNavigation);
    handleNavigation();

    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('load', handleNavigation);
    };
  }, []);

  const navigateTo = (newMode: AppMode) => {
    if (newMode === AppMode.CAMERA) window.location.hash = 'camera';
    else if (newMode === AppMode.MONITOR) window.location.hash = 'monitor';
    else {
      // Limpar parâmetros de busca ao voltar para home
      const url = new URL(window.location.href);
      url.search = '';
      url.hash = '';
      window.history.replaceState({}, '', url.toString());
      setMode(AppMode.IDLE);
      setTargetId('');
    }
  };

  return (
    <div className="min-h-screen text-slate-200 p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigateTo(AppMode.IDLE)}>
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2.5 rounded-2xl shadow-xl shadow-blue-900/40 group-hover:scale-110 transition-transform">
            <i className="fas fa-shield-halved text-2xl text-white"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white leading-none">
              WebSecure <span className="text-cyan-500">PRO</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">v4.0 Enterprise</span>
          </div>
        </div>
        
        {mode !== AppMode.IDLE && (
          <button 
            onClick={() => navigateTo(AppMode.IDLE)}
            className="bg-slate-800/50 hover:bg-slate-800 px-6 py-2.5 rounded-full text-slate-400 hover:text-white transition-all border border-white/5 flex items-center gap-2 text-sm font-bold"
          >
            <i className="fas fa-chevron-left text-xs"></i> SAIR DO MODO
          </button>
        )}
      </header>

      <main className="w-full max-w-4xl flex-grow flex flex-col items-center">
        {mode === AppMode.IDLE && <Home onSelectMode={navigateTo} />}
        {mode === AppMode.CAMERA && <CameraMode />}
        {mode === AppMode.MONITOR && <MonitorMode initialTargetId={targetId} />}
      </main>

      <footer className="mt-16 py-8 border-t border-white/5 w-full max-w-4xl flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[10px] font-bold tracking-widest uppercase opacity-50">
        <div>&copy; {new Date().getFullYear()} Criptografia P2P Ponta-a-Ponta</div>
        <div className="flex items-center gap-4">
          <span>Status: Protegido</span>
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
        </div>
      </footer>
    </div>
  );
};

export default App;
