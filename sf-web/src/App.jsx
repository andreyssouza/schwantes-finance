import { useState } from 'react';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Schwantes Finance</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Sair
        </button>
      </header>

      <main style={styles.content}>
        <Dashboard />
      </main>
    </div>
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
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#1e293b',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  content: {
    padding: '2rem',
  },
};