import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/AuthProvider';

export default function Shell() {
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <div className="sb-app">
      <aside className="sb-sidebar">
        <div className="sb-brand">
          <div className="sb-logo" aria-hidden="true">SATV</div>
          <div className="sb-brandText">
            <div className="sb-brandName">Sol Argentino TV MOVIES</div>
            <div className="sb-brandTag">SATVMOVIES · 100% gratis</div>
          </div>
        </div>

        <nav className="sb-nav" aria-label="Navegación">
          <NavLink to="/" end className={({ isActive }) => `sb-navItem ${isActive ? 'active' : ''}`}>
            <span className="sb-navIcon" aria-hidden="true"><i className="fa-solid fa-house"></i></span>
            Inicio
          </NavLink>

          <NavLink to="/mi-lista" className={({ isActive }) => `sb-navItem ${isActive ? 'active' : ''}`}>
            <span className="sb-navIcon" aria-hidden="true"><i className="fa-solid fa-bookmark"></i></span>
            Mi lista
          </NavLink>

          <NavLink to="/cuenta" className={({ isActive }) => `sb-navItem ${isActive ? 'active' : ''}`}>
            <span className="sb-navIcon" aria-hidden="true"><i className="fa-solid fa-user"></i></span>
            Cuenta
          </NavLink>
        </nav>

        <div className="sb-sidebarFooter">
          <div className="sb-user">
            <div className="sb-avatar" aria-hidden="true">{(profile?.username?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()}</div>
            <div className="sb-userMeta">
              <div className="sb-userName">{profile?.username ?? profile?.nombre ?? 'Invitado'}</div>
              <div className="sb-userSub">{user?.email ?? 'Sin sesión'}</div>
            </div>
          </div>

          {user ? (
            <button
              className="sb-btn sb-btnGhost"
              onClick={async () => {
                await signOut();
                nav('/');
              }}
            >
              Cerrar sesión
            </button>
          ) : (
            <button className="sb-btn sb-btnPrimary" onClick={() => nav('/login')}>
              Iniciar sesión
            </button>
          )}
        </div>
      </aside>

      <main className="sb-main">
        <Outlet />
      </main>
    </div>
  );
}
