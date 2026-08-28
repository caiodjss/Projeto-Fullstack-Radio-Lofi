import { Station, Track, User } from '../types/radio';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  get: async <T>(path: string, options?: { params?: Record<string, string | number> }): Promise<T> => {
    const url = new URL(`${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);
    Object.entries(options?.params ?? {}).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), { method: 'GET', headers });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  },

  post: async <T>(path: string, body?: any): Promise<T> => {
    const url = `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  },
};

export const authService = {
  getMe: (): Promise<User> => api.get<User>('/me'),
  logout: (): Promise<void> => api.post('/logout'),
};

export const favoriteService = {
  getFavorites: (): Promise<Track[]> => api.get<Track[]>('/favorites'),
  toggleFavorite: (trackId: number): Promise<{ track_id: number; is_favorited: boolean }> =>
    api.post(`/favorites/toggle/${trackId}`),
};

export const radioService = {
  getStations: (): Promise<Station[]> => api.get<Station[]>('/stations'),
  getStationBySlug: (slug: string): Promise<Station> => api.get<Station>(`/stations/${slug}`),
  getTracks: (stationId?: number): Promise<Track[]> => {
    const params: Record<string, string | number> = {};
    if (stationId !== undefined) params.station_id = stationId;
    return api.get<Track[]>('/tracks', { params });
  },
};