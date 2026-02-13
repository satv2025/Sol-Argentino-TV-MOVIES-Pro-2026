import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../routes/AuthProvider';
import { useMyList } from '../routes/useMyList';

export default function AccountPage() {
  const { user, profile, loading, updateProfile } = useAuth();
  const { list } = useMyList();

  const [form, setForm] = useState({
    nombre: '',
    username: '',
    bio: '',
    pais: '',
    idioma: 'es',
    avatar_url: '',
    banner_url: '',
  });

  useEffect(() => {
    setForm({
      nombre: profile?.nombre ?? '',
      username: profile?.username ?? '',
      bio: profile?.bio ?? '',
      pais: profile?.pais ?? '',
      idioma: profile?.idioma ?? 'es',
      avatar_url: profile?.avatar_url ?? '',
      banner_url: profile?.banner_url ?? '',
    });
  }, [profile?.id]);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canEdit = !!user;

  const plan = useMemo(() => profile?.plan ?? 'free', [profile?.plan]);

  return (
    <div className="sb-page">
      <header className="sb-topbar">
        <div>
          <div className="sb-h2">Cuenta</div>
          <div className="sb-dim">{user ? user.email : 'Invitado'} · plan {plan}</div>
        </div>
        <div className="sb-dim">Mi lista: {list.length}</div>
      </header>

      <section className="sb-section">
        {!user ? (
          <div className="sb-empty">
            <div className="sb-h3">No hay sesión</div>
            <div className="sb-dim">Iniciá sesión para guardar tu perfil, lista y progreso en Supabase.</div>
          </div>
        ) : (
          <form
            className="sb-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg(null);
              setErr(null);
              const r = await updateProfile({
                nombre: form.nombre || null,
                username: form.username || null,
                bio: form.bio || null,
                pais: form.pais || null,
                idioma: form.idioma || 'es',
                avatar_url: form.avatar_url || null,
                banner_url: form.banner_url || null,
              } as any);

              if (!r.ok) setErr(r.error ?? 'No se pudo guardar');
              else setMsg('Guardado.');
            }}
          >
            {loading ? <div className="sb-dim">Cargando…</div> : null}

            <div className="sb-row">
              <label className="sb-label" style={{ flex: 1 }}>
                Nombre
                <input className="sb-input" value={form.nombre} onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))} />
              </label>

              <label className="sb-label" style={{ flex: 1 }}>
                Username
                <input className="sb-input" value={form.username} onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} />
              </label>
            </div>

            <label className="sb-label">
              Bio
              <textarea className="sb-textarea" value={form.bio} onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))} rows={4} />
            </label>

            <div className="sb-row">
              <label className="sb-label" style={{ flex: 1 }}>
                País
                <input className="sb-input" value={form.pais} onChange={(e) => setForm((s) => ({ ...s, pais: e.target.value }))} />
              </label>

              <label className="sb-label" style={{ flex: 1 }}>
                Idioma
                <select className="sb-input" value={form.idioma} onChange={(e) => setForm((s) => ({ ...s, idioma: e.target.value }))}>
                  <option value="es">es</option>
                  <option value="en">en</option>
                  <option value="pt">pt</option>
                </select>
              </label>
            </div>

            <div className="sb-row">
              <label className="sb-label" style={{ flex: 1 }}>
                Avatar URL
                <input className="sb-input" value={form.avatar_url} onChange={(e) => setForm((s) => ({ ...s, avatar_url: e.target.value }))} />
              </label>

              <label className="sb-label" style={{ flex: 1 }}>
                Banner URL
                <input className="sb-input" value={form.banner_url} onChange={(e) => setForm((s) => ({ ...s, banner_url: e.target.value }))} />
              </label>
            </div>

            {msg ? <div className="sb-ok">{msg}</div> : null}
            {err ? <div className="sb-alert">{err}</div> : null}

            <button className="sb-btn sb-btnPrimary" disabled={!canEdit}>
              Guardar
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
