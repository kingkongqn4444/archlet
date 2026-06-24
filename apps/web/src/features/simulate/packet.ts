export type Packet = {
  id: string;
  edgeId: string;
  progress: number; // 0..1
  speed: number;    // delta per second (normalized)
  bornAt: number;   // ms timestamp
};
