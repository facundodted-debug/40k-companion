import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

const MAX_RECORDS = 20;

export interface MatchupRecord {
  id: string;
  date: string; // ISO string
  ownListId: string;
  ownListName: string;
  ownFactionAbbr: string;
  ownFactionColor: string;
  rivalName: string;
  rivalAbbr: string;
  rivalColor: string;
  rivalDetachment?: string;
  strengthsCount: number;
  weaknessesCount: number;
  actionsCount: number;
}

export function useMatchupHistory() {
  const [history, setHistory] = useState<MatchupRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMatchups<MatchupRecord>()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const addRecord = useCallback((record: Omit<MatchupRecord, 'id' | 'date'>) => {
    api.addMatchup<MatchupRecord>(record)
      .then(saved => setHistory(prev => [saved, ...prev].slice(0, MAX_RECORDS)))
      .catch(() => {});
  }, []);

  const lastMatchup = history[0] ?? null;

  return { history, loading, addRecord, lastMatchup };
}
