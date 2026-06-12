import { useCallback, useEffect, useState } from 'react';
import { ArmyList } from '../app/components/shared';

const STORAGE_KEY = '40k-lists';

function loadLists(): ArmyList[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ArmyList[]) : [];
  } catch {
    return [];
  }
}

export function useListStore() {
  const [lists, setLists] = useState<ArmyList[]>(() => loadLists());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  const addList = useCallback((list: ArmyList) => {
    setLists(prev => [...prev, list]);
  }, []);

  const removeList = useCallback((id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateList = useCallback((list: ArmyList) => {
    setLists(prev => prev.map(l => (l.id === list.id ? list : l)));
  }, []);

  return { lists, addList, removeList, updateList };
}
