import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '40k-matchup-history';
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

function loadHistory(): MatchupRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MatchupRecord[]) : [];
  } catch {
    return [];
  }
}

export function useMatchupHistory() {
  const [history, setHistory] = useState<MatchupRecord[]>(() => loadHistory());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addRecord = useCallback((record: Omit<MatchupRecord, 'id' | 'date'>) => {
    setHistory(prev => {
      const newRecord: MatchupRecord = {
        ...record,
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
      };
      return [newRecord, ...prev].slice(0, MAX_RECORDS);
    });
  }, []);

  const lastMatchup = history[0] ?? null;

  return { history, addRecord, lastMatchup };
}
