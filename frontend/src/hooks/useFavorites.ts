import { useCallback, useEffect, useState } from 'react';
import { favoriteService } from '../services/api';
import { Track } from '../types/radio';

const STORAGE_KEY = '@lofi_radio:favorites';

const readLocalFavorites = (): Track[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const useFavorites = () => {
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>(() => readLocalFavorites());

  const syncLocalFavorites = useCallback((tracks: Track[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    } catch (error) {
      console.error('Erro ao salvar favoritos no localStorage:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      setFavoriteTracks(readLocalFavorites());
      return;
    }

    let isMounted = true;

    favoriteService
      .getFavorites()
      .then((tracks) => {
        if (!isMounted) return;
        setFavoriteTracks(tracks);
        syncLocalFavorites(tracks);
      })
      .catch((error) => {
        console.error('Erro ao sincronizar favoritos do backend:', error);
        if (isMounted) {
          setFavoriteTracks(readLocalFavorites());
        }
      });

    return () => {
      isMounted = false;
    };
  }, [syncLocalFavorites]);

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      syncLocalFavorites(favoriteTracks);
    }
  }, [favoriteTracks, syncLocalFavorites]);

  const isFavorite = (trackId?: number) => {
    if (!trackId) return false;
    return favoriteTracks.some((t) => t.id === trackId);
  };

  const toggleFavorite = async (track: Track) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      try {
        const result = await favoriteService.toggleFavorite(track.id);
        setFavoriteTracks((prev) => {
          const exists = prev.some((t) => t.id === track.id);
          if (result.is_favorited) {
            return exists ? prev : [...prev, track];
          }
          return prev.filter((t) => t.id !== track.id);
        });
        return;
      } catch (error) {
        console.error('Erro ao alternar favorito no backend:', error);
      }
    }

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