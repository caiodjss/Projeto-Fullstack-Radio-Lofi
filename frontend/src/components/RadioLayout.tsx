import { useEffect, useState } from 'react';

import { usePlayer } from '../context/PlayerContext';
import { radioService } from '../services/api';
import type { Station } from '../types/radio';

import { Heart, ListMusic } from 'lucide-react';

import { TrackDrawer } from './TrackDrawer';
import { useFavorites } from '../hooks/useFavorites';

type IconProps = {
  className?: string;
};

const Icon = ({
  className,
  children,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Play = (props: IconProps) => (
  <Icon {...props}>
    <path d="m6 3 14 9-14 9V3z" />
  </Icon>
);

const Pause = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
  </Icon>
);

const SkipForward = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 4 10 8-10 8V4zM19 5v14" />
  </Icon>
);

const SkipBack = (props: IconProps) => (
  <Icon {...props}>
    <path d="m19 4-10 8 10 8V4zM5 5v14" />
  </Icon>
);

const Volume2 = (props: IconProps) => (
  <Icon {...props}>
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 5a10 10 0 0 1 0 14" />
  </Icon>
);

const VolumeX = (props: IconProps) => (
  <Icon {...props}>
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <path d="M18 9l4 6" />
    <path d="M22 9l-4 6" />
  </Icon>
);

const Radio = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8M2.8 2.8a13 13 0 0 0 0 18.4M21.2 2.8a13 13 0 0 1 0 18.4" />
  </Icon>
);

const Music2 = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="8" cy="18" r="3" />
    <path d="M11 18V5l10-2v13M11 8l10-2" />
  </Icon>
);

const Loader2 = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </Icon>
);

export const RadioLayout: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isFetchingStations, setIsFetchingStations] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();

  const {
    currentStation,
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    isLoading,
    setStation,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolumeLevel,
    toggleMute,
  } = usePlayer();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await radioService.getStations();

        setStations(data);

        if (data.length > 0 && !currentStation) {
          setStation(data[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar estações:', error);
      } finally {
        setIsFetchingStations(false);
      }
    };

    fetchStations();
  }, []);

  const bgUrl =
    currentStation?.background_url ||
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1920&auto=format&fit=crop&q=80';

  const themeColor = currentStation?.theme_color || '#8b5cf6';

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-950 text-white font-sans select-none">

      {/* Fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-105"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40 backdrop-blur-xs" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-md bg-black/20">

        <div className="flex items-center gap-3">

          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500"
            style={{ backgroundColor: themeColor }}
          >
            <Radio className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="font-bold text-lg tracking-wider">
              LO-FI RADIO
            </h1>

            <p className="text-xs text-slate-300">
              Continuous Beats & Atmospheres
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">

          {/* Estação atual */}
          {currentStation && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">

              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: themeColor }}
              />

              <span className="text-xs font-medium text-slate-200">
                {currentStation.name}
              </span>

            </div>
          )}

          {/* Botão de faixas */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 transition-colors text-xs font-medium backdrop-blur-md"
            title="Ver faixas da rádio"
          >
            <ListMusic className="w-4 h-4" />

            <span className="hidden sm:inline">
              Faixas
            </span>
          </button>

        </div>
      </header>

      {/* Área Central */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center">

        {/* Informações da faixa */}
        <div className="mb-10 p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md w-full max-w-lg shadow-2xl">

          <div className="flex items-center justify-center gap-3 mb-4">

            {currentTrack?.artist?.avatar_url ? (
              <img
                src={currentTrack.artist.avatar_url}
                alt={currentTrack.artist.name}
                className="w-12 h-12 rounded-full border-2 object-cover"
                style={{ borderColor: themeColor }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-slate-300" />
              </div>
            )}

            <div className="text-left">

              <h2 className="text-xl font-bold text-white tracking-wide truncate max-w-[280px]">
                {currentTrack?.title || 'Sintonizando rádio...'}
              </h2>

              <p className="text-sm text-slate-300">
                {currentTrack?.artist?.name || 'Artista'}
              </p>

            </div>

          </div>

          {currentStation && (
            <p className="text-xs text-slate-400 italic mt-2 border-t border-white/5 pt-3">
              "{currentStation.description}"
            </p>
          )}

        </div>

        {/* Estações */}
        <div className="w-full">

          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Selecione uma Estação
          </h3>

          {isFetchingStations ? (
            <div className="flex justify-center items-center py-6 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Carregando estações...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {stations.map((station) => {

                const isSelected =
                  currentStation?.id === station.id;

                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => setStation(station)}
                    className={`p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between backdrop-blur-md ${
                      isSelected
                        ? 'border-white/40 bg-white/20 shadow-lg scale-105'
                        : 'border-white/10 bg-black/30 hover:bg-white/10 hover:border-white/20'
                    }`}
                    style={
                      isSelected
                        ? { borderColor: station.theme_color }
                        : {}
                    }
                  >

                    <span className="font-semibold text-sm text-white line-clamp-1">
                      {station.name}
                    </span>

                    <span className="text-[10px] text-slate-400 mt-2">
                      {station.tracks?.length || 0} faixas
                    </span>

                  </button>
                );
              })}

            </div>
          )}

        </div>

      </main>

      {/* Player */}
      <footer className="relative z-10 px-6 py-4 border-t border-white/10 backdrop-blur-md bg-black/40">

        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Controles */}
          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={previousTrack}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Faixa Anterior"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
              title={isPlaying ? 'Pausar' : 'Tocar'}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Próxima Faixa"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Favorito */}
            {currentTrack && (
              <button
                type="button"
                onClick={() => toggleFavorite(currentTrack)}
                className="p-2 rounded-full transition-transform active:scale-90 hover:bg-white/10"
                title={
                  isFavorite(currentTrack.id)
                    ? 'Remover dos favoritos'
                    : 'Favoritar faixa'
                }
              >
                <Heart
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isFavorite(currentTrack.id)
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-slate-400 hover:text-rose-400'
                  }`}
                />
              </button>
            )}

          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 w-full sm:w-48">

            <button
              type="button"
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) =>
                setVolumeLevel(parseFloat(e.target.value))
              }
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />

          </div>

        </div>

      </footer>

      {/* Drawer de Faixas */}
      <TrackDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

    </div>
  );
};

export default RadioLayout;