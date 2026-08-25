import { FC, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../hooks/useFavorites';
import { Track } from '../types/radio';
import { X, Play, Disc3, Heart } from 'lucide-react';

interface TrackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackDrawer: FC<TrackDrawerProps> = ({ isOpen, onClose }) => {
  const { currentStation, currentTrack, isPlaying, playTrack } = usePlayer();
  const { favoriteTracks, isFavorite, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<'station' | 'favorites'>('station');

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const stationTracks = currentStation?.tracks || [];
  const displayTracks = activeTab === 'station' ? stationTracks : favoriteTracks;
  const themeColor = currentStation?.theme_color || '#8b5cf6';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      <aside className="relative w-full max-w-md h-full bg-slate-900/95 border-l border-white/10 backdrop-blur-xl flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Disc3 className="w-6 h-6 animate-spin text-slate-300" style={{ animationDuration: '6s' }} />
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {activeTab === 'station' ? currentStation?.name : 'Músicas Favoritas'}
              </h2>
              <p className="text-xs text-slate-400">{displayTracks.length} faixas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alternador de Abas */}
        <div className="flex px-6 pt-4 gap-2 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('station')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'station'
                ? 'bg-white/15 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Estação Atual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'favorites'
                ? 'bg-white/15 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            Favoritos ({favoriteTracks.length})
          </button>
        </div>

        {/* Lista de Faixas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {displayTracks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              {activeTab === 'station'
                ? 'Nenhuma faixa encontrada nesta estação.'
                : 'Você ainda não favoritou nenhuma música.'}
            </div>
          ) : (
            displayTracks.map((track: Track, index: number) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`w-full p-3.5 rounded-xl flex items-center justify-between group transition-all duration-200 border ${
                    isCurrent
                      ? 'bg-white/10 border-white/20'
                      : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => playTrack(track)}
                    className="flex items-center gap-3.5 min-w-0 flex-1 text-left"
                  >
                    <span className="text-xs font-mono text-slate-500 w-4 text-center">
                      {isCurrent && isPlaying ? (
                        <span className="flex gap-0.5 justify-center items-end h-3.5">
                          <span className="w-1 bg-white animate-pulse h-2" />
                          <span className="w-1 bg-white animate-pulse h-3.5" />
                          <span className="w-1 bg-white animate-pulse h-1.5" />
                        </span>
                      ) : (
                        index + 1
                      )}
                    </span>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        }`}
                        style={isCurrent ? { color: themeColor } : {}}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {track.artist?.name || 'Artista'}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(track)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorite(track.id) ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => playTrack(track)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isCurrent
                          ? 'bg-white/20 text-white'
                          : 'opacity-0 group-hover:opacity-100 bg-white/10 text-slate-300'
                      }`}
                    >
                      <Play className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};

export default TrackDrawer;