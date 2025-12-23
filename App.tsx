
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
        if (idParam) setTargetId(idParam);
      } else {
        setMode(AppMode.IDLE);
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    handleNavigation();
    return () => window.removeEventListener('hashchange', handleNavigation);
  }, []);

  const navigateTo = (newMode: AppMode) => {
    if (newMode === AppMode.CAMERA) window.location.hash = 'camera';
    else if (newMode === AppMode.MONITOR) window.location.hash = 'monitor';
    else {
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
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo(AppMode.IDLE)}>
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
            <i className="fas fa-user-secret text-xl text-white"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              SpyPhone <span className="text-blue-500">Security</span>
            </h1>
            <span className="text-[10px] font-black text-slate-500 uppercase">v5.0 Enterprise</span>
          </div>
        </div>
        
        {mode !== AppMode.IDLE && (
          <button 
            onClick={() => navigateTo(AppMode.IDLE)}
            className="bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-lg text-slate-300 transition-all border border-white/5 flex items-center gap-2 text-xs font-bold"
          >
            <i className="fas fa-home"></i> INÍCIO
          </button>
        )}
      </header>

      <main className="w-full max-w-5xl flex-grow flex flex-col items-center">
        {mode === AppMode.IDLE && <Home onSelectMode={navigateTo} />}
        {mode === AppMode.CAMERA && <CameraMode />}
        {mode === AppMode.MONITOR && <MonitorMode initialTargetId={targetId} />}
      </main>

      <footer className="mt-16 py-8 border-t border-white/5 w-full max-w-5xl text-center text-slate-600 text-[10px] font-bold tracking-widest uppercase">
        SpyPhone Security Cam &copy; {new Date().getFullYear()} • Conexão P2P Criptografada
      </footer>
    </div>
  );
};

export default App;
