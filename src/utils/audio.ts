export function playSound(audio: HTMLAudioElement): void {
  audio.volume = 1;

  void audio.play().catch((error) => {
    console.error("Could not play sound:", audio, error);
  });
}
