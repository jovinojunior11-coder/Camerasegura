
import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Peer from 'peerjs';

const PEER_CONFIG = {
  config: {
    'iceServers': [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  }
};

const CameraMode: React.FC = () => {
  const [peerId, setPeerId] = useState<string>('');
  const [status, setStatus] = useState<'OFFLINE' | 'AGUARDANDO' | 'ONLINE'>('OFFLINE');
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log("Wake Lock ativo: a tela não irá apagar.");
      }
    } catch (err) {
      console.warn("Wake Lock falhou:", err);
    }
  };

  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      // Para tracks anteriores se existirem
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setError("Permissão de câmera negada ou erro de hardware.");
      return null;
    }
  };

  useEffect(() => {
    const camId = 'WEB-' + Math.floor(Math.random() * 90000 + 10000);
    const peer = new Peer(camId, PEER_CONFIG);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      setStatus('AGUARDANDO');
      requestWakeLock();
    });

    peer.on('call', (call) => {
      if (streamRef.current) {
        call.answer(streamRef.current);
        setStatus('ONLINE');
      } else {
        startCamera(facingMode).then(stream => {
          if (stream) {
            call.answer(stream);
            setStatus('ONLINE');
          }
        });
      }
    });

    peer.on('error', (err) => {
      console.error("PeerJS error:", err);
      if (err.type === 'peer-unavailable') return;
      setError("Falha na rede P2P: " + err.type);
    });

    startCamera(facingMode);

    return () => {
      peer.destroy();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, []);

  const toggleCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    await startCamera(nextMode);
    // Nota: Em conexões P2P ativas, trocar o stream exige que o monitor reconecte.
    if (status === 'ONLINE') {
      alert("Câmera alterada. O monitor pode precisar reconectar para atualizar o feed.");
    }
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}?id=${peerId}#monitor`;

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="video-container w-full max-w-3xl aspect-video relative group border-2 border-rose-500/20 shadow-2xl">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        <div className="scan-line"></div>
        
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20">
          <span className={`w-2 h-2 rounded-full ${status === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`}></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            {status === 'ONLINE' ? 'EM TRANSMISSÃO' : 'AGUARDANDO CONEXÃO'}
          </span>
        </div>

        <div className="absolute bottom-6 right-6 flex gap-3 z-20">
          <button 
            onClick={toggleCamera}
            className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-95 text-white shadow-xl"
            title="Trocar Câmera"
          >
            <i className="fas fa-camera-rotate text-xl"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full max-w-3xl">
        <div className="lg:col-span-3 glass p-8 rounded-[2.5rem] flex flex-col justify-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">ID DA UNIDADE</h3>
            <div className="bg-slate-950 border border-white/5 p-5 rounded-2xl text-3xl font-mono font-black text-white tracking-widest text-center shadow-inner">
                {peerId || '...'}
            </div>
            <button 
                onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert("Link copiado para a área de transferência!");
                }}
                className="mt-6 w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl font-black text-sm tracking-widest transition-all shadow-lg shadow-rose-900/40"
            >
                COPIAR LINK DE ACESSO
            </button>
        </div>

        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] flex flex-col items-center justify-center border-rose-500/10">
          <div className="bg-white p-3 rounded-2xl mb-4 shadow-xl">
            {peerId ? <QRCodeSVG value={shareUrl} size={130} /> : <div className="w-[130px] h-[130px] bg-slate-800 animate-pulse rounded-xl"></div>}
          </div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Acesso Rápido</p>
        </div>
      </div>
      {error && <p className="text-rose-500 font-bold text-sm bg-rose-500/10 px-4 py-2 rounded-lg">{error}</p>}
    </div>
  );
};

export default CameraMode;
