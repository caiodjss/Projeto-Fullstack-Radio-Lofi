import React from 'react';
import { Track } from '../types/radio';
import { Heart, Play, X } from 'lucide-react';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Track[];
  currentTrack: Track | null;
  onSelectTrack: (track: Track) => void;
  onToggleFavorite: (trackId: number) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  currentTrack,
  onSelectTrack,
  onToggleFavorite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full bg-slate-950/95 border-l border-white/10 p-6 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            <h2 className="text-lg font-bold text-white tracking-wide">Músicas Favoritas</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {favorites.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <Heart className="w-10 h-10 mx-auto mb-2 opacity-30 stroke-[1.5]" />
              <p>Nenhuma música favoritada ainda.</p>
              <p className="text-xs text-slate-600 mt-1">Clique no coração enquanto escuta para salvar.</p>
            </div>
          ) : (
            favorites.map((track) => {
              const isPlaying = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isPlaying
                      ? 'bg-pink-500/10 border-pink-500/30 text-pink-200'
                      : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-200'
                  }`}
                >
                  <button
                    onClick={() => onSelectTrack(track)}
                    className="flex-1 flex items-center gap-3 text-left overflow-hidden"
                  >
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0">
                      <Play size={14} className={isPlaying ? 'text-pink-400 fill-pink-400' : 'text-slate-400'} />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-slate-400 truncate">{track.artist?.name || 'Lo-Fi Artist'}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => onToggleFavorite(track.id)}
                    className="p-2 text-pink-500 hover:scale-110 transition-transform"
                    title="Remover dos favoritos"
                  >
                    <Heart size={16} className="fill-pink-500" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};