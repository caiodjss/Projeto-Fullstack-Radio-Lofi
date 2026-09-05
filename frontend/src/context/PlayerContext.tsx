import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { historyService, radioService } from '../services/api';
import { Station, Track } from '../types/radio';

interface PlayerContextType {
  currentStation: Station | null;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setStation: (station: Station) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentStationRef = useRef<Station | null>(null);
  const currentTrackRef = useRef<Track | null>(null);
  const shouldPlayRef = useRef(false);
  const pendingOffsetRef = useRef(0);
  const requestIdRef = useRef(0);
  const recordedTrackId = useRef<number | null>(null);

  useEffect(() => {
    currentStationRef.current = currentStation;
    currentTrackRef.current = currentTrack;
  }, [currentStation, currentTrack]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    const syncFromWorker = () => {
      void refreshNowPlaying(true);
    };
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handlePause = () => {
      if (!shouldPlayRef.current) setIsPlaying(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : currentTrackRef.current?.duration_seconds || 0);
      setCurrentTime(audio.currentTime || 0);
    };
    const handleError = () => {
      setIsLoading(false);
      if (shouldPlayRef.current) syncFromWorker();
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', syncFromWorker);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', syncFromWorker);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const offset = Math.max(0, pendingOffsetRef.current);
    pendingOffsetRef.current = 0;
    audio.src = currentTrack.audio_url;
    audio.load();
    setCurrentTime(offset);
    setDuration(currentTrack.duration_seconds || 0);

    const startAtOffset = () => {
      if (offset > 0 && offset < audio.duration) {
        audio.currentTime = offset;
        setCurrentTime(offset);
      }
    };

    audio.addEventListener('loadedmetadata', startAtOffset, { once: true });
    if (shouldPlayRef.current) {
      setIsLoading(true);
      audio.play().catch(() => {
        shouldPlayRef.current = false;
        setIsPlaying(false);
      });
    }

    return () => audio.removeEventListener('loadedmetadata', startAtOffset);
  }, [currentTrack]);

  const refreshNowPlaying = async (autoplay: boolean) => {
    const station = currentStationRef.current;
    if (!station) return;

    const requestId = ++requestIdRef.current;
    try {
      const nowPlaying = await radioService.getNowPlaying(station.slug);
      if (requestId !== requestIdRef.current) return;

      pendingOffsetRef.current = nowPlaying.offset_seconds;
      shouldPlayRef.current = autoplay;
      setCurrentStation(nowPlaying.station);
      setCurrentTrack(nowPlaying.track);
      setCurrentTime(nowPlaying.offset_seconds);
      setDuration(nowPlaying.track.duration_seconds || 0);
      setIsPlaying(autoplay);
    } catch (error) {
      console.error('Erro ao sincronizar o estado da rádio:', error);
      if (autoplay) setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!isPlaying || !currentTrack || recordedTrackId.current === currentTrack.id) return;
    recordedTrackId.current = currentTrack.id;
    if (localStorage.getItem('auth_token')) {
      historyService.recordPlay(currentTrack.id).catch((error) => {
        console.error('Erro ao registrar histórico:', error);
      });
    }
  }, [currentTrack, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      shouldPlayRef.current = false;
      audio.pause();
      setIsPlaying(false);
      recordedTrackId.current = null;
      return;
    }

    shouldPlayRef.current = true;
    setIsLoading(true);
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      shouldPlayRef.current = false;
      setIsPlaying(false);
    });
  };

  const setStation = (station: Station) => {
    requestIdRef.current++;
    currentStationRef.current = station;
    setCurrentStation(station);
    setCurrentTrack(null);
    setCurrentTime(0);
    setDuration(0);
    shouldPlayRef.current = true;
    setIsPlaying(false);
    void refreshNowPlaying(true);
  };

  const playTrack = (track: Track) => {
    requestIdRef.current++;
    pendingOffsetRef.current = 0;
    shouldPlayRef.current = true;
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration_seconds || 0);
    setIsPlaying(true);
  };

  const setVolumeLevel = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
    if (clamped > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    const safeTime = Math.max(0, Math.min(time, duration || time));
    audioRef.current.currentTime = safeTime;
    setCurrentTime(safeTime);
  };

  return (
    <PlayerContext.Provider value={{
      currentStation,
      currentTrack,
      currentTime,
      duration,
      isPlaying,
      volume,
      isMuted,
      isLoading,
      playTrack,
      togglePlay,
      setStation,
      setVolumeLevel,
      toggleMute,
      seekTo,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer deve ser usado dentro de um PlayerProvider');
  return context;
};
