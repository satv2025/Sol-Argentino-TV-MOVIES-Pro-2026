import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/AuthProvider';

export default function LoginPage() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="sb-authWrap">
      <div className="sb-authCard">
        <div className="sb-h2">Iniciar sesión</div>
        <p className="sb-dim">Accedé para sincronizar Mi lista y tu progreso.</p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            setBusy(true);
            try {
              const r = await signIn(email.trim(), password);
              if (!r.ok) return setErr(r.error ?? 'Error');
              nav('/');
            } finally {
              setBusy(false);
            }
          }}
          className="sb-form"
        >
          <label className="sb-label">
            Email
            <input className="sb-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="sb-label">
            Contraseña
            <input className="sb-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {err ? <div className="sb-alert">{err}</div> : null}

          <button className="sb-btn sb-btnPrimary" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="sb-dim" style={{ marginTop: 10 }}>
            ¿No tenés cuenta? <Link to="/registro" className="sb-link">Registrate</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
