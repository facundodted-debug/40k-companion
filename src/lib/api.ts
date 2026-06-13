async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API /api/${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  getSession: () => request<{ userId: string }>('session'),

  getLists: <T>() => request<T[]>('lists'),
  saveList: <T>(list: T) => request<T>('lists', { method: 'POST', body: JSON.stringify(list) }),
  deleteList: (id: string) => request<{ ok: true }>(`lists?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getMatchups: <T>() => request<T[]>('matchups'),
  addMatchup: <T>(record: unknown) => request<T>('matchups', { method: 'POST', body: JSON.stringify(record) }),

  getProfile: <T>() => request<T | null>('profile'),
  saveProfile: <T>(profile: unknown) => request<T>('profile', { method: 'POST', body: JSON.stringify(profile) }),
};
