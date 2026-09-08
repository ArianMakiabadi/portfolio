import { DIGIT_MINUS_SPRITE, DIGIT_SPRITES } from "./minesweeperSprites";

type MinesweeperDigitDisplayProps = {
  value: number;
};

function formatDigits(value: number): string[] {
  if (value < 0) {
    const magnitude = -value % 100;
    const magnitudeStr = magnitude < 10 ? `0${magnitude}` : `${magnitude}`;
    return ["-", ...magnitudeStr.split("")];
  }
  const capped = value < 999 ? value : 999;
  return String(capped).padStart(3, "0").split("");
}

function MinesweeperDigitDisplay({ value }: MinesweeperDigitDisplayProps) {
  const digits = formatDigits(value);

  return (
    <div className="mine-digit-panel">
      {digits.map((digit, index) => (
        <img
          key={index}
          src={digit === "-" ? DIGIT_MINUS_SPRITE : DIGIT_SPRITES[Number(digit)]}
          alt={digit}
          className="pointer-events-none select-none"
        />
      ))}
    </div>
  );
}

export default MinesweeperDigitDisplay;
