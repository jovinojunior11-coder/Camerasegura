
import React, { useEffect, useRef, useState } from 'react';
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

interface MonitorModeProps {
  initialTargetId?: string;
}

const MonitorMode: React.FC<MonitorModeProps> = ({ initialTargetId = '' }) => {
  const [targetId, setTargetId] = useState(initialTargetId);
  const [status, setStatus] = useState<'IDLE' | 'BUSCANDO' | 'LIVE'>('IDLE');
  const [isRecording, setIsRecording] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const peer = new Peer(PEER_CONFIG);
    peerRef.current = peer;

    if (initialTargetId) {
      setTimeout(() => connect(initialTargetId), 1000);
    }

    return () => {
      peer.destroy();
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    };
  }, []);

  const connect = (id: string) => {
    if (!id || !peerRef.current) return;
    setStatus('BUSCANDO');
    
    // Silent Audio Handshake para garantir disparo do stream
    const call = peerRef.current.call(id, new MediaStream());

    call.on('stream', (remoteStream) => {
      setStatus('LIVE');
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
        videoRef.current.play().catch(() => console.warn("Autoplay blocked, user interaction needed"));
      }
    });

    call.on('error', () => {
      setStatus('IDLE');
      alert("Falha ao conectar com a câmera. Verifique se o ID está correto.");
    });
  };

  const record = () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (!stream) return;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spy-capture-${Date.now()}.webm`;
        a.click();
      };
      recorder.start();
      setIsRecording(true);
    }
  };

  const snap = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const a = document.createElement('a');
    a.download = `spy-shot-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 animate-in zoom-in-95 duration-500">
      <div className="spy-card overflow-hidden bg-black aspect-video relative flex items-center justify-center">
        {status === 'LIVE' ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <i className={`fas ${status === 'BUSCANDO' ? 'fa-satellite-dish animate-spin text-blue-500' : 'fa-monitor-heart-rate text-slate-700'} text-5xl`}></i>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest">{status === 'BUSCANDO' ? 'SINCROIZANDO SINAL...' : 'AGUARDANDO CONEXÃO'}</span>
          </div>
        )}
        <div className="scanline"></div>
        
        {status === 'LIVE' && (
          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <button onClick={record} className={`p-4 rounded-xl shadow-xl transition-all ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}>
                <i className={`fas ${isRecording ? 'fa-stop' : 'fa-circle'}`}></i>
            </button>
            <button onClick={snap} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl shadow-xl transition-all">
                <i className="fas fa-camera"></i>
            </button>
          </div>
        )}
      </div>

      <div className="spy-card p-8 border-blue-500/20">
        <div className="flex flex-col md:flex-row gap-4">
            <input 
                value={targetId} 
                onChange={e => setTargetId(e.target.value.toUpperCase())} 
                placeholder="ID DA CÂMERA (EX: SPY-1234)" 
                className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-4 py-4 font-mono text-blue-400 outline-none focus:border-blue-500 transition-all"
            />
            <button 
                onClick={() => connect(targetId.trim())}
                className="btn-primary px-10 py-4 rounded-lg font-bold flex items-center justify-center gap-3"
            >
                <i className="fas fa-link"></i> CONECTAR
            </button>
        </div>
      </div>
    </div>
  );
};

export default MonitorMode;
