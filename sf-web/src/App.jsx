import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { Auth } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import LandingPage from './pages/LandingPage';
import { Toaster } from 'react-hot-toast';
import logoImg from './assets/logosfoff.png';
import { LayoutDashboard, User, Target } from 'lucide-react';

const FINANCIAL_QUOTES = [
  'A diferença entre o inteligente e o sábio, é que o sábio pensa a longo prazo.',
  'Cuidado com as pequenas despesas; um pequeno vazamento afunda um grande navio.',
  'Gaste menos do que você ganha e invista a diferença com sabedoria.',
  'Não economize o que sobra depois de gastar, mas gaste o que sobra depois de economizar.',
  'O melhor investimento que você pode fazer é em você mesmo e no seu conhecimento.',
  'Riqueza não é sobre ter muito dinheiro, é sobre ter opções e liberdade.',
  'A disciplina financeira de hoje é a tranquilidade do seu amanhã.',
];

export default function App() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [currentQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * FINANCIAL_QUOTES.length);
    return FINANCIAL_QUOTES[randomIndex];
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('@SF:token');
    localStorage.removeItem('@SF:user');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {!isAuthenticated ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <div style={styles.container}>
          <header style={styles.header}>
            <div style={styles.logoContainer}>
              <img
                src={logoImg}
                alt="Logo Schwantes Finance"
                style={styles.logoImage}
              />
            </div>

            <div style={styles.quoteContainer}>
              <p style={styles.quoteText}>"{currentQuote}"</p>
            </div>

            <div style={styles.actionsContainer}>
              <nav style={styles.nav}>
                <NavLink
                  to="/"
                  end
                  style={({ isActive }) => ({
                    ...styles.navButton,
                    ...(isActive ? styles.activeNavButton : {}),
                  })}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </NavLink>

                <NavLink
                  to="/goals"
                  style={({ isActive }) => ({
                    ...styles.navButton,
                    ...(isActive ? styles.activeNavButton : {}),
                  })}
                >
                  <Target size={18} />
                  Metas
                </NavLink>

                <NavLink
                  to="/profile"
                  style={({ isActive }) => ({
                    ...styles.navButton,
                    ...(isActive ? styles.activeNavButton : {}),
                  })}
                >
                  <User size={18} />
                  Meu Perfil
                </NavLink>
              </nav>

              <button onClick={handleLogout} style={styles.logoutButton}>
                Sair
              </button>
            </div>
          </header>

          <main style={styles.content}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </>
  );
}

const styles = {
  container: {
    fontFamily: 'sans-serif',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    width: '100%',
    boxSizing: 'border-box',
    gap: '1rem',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: '60px',
  },
  logoImage: {
    height: '100px',
    width: 'auto',
    objectFit: 'contain',
  },
  quoteContainer: {
    flex: 1,
    textAlign: 'center',
    padding: '0 1rem',
  },
  quoteText: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: '1.3',
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    color: '#64748b',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
  activeNavButton: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  content: {
    padding: '2rem',
  },
};