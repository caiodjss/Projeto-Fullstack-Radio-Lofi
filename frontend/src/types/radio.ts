export interface Artist {
  id: number;
  name: string;
  avatar_url: string | null;
  social_link: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Track {
  id: number;
  station_id: number;
  artist_id: number;
  title: string;
  genre: 'Sad' | 'Nostalgic' | string; // <-- Adicionado gênero tipado
  audio_url: string;
  duration_seconds: number;
  is_active: boolean;
  artist?: Artist;
  station?: Station;
  created_at?: string;
  updated_at?: string;
}

export interface Station {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  theme_color: string;
  background_url: string | null;
  is_active: boolean;
  tracks?: Track[];
  created_at?: string;
  updated_at?: string;
}

export interface PlayerState {
  currentStation: Station | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  currentIndex: number;
  isLoading: boolean;
}