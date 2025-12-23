
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
  const [status, setStatus] = useState<'OFFLINE' | 'SYNC' | 'ONLINE'>('OFFLINE');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peerRef = useRef<Peer | null>(null);

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = `websecure-capture-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  useEffect(() => {
    const peer = new Peer(PEER_CONFIG);
    peerRef.current = peer;

    peer.on('error', () => {
      setError('Falha na comunicação P2P.');
      setStatus('OFFLINE');
    });

    if (initialTargetId) {
      setTimeout(() => connectToPeer(initialTargetId), 1000);
    }

    return () => peer.destroy();
  }, []);

  const connectToPeer = (idToConnect: string) => {
    if (!idToConnect || !peerRef.current) return;
    setError(null);
    setStatus('SYNC');
    
    const call = peerRef.current.call(idToConnect, new MediaStream());
    call.on('stream', (remoteStream) => {
      setStatus('ONLINE');
      if (videoRef.current) videoRef.current.srcObject = remoteStream;
    });

    setTimeout(() => {
      if (status === 'SYNC') {
        setError('Tempo esgotado. Verifique o ID da câmera.');
        setStatus('OFFLINE');
      }
    }, 12000);
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
      <div className="video-container w-full max-w-4xl aspect-video glass flex items-center justify-center relative border-2 border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
        {status === 'ONLINE' ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-cyan-500/20 flex items-center justify-center animate-spin-slow">
                <i className={`fas ${status === 'SYNC' ? 'fa-sync fa-spin text-cyan-500' : 'fa-video-slash text-slate-700'} text-4xl`}></i>
            </div>
            <p className="font-black text-xs tracking-[0.4em] text-slate-600 uppercase">
                {status === 'SYNC' ? 'Sincronizando feed...' : 'Aguardando Conexão'}
            </p>
          </div>
        )}
        
        {/* HUD Monitor */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                <span className={`status-dot ${status === 'ONLINE' ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-slate-600'}`}></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{status}</span>
            </div>
        </div>

        {status === 'ONLINE' && (
            <div className="absolute bottom-6 right-6 z-20 flex gap-3">
                <button 
                    onClick={takeSnapshot}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                    <i className="fas fa-camera"></i>
                </button>
            </div>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>

      <div className="w-full max-w-4xl glass p-10 rounded-[2.5rem] border-cyan-500/10">
        <form onSubmit={(e) => { e.preventDefault(); connectToPeer(targetId.trim()); }} className="flex flex-col md:flex-row gap-5">
          <div className="flex-grow relative group">
            <i className="fas fa-terminal absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500/50"></i>
            <input 
              type="text" 
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Digite o ID da Unidade Remota" 
              className="w-full bg-slate-950/80 border-2 border-slate-800 focus:border-cyan-500/50 rounded-2xl py-5 pl-14 pr-6 text-white font-mono text-lg transition-all outline-none"
            />
          </div>
          <button 
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-12 rounded-2xl shadow-xl shadow-cyan-900/30 transition-all flex items-center justify-center gap-3 whitespace-nowrap"
          >
            <i className="fas fa-plug"></i> CONECTAR
          </button>
        </form>
        {error && <p className="mt-4 text-rose-500 text-xs font-bold text-center uppercase tracking-widest">{error}</p>}
      </div>
    </div>
  );
};

export default MonitorMode;
