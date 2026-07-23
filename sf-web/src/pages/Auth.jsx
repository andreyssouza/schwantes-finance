import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import logoImg from '../assets/logosfoff.png';
import { User, Mail, Lock, FileText, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

export function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  // Estados dos campos
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auxiliares de interface
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Função para aplicar máscara de CPF (000.000.000-00)
  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (value.length > 11) value = value.slice(0, 11);

    // Aplica a formatação
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    setCpf(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- ROTA DE LOGIN ---
        if (!email || !password) {
          toast.error('Preencha o e-mail e a senha!');
          setLoading(false);
          return;
        }

        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;

        // Salva o token
        localStorage.setItem('token', token);
        localStorage.setItem('@SF:token', token);

        // Salva os dados do usuário nas duas chaves para garantir sincronia no Profile
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('@SF:user', JSON.stringify(user));
        }

        toast.success(`Bem-vindo(a), ${user?.name || 'usuário'}!`);
        if (onLoginSuccess) onLoginSuccess(user);

      } else {
        // --- ROTA DE CADASTRO ---
        if (!name || !cpf || !email || !password) {
          toast.error('Preencha todos os campos do cadastro!');
          setLoading(false);
          return;
        }

        // Limpa a pontuação do CPF para enviar apenas números
        const rawCpf = cpf.replace(/\D/g, '');

        await api.post('/auth/register', {
          name,
          cpf: rawCpf,
          email,
          password,
        });

        toast.success('Cadastro realizado com sucesso! Efetuando login...');

        // Faz login automático imediatamente após o cadastro
        const loginResponse = await api.post('/auth/login', { email, password });
        const { token, user } = loginResponse.data;

        localStorage.setItem('token', token);
        localStorage.setItem('@SF:token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('@SF:user', JSON.stringify(user));

        if (onLoginSuccess) onLoginSuccess(user);
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);

      // Tratamento genérico e abrangente para capturar qualquer formato de erro do backend
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.details ||
        (isLogin ? 'E-mail ou senha incorretos.' : 'Erro ao realizar cadastro. Verifique os dados.');

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* LOGO E TÍTULO */}
        <div style={styles.header}>
          <img src={logoImg} alt="Schwantes Finance" style={styles.logo} />
          <p style={styles.subtitle}>
            {isLogin ? 'Entre com sua conta para continuar' : 'Crie sua conta em poucos passos'}
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* CAMPOS ADICIONAIS DO CADASTRO */}
          {!isLogin && (
            <>
              <div>
                <label style={styles.label}>Nome Completo</label>
                <div style={styles.inputContainer}>
                  <User size={18} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    style={styles.input}
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>CPF</label>
                <div style={styles.inputContainer}>
                  <FileText size={18} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    required={!isLogin}
                    maxLength={14}
                    style={styles.input}
                  />
                </div>
              </div>
            </>
          )}

          {/* CAMPOS COMUNS (E-MAIL E SENHA) */}
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

          <div>
            <label style={styles.label}>Senha</label>
            <div style={styles.inputContainer}>
              <Lock size={18} color="#94a3b8" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* BOTÃO PRINCIPAL */}
          <button type="submit" disabled={loading} style={styles.submitButton}>
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        {/* ALTERNAR ENTRE LOGIN E CADASTRO */}
        <div style={styles.footer}>
          <span>{isLogin ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'}</span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setName('');
              setCpf('');
            }}
            style={styles.switchButton}
          >
            {isLogin ? 'Cadastre-se' : 'Fazer Login'}
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '2rem',
    border: '1px solid #e2e8f0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  logo: {
    height: '150px',
    marginBottom: '0.5rem',
  },
  subtitle: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    textAlign: 'left',
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
  submitButton: {
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
  footer: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#64748b',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.35rem',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: 0,
    fontSize: '0.875rem',
  },
};