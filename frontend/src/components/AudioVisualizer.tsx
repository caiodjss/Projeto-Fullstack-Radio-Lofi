import { FC } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  themeColor?: string;
  stationSlug?: string;
}

// Ritmo base de cada estação (em segundos)
// Menor = Mais rápido / Maior = Mais lento e calmo
const STATION_SPEEDS: Record<string, number> = {
  'lofi-chill': 1.1,     // Lento e relaxante
  'vaporwave': 0.65,     // Médio/Animado com sintetizadores
  'lofi-br': 0.9,        // Ritmo balançado de Bossa
  'midnight-rnb': 1.4,   // Bem lento e atmosférico
};

export const AudioVisualizer: FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 18,
  themeColor = '#8b5cf6',
  stationSlug = 'lofi-chill',
}) => {
  // Pega a velocidade base da estação ativa (ou 1.0 como fallback)
  const baseSpeed = STATION_SPEEDS[stationSlug] || 1.0;

  const bars = Array.from({ length: barCount }, (_, i) => {
    const duration = (baseSpeed * (0.8 + (i % 5) * 0.15)).toFixed(2);
    const delay = ((i % 4) * (baseSpeed * 0.1)).toFixed(2);

    return {
      id: i,
      duration: `${duration}s`,
      delay: `${delay}s`,
    };
  });

  return (
    <div className="flex items-end justify-center gap-1.5 h-12 px-4 py-1">
      {bars.map((bar) => (
        <span
          key={bar.id}
          className={`w-1 rounded-full transition-all duration-300 ${
            isPlaying ? 'animate-bounce-bar' : 'h-1.5 opacity-40'
          }`}
          style={{
            backgroundColor: themeColor,
            animationDuration: bar.duration,
            animationDelay: bar.delay,
            height: isPlaying ? undefined : '6px',
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;