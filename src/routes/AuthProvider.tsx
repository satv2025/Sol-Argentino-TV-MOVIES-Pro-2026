import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AppUserRow = {
  id: string;
  email: string | null;
  nombre: string | null;
  username: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  pais: string | null;
  idioma: string | null;
  plan: string | null;
  activo: boolean | null;
  my_list: any;
  reactions: any;
  watch_progress: any;
  watch_history: any;
  preferences: any;
  creado_en: string | null;
  actualizado_en: string | null;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: AppUserRow | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (params: { email: string; password: string; nombre: string; username: string }) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<AppUserRow>) => Promise<{ ok: boolean; error?: string }>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserRow | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string) {
    const { data, error } = await supabase.from('app_users').select('*').eq('id', uid).maybeSingle();
    if (error) throw error;
    setProfile((data as AppUserRow) ?? null);
  }

  async function refreshProfile() {
    if (!user?.id) return;
    try {
      await loadProfile(user.id);
    } catch (e) {
      console.warn('No se pudo refrescar el perfil:', e);
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Cuando hay user: traer/crear row app_users
    async function run() {
      setLoading(true);
      try {
        if (!user?.id) {
          setProfile(null);
          return;
        }
        // Asegura row en app_users
        await supabase.from('app_users').upsert(
          {
            id: user.id,
            email: user.email ?? null,
            actualizado_en: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
        await loadProfile(user.id);
      } catch (e) {
        console.warn('Error perfil:', e);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [user?.id]);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async function signUp(params: { email: string; password: string; nombre: string; username: string }) {
    const { data, error } = await supabase.auth.signUp({ email: params.email, password: params.password });
    if (error) return { ok: false, error: error.message };

    const uid = data.user?.id;
    if (!uid) return { ok: false, error: 'No se pudo obtener el usuario.' };

    const { error: upsertErr } = await supabase.from('app_users').upsert(
      {
        id: uid,
        email: params.email,
        nombre: params.nombre,
        username: params.username,
        plan: 'free',
        activo: true,
        actualizado_en: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (upsertErr) return { ok: false, error: upsertErr.message };
    return { ok: true };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function updateProfile(patch: Partial<AppUserRow>) {
    if (!user?.id) return { ok: false, error: 'No autenticado.' };
    const { error } = await supabase
      .from('app_users')
      .update({ ...patch, actualizado_en: new Date().toISOString() })
      .eq('id', user.id);

    if (error) return { ok: false, error: error.message };
    await refreshProfile();
    return { ok: true };
  }

  const value = useMemo<AuthState>(
    () => ({ session, user, profile, loading, signIn, signUp, signOut, refreshProfile, updateProfile }),
    [session, user, profile, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
