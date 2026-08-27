import { Station, Track } from '../types/radio';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error('VITE_API_URL precisa ser configurada antes do build do frontend.');
}

export const api = {
  get: async <T>(
    path: string,
    options?: { params?: Record<string, string | number> },
  ): Promise<T> => {
    const url = new URL(`${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);

    Object.entries(options?.params ?? {}).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  },
};

export const radioService = {
  getStations: async (): Promise<Station[]> => {
    return api.get<Station[]>('/stations');
  },

  getStationBySlug: async (slug: string): Promise<Station> => {
    return api.get<Station>(`/stations/${slug}`);
  },

  getTracks: async (stationId?: number): Promise<Track[]> => {
    const params: Record<string, string | number> = {};
    if (stationId !== undefined) {
      params.station_id = stationId;
    }
    return api.get<Track[]>('/tracks', { params });
  },
};