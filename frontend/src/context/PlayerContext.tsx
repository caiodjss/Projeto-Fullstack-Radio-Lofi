import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Station, Track } from '../types/radio';

interface PlayerContextType {
  currentStation: Station | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  isLoading: boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setStation: (station: Station) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentTrack = queue[currentIndex] || null;

  // Inicializa o elemento HTML5 Audio único
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      // Loop contínuo: pula para a próxima faixa automaticamente
      nextTrack();
    };
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      // Se falhar o carregamento, avança para a próxima da fila
      nextTrack();
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Atualiza o source e inicia reprodução quando o currentTrack muda
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    audioRef.current.src = currentTrack.audio_url;
    audioRef.current.load();

    if (isPlaying) {
      setIsLoading(true);
      audioRef.current
        .play()
        .catch(() => setIsPlaying(false));
    }
  }, [currentIndex, queue]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const setStation = (station: Station) => {
    setCurrentStation(station);
    const tracks = station.tracks || [];
    setQueue(tracks);
    setCurrentIndex(0);

    if (tracks.length > 0) {
      setIsPlaying(true);
    }
  };

  const playTrack = (track: Track) => {
    const index = queue.findIndex((t) => t.id === track.id);
    if (index !== -1) {
      setCurrentIndex(index);
    } else {
      setQueue((prev) => [...prev, track]);
      setCurrentIndex(queue.length);
    }
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % queue.length);
  };

  const previousTrack = () => {
    if (queue.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + queue.length) % queue.length);
  };

  const setVolumeLevel = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  return (
    <PlayerContext.Provider
      value={{
        currentStation,
        currentTrack,
        isPlaying,
        volume,
        isMuted,
        queue,
        isLoading,
        playTrack,
        togglePlay,
        nextTrack,
        previousTrack,
        setStation,
        setVolumeLevel,
        toggleMute,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer deve ser usado dentro de um PlayerProvider');
  }
  return context;
};