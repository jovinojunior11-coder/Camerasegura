
import React, { useEffect, useRef, useState } from 'react';
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

interface MonitorModeProps {
  initialTargetId?: string;
}

const MonitorMode: React.FC<MonitorModeProps> = ({ initialTargetId = '' }) => {
  const [targetId, setTargetId] = useState<string>(initialTargetId);
  const [status, setStatus] = useState<'OFFLINE' | 'SYNC' | 'ONLINE'>('OFFLINE');
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = `websecure-shot-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (!stream) return;

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `websecure-rec-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    const peer = new Peer(PEER_CONFIG);
    peerRef.current = peer;

    peer.on('error', (err) => {
      console.error("Monitor Peer Error:", err);
      setError('Erro de conexão. Verifique se o ID está correto.');
      setStatus('OFFLINE');
    });

    if (initialTargetId) {
      // Pequeno delay para garantir que o Peer está pronto
      setTimeout(() => connectToPeer(initialTargetId), 800);
    }

    return () => {
      peer.destroy();
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
    };
  }, []);

  const connectToPeer = (idToConnect: string) => {
    if (!idToConnect || !peerRef.current) return;
    setError(null);
    setStatus('SYNC');
    
    // IMPORTANTE: PeerJS precisa de um stream (mesmo que vazio) para iniciar a chamada
    const call = peerRef.current.call(idToConnect, new MediaStream());
    
    call.on('stream', (remoteStream) => {
      console.log("Stream remoto recebido!");
      setStatus('ONLINE');
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
      }
    });

    // Fallback caso a conexão demore muito
    setTimeout(() => {
      if (status === 'SYNC') {
        setError('O transmissor não respondeu. Verifique se a câmera está ativa.');
        setStatus('OFFLINE');
      }
    }, 15000);
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
      <div className="video-container w-full max-w-4xl aspect-video glass flex items-center justify-center relative border-2 border-cyan-500/20 shadow-2xl">
        {status === 'ONLINE' ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className={`w-20 h-20 rounded-full border-2 border-dashed ${status === 'SYNC' ? 'border-cyan-500 animate-spin' : 'border-slate-800'} flex items-center justify-center`}>
                <i className={`fas ${status === 'SYNC' ? 'fa-sync text-cyan-500' : 'fa-video-slash text-slate-800'} text-3xl`}></i>
            </div>
            <p className="font-black text-[10px] tracking-[0.4em] text-slate-600 uppercase">
                {status === 'SYNC' ? 'SINCRONIZANDO SINAL...' : 'SINAL INDISPONÍVEL'}
            </p>
          </div>
        )}
        
        <div className="scan-line"></div>
        
        {/* HUD Overlay */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${status === 'ONLINE' ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-slate-700'}`}></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{status === 'ONLINE' ? 'LIVE FEED' : 'NO SIGNAL'}</span>
            </div>
            {isRecording && (
                <div className="bg-rose-600/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">GRAVANDO</span>
                </div>
            )}
        </div>

        {status === 'ONLINE' && (
            <div className="absolute bottom-6 right-6 z-20 flex gap-3">
                <button 
                    onClick={toggleRecording}
                    className={`p-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 ${isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/10 text-white backdrop-blur-xl border border-white/10 hover:bg-white/20'}`}
                    title={isRecording ? "Parar Gravação" : "Gravar Vídeo"}
                >
                    <i className={`fas ${isRecording ? 'fa-stop' : 'fa-circle'} text-xl`}></i>
                </button>
                <button 
                    onClick={takeSnapshot}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 shadow-cyan-900/40"
                    title="Capturar Foto"
                >
                    <i className="fas fa-camera text-xl"></i>
                </button>
            </div>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>

      <div className="w-full max-w-4xl glass p-8 md:p-10 rounded-[2.5rem] border-cyan-500/10">
        <form onSubmit={(e) => { e.preventDefault(); connectToPeer(targetId.trim()); }} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <i className="fas fa-key absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500/50"></i>
            <input 
              type="text" 
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Digite o ID da Câmera (ex: WEB-12345)" 
              className="w-full bg-slate-950 border-2 border-slate-800 focus:border-cyan-500/40 rounded-2xl py-5 pl-14 pr-6 text-white font-mono text-lg transition-all outline-none shadow-inner"
            />
          </div>
          <button 
            type="submit"
            disabled={status === 'SYNC'}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-black px-12 py-5 rounded-2xl shadow-xl shadow-cyan-900/40 transition-all flex items-center justify-center gap-3"
          >
            {status === 'SYNC' ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-bolt"></i>}
            CONECTAR AGORA
          </button>
        </form>
        {error && <p className="mt-4 text-rose-500 text-xs font-bold text-center uppercase tracking-widest bg-rose-500/10 py-2 rounded-lg">{error}</p>}
      </div>
    </div>
  );
};

export default MonitorMode;
