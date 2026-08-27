import { FC } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  themeColor?: string;
  stationSlug?: string;
}

const STATION_SPEEDS: Record<string, number> = {
  'lofi-chill': 0.75,
  'vaporwave': 0.6,
  'lofi-br': 0.9,
  'midnight-rnb': 1.4,
};

export const AudioVisualizer: FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 48,
  themeColor = '#38bdf8',
  stationSlug = 'lofi-chill',
}) => {
  const baseSpeed = STATION_SPEEDS[stationSlug] || 1.0;

  const bars = Array.from({ length: barCount }, (_, i) => {
    // Curva de onda simétrica com centro mais alto
    const mid = barCount / 2;
    const distanceFromCenter = Math.abs(i - mid) / mid;
    const factor = 1 - distanceFromCenter * 0.4;

    const duration = (baseSpeed * (0.6 + (i % 6) * 0.12) * factor).toFixed(2);
    const delay = ((i % 5) * 0.08).toFixed(2);

    return {
      id: i,
      duration: `${duration}s`,
      delay: `${delay}s`,
    };
  });

  return (
    <div className="flex items-end justify-center gap-1 sm:gap-1.5 h-14 w-full px-2">
      {bars.map((bar) => (
        <span
          key={bar.id}
          className={`flex-1 max-w-[5px] rounded-full transition-all duration-300 ${
            isPlaying ? 'animate-bounce-bar' : 'h-1 opacity-30'
          }`}
          style={{
            backgroundColor: themeColor,
            animationDuration: bar.duration,
            animationDelay: bar.delay,
            height: isPlaying ? undefined : '4px',
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;