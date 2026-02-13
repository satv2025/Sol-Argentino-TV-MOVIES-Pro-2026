import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthProvider';

const LS_KEY = 'streambox_my_list_v1';

function readLocal(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function writeLocal(list: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function useMyList() {
  const { user, profile, updateProfile } = useAuth();
  const [localList, setLocalList] = useState<string[]>(readLocal());

  useEffect(() => {
    const onStorage = () => setLocalList(readLocal());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const list = useMemo(() => {
    if (user && profile?.my_list) return Array.isArray(profile.my_list) ? profile.my_list : [];
    return localList;
  }, [user, profile?.my_list, localList]);

  const has = useCallback((id: string) => list.includes(id), [list]);

  const toggle = useCallback(
    async (id: string) => {
      const next = has(id) ? list.filter((x) => x !== id) : [id, ...list];

      if (user) {
        await updateProfile({ my_list: next });
      } else {
        setLocalList(next);
        writeLocal(next);
      }
    },
    [has, list, user, updateProfile]
  );

  return { list, has, toggle };
}
