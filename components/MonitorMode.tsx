
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

const PEER_CONFIG = {
  config: {
    'iceServers': [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { 
        urls: 'turn:relay.metered.ca:443', 
        username: 'openrelayproject', 
        password: 'openrelayproject' 
      }
    ]
  }
};

interface MonitorModeProps {
  initialTargetId?: string;
}

const MonitorMode: React.FC<MonitorModeProps> = ({ initialTargetId = '' }) => {
  const [targetId, setTargetId] = useState<string>(initialTargetId);
  const [status, setStatus] = useState<'Desconectado' | 'Conectando' | 'Ativo'>('Desconectado');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    const peer = new Peer(PEER_CONFIG);
    peerRef.current = peer;

    peer.on('error', (err) => {
      console.error(err);
      setError('Erro crítico na rede Peer-to-Peer.');
      setStatus('Desconectado');
    });

    if (initialTargetId) {
      setTimeout(() => connectToPeer(initialTargetId), 800);
    }

    return () => peer.destroy();
  }, []);

  const connectToPeer = (idToConnect: string) => {
    if (!idToConnect || !peerRef.current) return;
    
    setError(null);
    setStatus('Conectando');
    
    // Call the camera peer
    const call = peerRef.current.call(idToConnect, new MediaStream());

    call.on('stream', (remoteStream) => {
      setStatus('Ativo');
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
      }
    });

    call.on('close', () => {
      setStatus('Desconectado');
      if (videoRef.current) videoRef.current.srcObject = null;
    });

    setTimeout(() => {
      if (status === 'Conectando') {
        setError('O tempo de resposta expirou. Verifique se a câmera está online.');
        setStatus('Desconectado');
      }
    }, 15000);
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    connectToPeer(targetId.trim());
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="video-container w-full max-w-4xl aspect-video glass flex flex-col items-center justify-center relative">
        {status === 'Ativo' ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-6 text-slate-600">
            <div className="relative">
              <i className={`fas ${status === 'Conectando' ? 'fa-circle-notch fa-spin text-blue-500' : 'fa-video-slash'} text-7xl opacity-20`}></i>
              {status === 'Conectando' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-lg tracking-wide uppercase opacity-40">
                {status === 'Conectando' ? 'Sincronizando Túnel P2P...' : 'Aguardando Sinal de Vídeo'}
              </p>
              <p className="text-xs opacity-30 mt-2">Certifique-se que o ID da câmera está correto.</p>
            </div>
          </div>
        )}
        
        {/* Connection Badge */}
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <span className={`status-dot ${status === 'Ativo' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : status === 'Conectando' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-600'}`}></span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
            MONITOR: {status}
          </span>
        </div>
      </div>

      <div className="w-full max-w-4xl glass p-10 rounded-[2.5rem] border-white/5">
        <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.4em] mb-8 text-center">Centro de Comando</h2>
        <form onSubmit={handleConnect} className="flex flex-col md:flex-row gap-5">
          <div className="flex-grow relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
              <i className="fas fa-satellite-dish"></i>
            </div>
            <input 
              type="text" 
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Digite o ID da Câmera (ex: cam-12345)" 
              className="w-full bg-slate-900/80 border-2 border-slate-800 focus:border-blue-500/50 rounded-2xl py-5 pl-14 pr-6 text-white font-mono text-lg transition-all outline-none placeholder:text-slate-600 placeholder:font-sans"
            />
          </div>
          <button 
            type="submit"
            disabled={status === 'Conectando'}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black px-10 rounded-2xl shadow-xl shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {status === 'Conectando' ? (
              <><i className="fas fa-spinner fa-spin"></i> SINCRONIZANDO</>
            ) : (
              <><i className="fas fa-play"></i> INICIAR MONITOR</>
            )}
          </button>
        </form>
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium animate-in fade-in zoom-in-95 duration-300">
            <i className="fas fa-circle-exclamation"></i> {error}
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-5 pb-10">
        {[
          { icon: 'fa-shield-heart', title: 'Segurança Total', desc: 'Conexão direta ponta-a-ponta' },
          { icon: 'fa-gauge-high', title: 'Real-time', desc: 'Latência mínima garantida' },
          { icon: 'fa-fingerprint', title: 'Privacidade', desc: 'Nenhum dado toca a nuvem' }
        ].map((item, i) => (
          <div key={i} className="glass p-6 rounded-3xl flex items-center gap-5 border-white/5 hover:bg-white/5 transition-colors cursor-default group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <i className={`fas ${item.icon} text-xl`}></i>
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">{item.title}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-tighter">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonitorMode;
