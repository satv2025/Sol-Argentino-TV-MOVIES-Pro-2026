import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/AuthProvider';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const nav = useNavigate();

  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="sb-authWrap">
      <div className="sb-authCard">
        <div className="sb-h2">Registro</div>
        <p className="sb-dim">Cuenta gratuita. Sin planes, sin vueltas.</p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            setBusy(true);
            try {
              const r = await signUp({ email: email.trim(), password, nombre: nombre.trim(), username: username.trim() });
              if (!r.ok) return setErr(r.error ?? 'Error');
              nav('/');
            } finally {
              setBusy(false);
            }
          }}
          className="sb-form"
        >
          <div className="sb-row">
            <label className="sb-label" style={{ flex: 1 }}>
              Nombre
              <input className="sb-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </label>
            <label className="sb-label" style={{ flex: 1 }}>
              Username
              <input className="sb-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
          </div>

          <label className="sb-label">
            Email
            <input className="sb-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="sb-label">
            Contraseña
            <input className="sb-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </label>

          {err ? <div className="sb-alert">{err}</div> : null}

          <button className="sb-btn sb-btnPrimary" disabled={busy}>
            {busy ? 'Creando…' : 'Crear cuenta'}
          </button>

          <div className="sb-dim" style={{ marginTop: 10 }}>
            ¿Ya tenés cuenta? <Link to="/login" className="sb-link">Iniciá sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
