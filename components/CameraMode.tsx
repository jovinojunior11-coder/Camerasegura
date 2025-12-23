
import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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

const CameraMode: React.FC = () => {
  const [peerId, setPeerId] = useState<string>('');
  const [status, setStatus] = useState<'Iniciando...' | 'Aguardando' | 'Conectado'>('Iniciando...');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);

  const startStream = async (mode: 'user' | 'environment') => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      return newStream;
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      return null;
    }
  };

  useEffect(() => {
    const camId = 'cam-' + Math.floor(Math.random() * 90000 + 10000);
    const peer = new Peer(camId, PEER_CONFIG);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      setStatus('Aguardando');
    });

    peer.on('call', async (call) => {
      const currentStream = await startStream(facingMode);
      if (currentStream) {
        call.answer(currentStream);
        setStatus('Conectado');
      }
    });

    peer.on('error', (err) => {
      console.error("PeerJS Error:", err);
      setStatus('Aguardando');
    });

    startStream(facingMode);

    return () => {
      peer.destroy();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const toggleCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    await startStream(nextMode);
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}?id=${peerId}#monitor`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    const btn = document.getElementById('copy-btn');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> COPIADO!';
      btn.classList.replace('bg-slate-700', 'bg-green-600');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.replace('bg-green-600', 'bg-slate-700');
      }, 2000);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-in fade-in duration-500">
      <div className="video-container w-full max-w-3xl aspect-video relative group">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover scale-[1.01]"
        />
        
        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 rounded-[1.5rem]"></div>
        
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <span className={`status-dot ${status === 'Conectado' ? 'bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-pulse'}`}></span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
            {status === 'Conectado' ? 'LIVE' : 'BROADCASTING'}
          </span>
        </div>

        <div className="absolute bottom-6 right-6 flex gap-3">
          <button 
            onClick={toggleCamera}
            className="pointer-events-auto bg-white/10 hover:bg-white/20 p-4 rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-95 group"
            title="Girar Câmera"
          >
            <i className="fas fa-camera-rotate text-white text-xl group-hover:rotate-180 transition-transform duration-500"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full max-w-3xl">
        <div className="lg:col-span-3 glass p-8 rounded-[2rem] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em] mb-4">Painel de Transmissão</h3>
            <p className="text-slate-400 text-sm mb-6">Compartilhe o ID abaixo ou o link direto para que o monitor se conecte via Peer-to-Peer.</p>
            
            <div className="flex flex-col gap-2 mb-8">
              <span className="text-[0.65rem] text-slate-500 font-bold uppercase ml-1">ID ÚNICO</span>
              <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl text-3xl font-mono font-bold text-white tracking-widest text-center shadow-inner">
                {peerId || '-------'}
              </div>
            </div>
          </div>
          
          <button 
            id="copy-btn"
            onClick={copyToClipboard}
            className="w-full bg-slate-700 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 group"
          >
            <i className="fas fa-link group-hover:rotate-45 transition-transform"></i> COPIAR LINK DE ACESSO
          </button>
        </div>

        <div className="lg:col-span-2 glass p-8 rounded-[2rem] flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-6">Acesso Rápido</h3>
          <div className="bg-white p-4 rounded-[1.5rem] shadow-2xl shadow-blue-500/10 mb-6">
            {peerId ? (
              <QRCodeSVG 
                value={shareUrl} 
                size={160} 
                level="H"
                includeMargin={false}
              />
            ) : (
              <div className="w-[160px] h-[160px] bg-slate-800 animate-pulse rounded-xl"></div>
            )}
          </div>
          <p className="text-[0.7rem] text-slate-500 font-medium leading-relaxed px-4">
            Aponte a câmera do dispositivo monitor para o QR Code acima.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraMode;
