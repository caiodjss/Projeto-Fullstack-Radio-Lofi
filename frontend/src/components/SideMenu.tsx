import React, { useEffect, useState } from 'react';
import { History, LogIn, LogOut, Menu, Music2, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../hooks/useFavorites';
import { authService, historyService, HistoryEntry } from '../services/api';
import { FavoritesDrawer } from './FavoritesDrawer';
import { Track } from '../types/radio';

interface SideMenuProps {
  onSelectTrack: (track: Track) => void;
}

const backendUrl =
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  'https://lofi-backend-production-221f.up.railway.app/api';

export const SideMenu: React.FC<SideMenuProps> = ({ onSelectTrack }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [panel, setPanel] = useState<'menu' | 'history'>('menu');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('auth_token')));
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const { favoriteTracks, isFavorite, toggleFavorite } = useFavorites();
  const { currentTrack } = usePlayer();

  useEffect(() => {
    if (!isOpen || panel !== 'history' || !isAuthenticated) return;
    setIsLoadingHistory(true);
    historyService
      .getHistory()
      .then(setHistory)
      .catch((error) => console.error('Erro ao carregar histórico:', error))
      .finally(() => setIsLoadingHistory(false));
  }, [isAuthenticated, isOpen, panel]);

  const openHistory = () => {
    setPanel('history');
    setIsOpen(true);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      window.location.reload();
    }
  };

  const handleLogin = () => {
    window.location.href = `${backendUrl.replace(/\/$/, '')}/auth/google`;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setPanel('menu'); setIsOpen(true); }}
        className="flex items-center justify-center p-2.5 rounded-lg border border-cyan-300/40 bg-[#101a3b] hover:bg-[#18275a] text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.25)] transition-colors backdrop-blur-md cursor-pointer"
        title="Abrir menu"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button type="button" aria-label="Fechar menu" onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="relative z-10 w-full max-w-sm h-full bg-[#070b1f] border-l border-cyan-300/40 backdrop-blur-xl p-5 sm:p-6 flex flex-col shadow-[-10px_0_40px_rgba(34,211,238,0.18)]">
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Navegação</p>
                <h2 className="text-xl font-bold text-cyan-100 mt-1 [text-shadow:0_0_10px_rgba(34,211,238,0.6)]">LO-FI RADIO</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10" title="Fechar menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            {panel === 'menu' ? (
              <div className="pt-5 space-y-2 text-sm">
                <button type="button" onClick={() => { setIsFavoritesOpen(true); setIsOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-slate-200 border border-white/10 bg-[#0d1533] hover:bg-[#172454] hover:border-pink-300/50">
                  <Music2 className="w-5 h-5 text-pink-400" /> Favoritos
                </button>
                {isAuthenticated && (
                  <button type="button" onClick={openHistory} className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-slate-200 border border-white/10 bg-[#0d1533] hover:bg-[#172454] hover:border-cyan-300/50">
                    <History className="w-5 h-5 text-sky-400" /> Histórico de músicas
                  </button>
                )}
                <div className="pt-4 mt-4 border-t border-white/10">
                  {isAuthenticated ? (
                    <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-slate-300 border border-white/10 bg-[#0d1533] hover:bg-[#172454]">
                      <LogOut className="w-5 h-5" /> Sair
                    </button>
                  ) : (
                    <button type="button" onClick={handleLogin} className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-slate-300 border border-white/10 bg-[#0d1533] hover:bg-[#172454]">
                      <LogIn className="w-5 h-5" /> Entrar com Google
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col pt-5">
                <button type="button" onClick={() => setPanel('menu')} className="text-left text-sm text-slate-400 hover:text-white mb-4">← Voltar ao menu</button>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><History className="w-5 h-5 text-sky-400" /> Histórico</h3>
                <div className="mt-4 overflow-y-auto space-y-2">
                  {isLoadingHistory ? <p className="text-sm text-slate-500">Carregando histórico...</p> : history.length === 0 ? <p className="text-sm text-slate-500">Nenhuma música tocada ainda.</p> : history.map((entry) => (
                    <button key={entry.id} type="button" onClick={() => { onSelectTrack(entry.track); setIsOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left">
                      <Music2 className="w-4 h-4 shrink-0 text-slate-400" />
                      <span className="min-w-0"><strong className="block text-sm text-slate-200 truncate">{entry.track.title}</strong><small className="block text-xs text-slate-500 truncate">{entry.track.artist?.name || 'Lo-Fi Artist'} · {new Date(entry.played_at).toLocaleDateString()}</small></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favoriteTracks}
        currentTrack={currentTrack}
        onSelectTrack={(track) => { onSelectTrack(track); setIsFavoritesOpen(false); }}
        onToggleFavorite={(trackId) => {
          const track = favoriteTracks.find((item) => item.id === trackId);
          if (track) void toggleFavorite(track);
        }}
      />
    </>
  );
};
