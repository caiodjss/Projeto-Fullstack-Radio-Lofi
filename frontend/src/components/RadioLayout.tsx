import React, { useEffect, useState } from 'react';
import { AudioVisualizer } from './AudioVisualizer';
import { usePlayer } from '../context/PlayerContext';
import { radioService } from '../services/api';
import type { Station } from '../types/radio';
import { TrackDrawer } from './TrackDrawer';
import { useFavorites } from '../hooks/useFavorites';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Radio,
  Music2,
  Loader2,
  Heart,
  ListMusic,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface RadioLayoutProps {
  onLoaded?: () => void;
}

export const RadioLayout: React.FC<RadioLayoutProps> = ({ onLoaded }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isFetchingStations, setIsFetchingStations] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();

  const {
    currentStation,
    currentTrack,
    currentTime,
    duration,
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
    seekTo,
  } = usePlayer();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await radioService.getStations();
        setStations(data);

        if (data.length > 0 && !currentStation) {
          setStation(data[0]);
        }

        onLoaded?.();
      } catch (error) {
        console.error('Erro ao buscar estações:', error);
        onLoaded?.();
      } finally {
        setIsFetchingStations(false);
      }
    };

    fetchStations();
  }, [currentStation, onLoaded, setStation]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const bgUrl = currentStation?.background_url;
  const themeColor = currentStation?.theme_color || '#38bdf8';
  const slug = currentStation?.slug;

  return (
    <div className="relative h-screen w-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-white font-sans select-none">
      
      {/* 1. Camada de Fundo (GIF em Pixel Art) */}
      <div className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden z-0">
        {bgUrl && (
          <img
            src={bgUrl}
            alt={currentStation?.name || 'Background'}
            className="w-full h-full object-cover pointer-events-none transition-opacity duration-700 select-none"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
        {/* Vinheta/Gradiente inferior para destacar as ondas e o footer */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60 pointer-events-none" />
      </div>

      {/* 2. Top Header (Logo + Estações Horizontais + Faixas) */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 backdrop-blur-md bg-black/40">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500"
            style={{ backgroundColor: themeColor }}
          >
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base tracking-wider leading-none">LO-FI RADIO</h1>
            <p className="text-[11px] text-slate-300 mt-1">Continuous Beats & Atmospheres</p>
          </div>
        </div>

        {/* Seletor Horizontal de Estações */}
        <nav className="hidden md:flex items-center gap-2">
          {isFetchingStations ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
            </div>
          ) : (
            stations.map((station) => {
              const isSelected = currentStation?.id === station.id;
              return (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => setStation(station)}
                  className={`px-3.5 py-2 rounded-xl border text-left transition-all duration-200 flex flex-col backdrop-blur-md cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 border-sky-400 shadow-md scale-102'
                      : 'bg-black/30 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                  style={isSelected ? { borderColor: station.theme_color } : {}}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: station.theme_color }}
                      />
                    )}
                    <span className="text-xs font-semibold text-white truncate max-w-[130px]">
                      {station.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {station.tracks?.length || 0} faixas
                  </span>
                </button>
              );
            })
          )}
        </nav>

        {/* Botão Gaveta de Faixas */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 text-slate-100 transition-colors text-xs font-medium backdrop-blur-md cursor-pointer"
        >
          <ListMusic className="w-4 h-4" />
          <span>Faixas</span>
        </button>
      </header>

      {/* 3. Área Central (Visualizador de Ondas na base do GIF) */}
      <main className="relative z-10 flex-1 flex flex-col justify-end items-center pb-2 px-4 pointer-events-none">
        <div className="w-full max-w-5xl">
          <AudioVisualizer
            isPlaying={isPlaying}
            themeColor={themeColor}
            stationSlug={slug}
            barCount={48}
          />
        </div>
      </main>

      {/* 4. Player Inferior Integrado */}
      <footer className="relative z-20 px-4 py-2.5 border-t border-white/10 backdrop-blur-xl bg-black/60 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Esquerda: Info da Faixa + Progresso */}
          <div className="flex items-center gap-3 min-w-[220px] max-w-sm flex-1">
            {/* Capa Quadrada */}
            <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-slate-900 shadow-md">
              {currentTrack?.artist?.avatar_url ? (
                <img
                  src={currentTrack.artist.avatar_url}
                  alt={currentTrack.artist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>

            {/* Metadados & Barra de Progresso Falsa/Duração */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate leading-tight">
                {currentTrack?.title || 'Sintonizando...'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {currentTrack?.artist?.name || 'Lo-Fi Radio'}
              </p>

              {/* Linha de Tempo */}
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                <span>{formatDuration(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || currentTime)}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full h-1.5 accent-white cursor-pointer"
                  style={{ accentColor: themeColor }}
                />
                <span>{formatDuration(currentTrack?.duration_seconds || duration)}</span>
              </div>
            </div>
          </div>

          {/* Centro: Controles de Reprodução */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={previousTrack}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Anterior"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: themeColor }}
              title={isPlaying ? 'Pausar' : 'Tocar'}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Próxima"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {currentTrack && (
              <button
                type="button"
                onClick={() => toggleFavorite(currentTrack)}
                className="p-2 rounded-full transition-transform active:scale-90 hover:bg-white/10 cursor-pointer"
                title={isFavorite(currentTrack.id) ? 'Desfavoritar' : 'Favoritar'}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite(currentTrack.id)
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-slate-400 hover:text-rose-400'
                  }`}
                />
              </button>
            )}
          </div>

          {/* Direita: Volume & Fullscreen */}
          <div className="flex items-center gap-3 w-48 justify-end">
            <button
              type="button"
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
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
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />

            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer ml-1"
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </footer>

      {/* Drawer Lateral */}
      <TrackDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default RadioLayout;