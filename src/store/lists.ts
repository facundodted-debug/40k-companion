import { useCallback, useEffect, useState } from 'react';
import { ArmyList } from '../app/components/shared';
import { ImportedList } from '../app/lib/armyListParser';
import { api } from '../lib/api';

export type SavedList = ArmyList | ImportedList;

export function useListStore() {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLists<SavedList>()
      .then(setLists)
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  }, []);

  const addList = useCallback((list: SavedList) => {
    setLists(prev => [...prev, list]);
    api.saveList(list).catch(() => {});
  }, []);

  const removeList = useCallback((id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
    api.deleteList(id).catch(() => {});
  }, []);

  const updateList = useCallback((list: SavedList) => {
    setLists(prev => prev.map(l => (l.id === list.id ? list : l)));
    api.saveList(list).catch(() => {});
  }, []);

  return { lists, loading, addList, removeList, updateList };
}
