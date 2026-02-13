import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="sb-page">
      <div className="sb-section sb-empty">
        <div className="sb-h2">404</div>
        <div className="sb-dim">No existe esa ruta.</div>
        <Link className="sb-btn sb-btnPrimary" to="/">
          Volver a Inicio
        </Link>
      </div>
    </div>
  );
}
