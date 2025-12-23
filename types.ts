
export enum AppMode {
  IDLE = 'IDLE',
  CAMERA = 'CAMERA',
  MONITOR = 'MONITOR'
}

export interface PeerMessage {
  type: 'status' | 'info';
  content: string;
}
