
import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Peer from 'peerjs';

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun.services.mozilla.com' }
    ],
  },
};

const CameraMode: React.FC = () => {
  const [peerId, setPeerId] = useState<string>('');
  const [status, setStatus] = useState<'OFF' | 'READY' | 'STREAMING'>('OFF');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) { console.warn("WakeLock failed"); }
  };

  const initCamera = async (mode: 'user' | 'environment') => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      alert("Erro ao acessar câmera. Verifique as permissões.");
      return null;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        alert(`Erro ao entrar em tela cheia: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const peer = new Peer('SPY-' + Math.floor(Math.random() * 9000 + 1000), PEER_CONFIG);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      setStatus('READY');
      requestWakeLock();
    });

    peer.on('call', (call) => {
      if (streamRef.current) {
        call.answer(streamRef.current);
        setStatus('STREAMING');
      }
      call.on('close', () => setStatus('READY'));
    });

    initCamera(facingMode);

    return () => {
      peer.destroy();
      streamRef.current?.getTracks().forEach(t => t.stop());
      wakeLockRef.current?.release();
    };
  }, []);

  const changeCam = async () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    await initCamera(next);
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}?id=${peerId}#monitor`;

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 animate-in fade-in duration-500">
      <div 
        ref={containerRef}
        id="video-container"
        className={`relative spy-card overflow-hidden bg-black aspect-video flex items-center justify-center ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
      >
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <div className="scanline"></div>
        
        {/* HUD Elements */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur px-3 py-1 rounded-md border border-white/10 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'STREAMING' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                <span className="text-[10px] font-bold tracking-widest">{status === 'STREAMING' ? 'REC - LIVE' : 'STANDBY'}</span>
            </div>
            {peerId && <div className="bg-black/40 text-[9px] px-2 py-1 rounded font-mono">ID: {peerId}</div>}
        </div>

        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <button onClick={changeCam} className="bg-white/10 hover:bg-white/20 p-3 rounded-lg backdrop-blur-md border border-white/10 transition-all">
                <i className="fas fa-sync-alt"></i>
            </button>
            <button onClick={toggleFullscreen} className="bg-white/10 hover:bg-white/20 p-3 rounded-lg backdrop-blur-md border border-white/10 transition-all">
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>
        </div>

        {isFullscreen && (
            <button 
                onClick={toggleFullscreen} 
                className="absolute top-4 right-4 z-20 bg-red-600/50 hover:bg-red-600 p-2 rounded text-[10px] font-bold"
            >
                SAIR TELA CHEIA
            </button>
        )}
      </div>

      {!isFullscreen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="spy-card p-6 md:col-span-2">
                <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                    <i className="fas fa-link text-blue-500"></i> CONEXÃO REMOTA
                </h3>
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-900 p-4 rounded-lg font-mono text-xl text-center border border-white/5">
                        {peerId || 'GERANDO ID...'}
                    </div>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Link de monitoramento copiado!"); }}
                        className="btn-primary w-full py-3 rounded-lg font-bold text-sm"
                    >
                        COPIAR LINK DE ACESSO
                    </button>
                </div>
            </div>

            <div className="spy-card p-6 flex flex-col items-center justify-center">
                <div className="bg-white p-2 rounded-lg mb-3">
                    {peerId ? <QRCodeSVG value={shareUrl} size={120} /> : <div className="w-[120px] h-[120px] bg-slate-800 animate-pulse"></div>}
                </div>
                <span className="text-[10px] font-bold text-slate-500 tracking-tighter">QR CODE DE PAREAMENTO</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default CameraMode;
