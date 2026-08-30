import React, { useEffect, useState } from 'react';
import { AudioVisualizer } from './AudioVisualizer';
import { usePlayer } from '../context/PlayerContext';
import { radioService } from '../services/api';
import type { Station } from '../types/radio';
import { SideMenu } from './SideMenu';
import {
  Play,
  Volume2,
  VolumeX,
  Radio,
  Music2,
  Loader2,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface RadioLayoutProps {
  onLoaded?: () => void;
}

export const RadioLayout: React.FC<RadioLayoutProps> = ({ onLoaded }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isFetchingStations, setIsFetchingStations] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    currentStation,
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    isLoading,
    playTrack,
    setStation,
    togglePlay,
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

  const bgUrl = currentStation?.background_url;
  const themeColor = currentStation?.theme_color || '#38bdf8';
  const slug = currentStation?.slug;

  return (
    <div className="relative h-[100dvh] min-h-[560px] w-screen flex flex-col overflow-hidden bg-slate-950 text-white font-mono select-none">

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
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4 border-b border-cyan-300/20 backdrop-blur-md bg-[#070b1f]/90 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-[0_0_18px_rgba(34,211,238,0.55)] transition-colors duration-500"
            style={{ backgroundColor: themeColor }}
          >
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base tracking-wider leading-none text-cyan-100 [text-shadow:0_0_10px_rgba(34,211,238,0.8)]">LO-FI RADIO</h1>
            <p className="text-[10px] text-pink-300 mt-1 tracking-[0.18em]">8-BIT SIGNAL</p>
          </div>
        </div>

        {/* Seletor Horizontal de Estações */}
        <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-1 md:order-none md:w-auto md:overflow-visible md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  className={`shrink-0 px-3.5 py-2 rounded-lg border text-left transition-all duration-200 flex flex-col bg-[#0b1230]/90 cursor-pointer ${
                    isSelected
                      ? 'border-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.45)]'
                      : 'border-white/15 hover:bg-[#15204a] hover:border-pink-300/60'
                  }`}
                  style={isSelected ? { borderColor: station.theme_color } : {}}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
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

        {/* Menu lateral */}
        <SideMenu onSelectTrack={playTrack} />
      </header>

      {/* 3. Área Central (Visualizador de Ondas na base do GIF) */}
      <main className="relative z-10 min-h-0 flex-1 flex flex-col justify-end items-center pb-2 px-3 sm:px-4 pointer-events-none">
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
      <footer className="relative z-20 shrink-0 px-3 py-3 sm:px-4 sm:py-2.5 border-t border-pink-300/20 backdrop-blur-xl bg-[#070b1f]/95 shadow-[0_-8px_30px_rgba(15,23,42,0.8)]">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

          {/* Esquerda: Info da Faixa + Progresso */}
          <div className="flex items-center gap-3 w-full min-w-0 sm:max-w-sm sm:flex-1">
            {/* Capa Quadrada */}
            <div className="relative w-11 h-11 rounded-md overflow-hidden border border-cyan-300/40 flex-shrink-0 bg-slate-900 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
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

            {/* Metadados da faixa */}
            <div className="min-w-0 flex-1 sm:text-left">
              <h3 className="text-sm font-bold text-white truncate leading-tight text-left sm:text-center">
                {currentTrack?.title || 'Sintonizando...'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate text-left sm:text-center">
                {currentTrack?.artist?.name || 'Lo-Fi Radio'}
              </p>

            </div>
          </div>

          {/* Centro: Controles de Reprodução */}
          <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:order-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-[0_0_20px_rgba(34,211,238,0.45)] transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: themeColor }}
              title={isPlaying ? 'Parar' : 'Entrar na rádio'}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <span className="block w-4 h-4 border-2 border-white rounded-sm" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

          </div>

          {/* Direita: Volume & Fullscreen */}
          <div className="flex w-full items-center justify-center gap-3 sm:order-3 sm:w-48 sm:justify-end">
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

    </div>
  );
};

export default RadioLayout;