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
  queue: Track[];
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
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentTrack = queue[currentIndex] || null;
  const queueRef = useRef(queue);
  const currentStationRef = useRef(currentStation);
  const currentTrackRef = useRef<Track | null>(currentTrack);
  const shouldPlayRef = useRef(false);
  const pendingOffsetRef = useRef(0);
  const stationRequestRef = useRef(0);
  const failedTrackIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    queueRef.current = queue;
    currentStationRef.current = currentStation;
    currentTrackRef.current = currentTrack;
  }, [currentStation, currentTrack, queue]);

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
      if (currentTrackRef.current) failedTrackIdsRef.current.delete(currentTrackRef.current.id);
    };
    const handlePause = () => {
      if (!shouldPlayRef.current) setIsPlaying(false);
    };
    const handleTimeUpdate = () => {
      if (audio.currentTime) setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setCurrentTime(audio.currentTime || 0);
    };
    const handleEnded = () => {
      void refreshNowPlaying(true);
    };
    const handleError = () => {
      setIsLoading(false);
      if (currentTrackRef.current) failedTrackIdsRef.current.add(currentTrackRef.current.id);
      if (queueRef.current.some((track) => !failedTrackIdsRef.current.has(track.id))) {
        void refreshNowPlaying(true);
      } else {
        shouldPlayRef.current = false;
        setIsPlaying(false);
      }
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Troca a faixa sem confundir a pausa da troca de source com o Stop manual.
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    audioRef.current.src = currentTrack.audio_url;
    audioRef.current.load();
    setCurrentTime(0);
    setDuration(currentTrack.duration_seconds || 0);
    const offset = Math.max(0, pendingOffsetRef.current);
    pendingOffsetRef.current = 0;

    if (shouldPlayRef.current) {
      setIsLoading(true);
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (offset > 0 && offset < audioRef.current!.duration) {
          audioRef.current!.currentTime = offset;
          setCurrentTime(offset);
        }
      }, { once: true });
      audioRef.current
        .play()
        .catch(() => {
          shouldPlayRef.current = false;
          setIsPlaying(false);
        });
    }
  }, [currentIndex, queue, currentTrack]);

  const refreshNowPlaying = async (autoplay: boolean) => {
    const station = currentStationRef.current;
    if (!station) return;

    const requestId = ++stationRequestRef.current;
    try {
      const nowPlaying = await radioService.getNowPlaying(station.slug);
      if (requestId !== stationRequestRef.current) return;

      const tracks = nowPlaying.station.tracks || station.tracks || [nowPlaying.track];
      const serverIndex = tracks.findIndex((track) => track.id === nowPlaying.track.id);
      const fallbackTrack = autoplay && failedTrackIdsRef.current.has(nowPlaying.track.id)
        ? tracks.slice(serverIndex + 1).concat(tracks.slice(0, serverIndex)).find(
          (track) => !failedTrackIdsRef.current.has(track.id)
        )
        : nowPlaying.track;
      const nextIndex = fallbackTrack ? tracks.findIndex((track) => track.id === fallbackTrack.id) : -1;
      if (nextIndex === -1) return;

      const selectedTrack = fallbackTrack as Track;

      pendingOffsetRef.current = selectedTrack.id === nowPlaying.track.id ? nowPlaying.offset_seconds : 0;
      queueRef.current = tracks;
      setCurrentStation(nowPlaying.station);
      setQueue(tracks);
      setCurrentIndex(nextIndex);
      setCurrentTime(pendingOffsetRef.current);
      setDuration(selectedTrack.duration_seconds || 0);
      shouldPlayRef.current = autoplay;
      setIsPlaying(autoplay);
    } catch (error) {
      console.error('Erro ao sincronizar faixa atual:', error);
      if (autoplay) setIsPlaying(false);
    }
  };

  const recordedTrackId = useRef<number | null>(null);

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
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      shouldPlayRef.current = false;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      recordedTrackId.current = null;
    } else {
      shouldPlayRef.current = true;
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          shouldPlayRef.current = false;
          setIsPlaying(false);
        });
    }
  };

  const setStation = (station: Station) => {
    stationRequestRef.current++;
    currentStationRef.current = station;
    setCurrentStation(station);
    const tracks = station.tracks || [];
    setQueue(tracks);
    setCurrentIndex(0);
    setCurrentTime(0);
    setDuration(tracks[0]?.duration_seconds || 0);

    pendingOffsetRef.current = 0;
    shouldPlayRef.current = tracks.length > 0;
    setIsPlaying(tracks.length > 0);
    if (tracks.length > 0) void refreshNowPlaying(true);
  };

  const playTrack = (track: Track) => {
    const index = queue.findIndex((t) => t.id === track.id);
    if (index !== -1) {
      setCurrentIndex(index);
    } else {
      setQueue((prev) => [...prev, track]);
      setCurrentIndex(queue.length);
    }
    setCurrentTime(0);
    setDuration(track.duration_seconds || 0);
    shouldPlayRef.current = true;
    setIsPlaying(true);
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

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    const safeTime = Math.max(0, Math.min(time, duration || time));
    audioRef.current.currentTime = safeTime;
    setCurrentTime(safeTime);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentStation,
        currentTrack,
        currentTime,
        duration,
        isPlaying,
        volume,
        isMuted,
        queue,
        isLoading,
        playTrack,
        togglePlay,
        setStation,
        setVolumeLevel,
        toggleMute,
        seekTo,
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