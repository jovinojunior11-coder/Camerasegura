
import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import CameraMode from './components/CameraMode';
import MonitorMode from './components/MonitorMode';
import Home from './components/Home';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.IDLE);
  const [targetId, setTargetId] = useState<string>('');

  useEffect(() => {
    // Basic hash routing
    const handleHashChange = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');

      if (hash === '#camera') {
        setMode(AppMode.CAMERA);
      } else if (hash === '#monitor') {
        setMode(AppMode.MONITOR);
        if (idParam) setTargetId(idParam);
      } else {
        setMode(AppMode.IDLE);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newMode: AppMode) => {
    if (newMode === AppMode.CAMERA) window.location.hash = 'camera';
    else if (newMode === AppMode.MONITOR) window.location.hash = 'monitor';
    else window.location.hash = '';
  };

  return (
    <div className="min-h-screen text-slate-200 p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo(AppMode.IDLE)}>
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
            <i className="fas fa-shield-halved text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            WebSecure <span className="text-blue-500 text-sm font-normal">v4.0</span>
          </h1>
        </div>
        
        {mode !== AppMode.IDLE && (
          <button 
            onClick={() => navigateTo(AppMode.IDLE)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Voltar
          </button>
        )}
      </header>

      <main className="w-full max-w-4xl flex-grow flex flex-col items-center">
        {mode === AppMode.IDLE && <Home onSelectMode={navigateTo} />}
        {mode === AppMode.CAMERA && <CameraMode />}
        {mode === AppMode.MONITOR && <MonitorMode initialTargetId={targetId} />}
      </main>

      <footer className="mt-12 text-slate-500 text-sm">
        Desenvolvido para máxima privacidade P2P &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
