/// <reference types="vite/client" />

import { Station, Track } from '../types/radio';

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  get: async <T>(
    path: string,
    options?: { params?: Record<string, string | number> },
  ): Promise<{ data: T }> => {
    const url = new URL(`${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);

    Object.entries(options?.params ?? {}).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return { data: (await response.json()) as T };
  },
};

// Funções auxiliares para consumo direto
export const radioService = {
  getStations: async (): Promise<Station[]> => {
    const response = await api.get<Station[]>('/stations');
    return response.data;
  },

  getStationBySlug: async (slug: string): Promise<Station> => {
    const response = await api.get<Station>(`/stations/${slug}`);
    return response.data;
  },

  getTracks: async (stationId?: number): Promise<Track[]> => {
    const params: Record<string, string | number> = {};

    if (stationId !== undefined) {
      params.station_id = stationId;
    }

    const response = await api.get<Track[]>('/tracks', { params });
    return response.data;
  },
};