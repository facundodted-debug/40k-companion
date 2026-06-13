import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface ProfileData {
  playerName: string;
  favoriteFaction: string;
  gamesPlayed: number;
  winRate: number;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProfile<ProfileData>()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = useCallback((data: ProfileData) => {
    setProfile(data);
    api.saveProfile<ProfileData>(data).catch(() => {});
  }, []);

  return { profile, loading, saveProfile };
}
