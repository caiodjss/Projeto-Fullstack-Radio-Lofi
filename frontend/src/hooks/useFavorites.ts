import { useState, useEffect } from 'react';
import { Track } from '../types/radio';

const STORAGE_KEY = '@lofi_radio:favorites';

export const useFavorites = () => {
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteTracks));
    } catch (error) {
      console.error('Erro ao salvar favoritos no localStorage:', error);
    }
  }, [favoriteTracks]);

  const isFavorite = (trackId?: number) => {
    if (!trackId) return false;
    return favoriteTracks.some((t) => t.id === trackId);
  };

  const toggleFavorite = (track: Track) => {
    setFavoriteTracks((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) {
        return prev.filter((t) => t.id !== track.id);
      }
      return [...prev, track];
    });
  };

  return {
    favoriteTracks,
    isFavorite,
    toggleFavorite,
  };
};