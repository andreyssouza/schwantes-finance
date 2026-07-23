import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Profile() {
  // Função para carregar os dados iniciais do cache local (sem lag na renderização)
  const getInitialUser = () => {
    try {
      const savedUser = localStorage.getItem('@SF:user') || localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  };

  const initialUser = getInitialUser();

  // Estados com inicialização instantânea
  const [name, setName] = useState(initialUser?.name || '');
  const [email, setEmail] = useState(initialUser?.email || '');

  // Estados do formulário de alterar senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibilidade das senhas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de loading dos botões
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Sincroniza os dados com o banco em segundo plano
  useEffect(() => {
    async function loadUserData() {
      try {
        const response = await api.get('/users/profile');
        const user = response.data;

        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');

          // Atualiza o cache local
          const userData = { id: user.id, name: user.name, email: user.email };
          localStorage.setItem('@SF:user', JSON.stringify(userData));
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        console.error('Erro ao sincronizar dados do perfil:', err);
      }
    }

    loadUserData();
  }, []);

  // Gerador de iniciais para a foto/avatar de perfil
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Salvar Informações Pessoais (Nome e E-mail)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);

    try {
      const response = await api.put('/users/profile', { name, email });
      
      const updatedUser = response.data;
      
      // Atualiza o cache local
      const userData = { id: updatedUser.id, name: updatedUser.name || name, email: updatedUser.email || email };
      localStorage.setItem('@SF:user', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success('Informações atualizadas com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Erro ao atualizar informações pessoais.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Alterar Senha
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos de senha!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres!');
      return;
    }

    setLoadingPassword(true);

    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Erro ao alterar a senha. Verifique a senha atual.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        
        {/* CABEÇALHO DO PERFIL / AVATAR */}
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>
            {getInitials(name)}
          </div>
          <div>
            <h2 style={styles.userName}>{name || 'Usuário'}</h2>
            <p style={styles.userEmail}>{email || 'Carregando e-mail...'}</p>
          </div>
        </div>

        {/* GRID COM FORMULÁRIOS */}
        <div style={styles.grid}>
          
          {/* FORMULÁRIO 1: INFORMAÇÕES PESSOAIS */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <User size={20} color="#2563eb" />
              <h3 style={styles.cardTitle}>Informações Pessoais</h3>
            </div>

            <form onSubmit={handleUpdateProfile} style={styles.form}>
              <div>
                <label style={styles.label}>Nome Completo</label>
                <div style={styles.inputContainer}>
                  <User size={18} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>Endereço de E-mail</label>
                <div style={styles.inputContainer}>
                  <Mail size={18} color="#94a3b8" />
                  <input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <button type="submit" disabled={loadingProfile} style={styles.buttonPrimary}>
                <Save size={18} />
                {loadingProfile ? 'Salvando...' : 'Salvar Dados'}
              </button>
            </form>
          </div>

          {/* FORMULÁRIO 2: SEGURANÇA & SENHA */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <ShieldCheck size={20} color="#16a34a" />
              <h3 style={styles.cardTitle}>Segurança & Senha</h3>
            </div>

            <form onSubmit={handleChangePassword} style={styles.form}>
              <div>
                <label style={styles.label}>Senha Atual</label>
                <div style={styles.inputContainer}>
                  <Lock size={18} color="#94a3b8" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeButton}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={styles.label}>Nova Senha</label>
                <div style={styles.inputContainer}>
                  <KeyRound size={18} color="#94a3b8" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={styles.label}>Confirmar Nova Senha</label>
                <div style={styles.inputContainer}>
                  <KeyRound size={18} color="#94a3b8" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loadingPassword} style={styles.buttonSuccess}>
                <ShieldCheck size={18} />
                {loadingPassword ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 80px)',
  },
  content: {
    width: '100%',
    maxWidth: '900px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    backgroundColor: '#ffffff',
    padding: '1.5rem 2rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    border: '2px solid #bfdbfe',
  },
  userName: {
    margin: 0,
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmail: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '1.75rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #f1f5f9',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '0.35rem',
    color: '#475569',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.65rem 0.75rem',
    backgroundColor: '#f8fafc',
  },
  input: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.95rem',
    backgroundColor: 'transparent',
    color: '#0f172a',
  },
  eyeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex',
    padding: 0,
  },
  buttonPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  buttonSuccess: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
};