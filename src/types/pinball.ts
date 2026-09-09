export type PinballBridge = {
  newGame: () => void;
  launchBall: () => void;
  pauseOrResume: () => void;
  toggleFullScreen: () => void;
  toggleAudio: () => void;
};
