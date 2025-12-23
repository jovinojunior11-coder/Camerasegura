
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
  const [status, setStatus] = useState<'OFFLINE' | 'AGUARDANDO' | 'ONLINE'>('OFFLINE');
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isFlashOn, setIsFlashOn] = useState(false);
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
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
      return newStream;
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setError("Permissão de câmera negada ou dispositivo não encontrado.");
      return null;
    }
  };

  useEffect(() => {
    const camId = 'cam-' + Math.floor(Math.random() * 90000 + 10000);
    const peer = new Peer(camId, PEER_CONFIG);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      setStatus('AGUARDANDO');
    });

    peer.on('call', async (call) => {
      const currentStream = await startStream(facingMode);
      if (currentStream) {
        call.answer(currentStream);
        setStatus('ONLINE');
      }
    });

    peer.on('error', (err) => {
      console.error("PeerJS error:", err);
      setError("Falha na rede P2P. Tente recarregar.");
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
    setIsFlashOn(false);
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}?id=${peerId}#monitor`;

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="video-container w-full max-w-3xl aspect-video relative group border-2 border-rose-500/20 shadow-2xl shadow-rose-500/10">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
            <i className="fas fa-exclamation-triangle text-rose-500 text-5xl mb-4"></i>
            <h3 className="text-xl font-bold text-white mb-2">Erro de Hardware</h3>
            <p className="text-slate-500 text-sm max-w-xs">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-6 bg-rose-600 px-6 py-2 rounded-full font-bold text-xs uppercase">Tentar Novamente</button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            <div className="scan-line"></div>
          </>
        )}
        
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20">
          <span className={`status-dot ${status === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`}></span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
            {status === 'ONLINE' ? 'LINK ATIVO' : 'TRANSMITINDO'}
          </span>
        </div>

        {!error && (
          <div className="absolute bottom-6 right-6 flex gap-3 z-20">
            <button 
              onClick={toggleCamera}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-95 text-white"
            >
              <i className="fas fa-camera-rotate text-xl"></i>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full max-w-3xl">
        <div className="lg:col-span-3 glass p-8 rounded-[2.5rem] relative overflow-hidden">
            <h3 className="text-xs font-black text-rose-400 uppercase tracking-[0.3em] mb-6">Configuração de Túnel</h3>
            <div className="space-y-6">
                <div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">ID da Câmera</span>
                    <div className="bg-slate-950 border border-white/5 p-6 rounded-2xl text-4xl font-mono font-black text-white tracking-widest text-center mt-2 shadow-inner group cursor-pointer" onClick={() => {
                      navigator.clipboard.writeText(peerId);
                      alert("ID copiado!");
                    }}>
                        {peerId || 'CARREGANDO'}
                    </div>
                </div>
                
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        alert("Link copiado!");
                    }}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 rounded-2xl font-black text-sm tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-900/40"
                >
                    <i className="fas fa-share-nodes"></i> COMPARTILHAR LINK
                </button>
            </div>
        </div>

        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center border-rose-500/10">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">QR Code de Acesso</h3>
          <div className="bg-white p-4 rounded-3xl shadow-2xl shadow-rose-500/10 mb-4">
            {peerId ? (
              <QRCodeSVG value={shareUrl} size={140} level="H" />
            ) : (
              <div className="w-[140px] h-[140px] bg-slate-800 animate-pulse rounded-2xl"></div>
            )}
          </div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
            Escaneie para Monitorar
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraMode;
