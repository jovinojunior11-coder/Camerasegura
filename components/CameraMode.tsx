
import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Peer from 'peerjs';

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ],
  },
};

const CameraMode: React.FC = () => {
  const [peerId, setPeerId] = useState<string>('');
  const [status, setStatus] = useState<'OFF' | 'PRONTO' | 'TRANSMITINDO'>('OFF');
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
        console.log("🔋 WakeLock Ativo: Impedindo hibernação");
      }
    } catch (err) { 
      console.warn("WakeLock falhou ou não é suportado neste navegador."); 
    }
  };

  const initCamera = async (mode: 'user' | 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: mode, 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      alert("ERRO: Acesso à câmera negado. Por favor, autorize nas configurações do seu navegador.");
      return null;
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
        // Ao entrar em tela cheia, reforçamos o pedido de WakeLock
        requestWakeLock();
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) { 
      console.error("Erro ao alternar tela cheia:", e);
    }
  };

  useEffect(() => {
    const randomId = 'SPY-' + Math.floor(Math.random() * 9000 + 1000);
    const peer = new Peer(randomId, PEER_CONFIG);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      setStatus('PRONTO');
      requestWakeLock();
    });

    peer.on('call', (call) => {
      if (streamRef.current) {
        call.answer(streamRef.current);
        setStatus('TRANSMITINDO');
      }
      call.on('close', () => setStatus('PRONTO'));
    });

    initCamera(facingMode);

    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);

    return () => {
      peer.destroy();
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (wakeLockRef.current) wakeLockRef.current.release();
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, []);

  const changeCam = async () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    await initCamera(next);
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}?id=${peerId}#monitor`;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 overflow-y-auto max-h-screen pb-10">
      <div 
        ref={containerRef}
        className="relative spy-card overflow-hidden bg-black aspect-video flex items-center justify-center group border-2 border-slate-800"
      >
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <div className="scanline"></div>
        
        {/* HUD Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'TRANSMITINDO' ? 'bg-red-500 animate-pulse' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{status}</span>
            </div>
            {peerId && <div className="bg-blue-600/20 text-[10px] px-2 py-0.5 rounded font-mono border border-blue-500/30 text-blue-400">ID: {peerId}</div>}
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={changeCam} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl backdrop-blur-xl border border-white/10 transition-all active:scale-95 text-white">
                <i className="fas fa-camera-rotate"></i>
            </button>
            <button onClick={toggleFullscreen} className="bg-blue-600 hover:bg-blue-500 p-4 rounded-xl shadow-2xl border border-white/10 transition-all active:scale-95 text-white">
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>
        </div>

        {isFullscreen && (
            <div className="absolute top-4 right-4 z-20">
                <button onClick={toggleFullscreen} className="bg-red-600/30 hover:bg-red-600/80 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-white border border-red-500/50">Sair Fullscreen</button>
            </div>
        )}
      </div>

      {!isFullscreen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="spy-card p-6 md:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                      <i className="fas fa-broadcast-tower text-blue-500"></i> Servidor Ativo
                  </h3>
                  <div className="bg-slate-950 p-6 rounded-xl font-mono text-3xl text-center border border-white/5 text-blue-500 shadow-inner">
                      {peerId || 'SPY-XXXX'}
                  </div>
                </div>
                <button 
                    onClick={() => { navigator.clipboard.writeText(shareUrl); alert("✅ Link copiado! Envie para o aparelho monitor."); }}
                    className="btn-primary w-full py-4 mt-6 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 text-white"
                >
                    Copiar Link de Acesso
                </button>
            </div>

            <div className="spy-card p-6 flex flex-col items-center justify-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-2xl">
                    {peerId ? <QRCodeSVG value={shareUrl} size={130} /> : <div className="w-[130px] h-[130px] bg-slate-800 animate-pulse rounded-lg"></div>}
                </div>
                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase text-center">Pareamento Rápido via QR Code</span>
            </div>
        </div>
      )}
      
      {!isFullscreen && (
        <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-start gap-4">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <i className="fas fa-shield-alt text-blue-500 text-sm"></i>
            </div>
            <div>
              <p className="text-[12px] text-slate-300 font-bold mb-1">DICA DE ANTI-HIBERNAÇÃO</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Clique no botão <i className="fas fa-expand mx-1 text-blue-400"></i> para cobrir a tela inteira. Isso força o navegador a manter o dispositivo ativo e desativa automaticamente o bloqueio de tela do sistema (iOS/Android).
              </p>
            </div>
        </div>
      )}
    </div>
  );
};

export default CameraMode;
