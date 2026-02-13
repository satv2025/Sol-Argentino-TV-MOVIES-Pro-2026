import { Navigate, Route, Routes } from 'react-router-dom';
import Shell from './components/Shell';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyListPage from './pages/MyListPage';
import AccountPage from './pages/AccountPage';
import PlayerPage from './pages/PlayerPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<HomePage />} />
        <Route path="/mi-lista" element={<MyListPage />} />
        <Route path="/cuenta" element={<AccountPage />} />
        <Route path="/ver/:id" element={<PlayerPage />} />
        <Route path="/ver/:id/s/:season/e/:episode" element={<PlayerPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/inicio" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
