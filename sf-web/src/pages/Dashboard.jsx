import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Sun, 
  Moon,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('INCOME');
  const [loading, setLoading] = useState(false);

  // Filtros de busca e tipo
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Filtro de Mês e Ano (padrão: mês e ano atuais)
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0 a 11
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);

  // Lista de meses para o select
  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' },
    { value: 'ALL', label: 'Todos os Meses' },
  ];

  // Anos disponíveis para o select (ano atual - 2 até ano atual + 2)
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  // Auxiliares de Formatação
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  };

  const parseTransactionsData = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.transactions)) return data.transactions;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const reloadTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(parseTransactionsData(response.data));
    } catch (err) {
      console.error('Erro ao carregar transações', err);
      toast.error('Erro ao carregar histórico de transações');
      setTransactions([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const response = await api.get('/transactions');
        if (isMounted) {
          setTransactions(parseTransactionsData(response.data));
        }
      } catch (err) {
        if (isMounted) {
          console.error('Erro ao carregar transações', err);
          toast.error('Erro ao carregar histórico de transações');
          setTransactions([]);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount) {
      toast.error('Preencha a descrição e o valor!');
      return;
    }

    setLoading(true);
    try {
      await api.post('/transactions', {
        title,
        description: title,
        amount: parseFloat(amount),
        type,
      });

      toast.success('Transação adicionada com sucesso!');
      setTitle('');
      setAmount('');
      await reloadTransactions();
    } catch (err) {
      console.error(err.response?.data);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Erro ao criar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta transação?')) return;

    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transação excluída!');
      await reloadTransactions();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir transação');
    }
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // FILTRAGEM POR MÊS E ANO
  const monthFilteredTransactions = safeTransactions.filter((t) => {
    const rawDate = t.createdAt || t.date;
    if (!rawDate) return true;

    const tDate = new Date(rawDate);
    const matchesYear = selectedYear === 'ALL' || tDate.getFullYear() === Number(selectedYear);
    const matchesMonth = selectedMonth === 'ALL' || tDate.getMonth() === Number(selectedMonth);

    return matchesYear && matchesMonth;
  });

  // FILTRAGEM FINAL POR BUSCA DE TEXTO E TIPO (INCOME / EXPENSE)
  const filteredTransactions = monthFilteredTransactions.filter((t) => {
    const text = t.title || t.description || '';
    const matchesSearch = text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  // CÁLCULOS BASEADOS APENAS NO PERÍODO SELECIONADO
  const income = monthFilteredTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const outcome = monthFilteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const total = income - outcome;

  const chartData = [
    { name: 'Entradas', value: income, color: '#10b981' },
    { name: 'Saídas', value: outcome, color: '#ef4444' },
  ];

  const theme = {
    bgCard: darkMode ? '#1e293b' : '#ffffff',
    textPrimary: darkMode ? '#f8fafc' : '#1e293b',
    textSecondary: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#cbd5e1',
    tableBorder: darkMode ? '#334155' : '#f1f5f9',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      
      {/* BARRA SUPERIOR COM FILTRO DE MÊS/ANO E MODO ESCURO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* FILTRO PERÍODO (MÊS E ANO) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: theme.bgCard, padding: '0.5rem 1rem', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
          <Calendar size={18} color={theme.textSecondary} />
          <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: theme.textPrimary }}>Período:</span>
          
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.bgCard, color: theme.textPrimary, fontSize: '0.875rem' }}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.bgCard, color: theme.textPrimary, fontSize: '0.875rem' }}
          >
            <option value="ALL">Todos os Anos</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* BOTÃO MODO ESCURO */}
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.bgCard,
            color: theme.textPrimary,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {darkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>

      {/* CARDS DE TOTALIZADORES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: theme.bgCard, padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: theme.textSecondary }}>
            <span>Entradas</span>
            <ArrowUpCircle color="#10b981" size={24} />
          </div>
          <strong style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981' }}>
            {formatCurrency(income)}
          </strong>
        </div>

        <div style={{ backgroundColor: theme.bgCard, padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: theme.textSecondary }}>
            <span>Saídas</span>
            <ArrowDownCircle color="#ef4444" size={24} />
          </div>
          <strong style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#ef4444' }}>
            {formatCurrency(outcome)}
          </strong>
        </div>

        <div style={{ backgroundColor: total >= 0 ? '#10b981' : '#ef4444', color: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span>Saldo do Período</span>
            <DollarSign color="#fff" size={24} />
          </div>
          <strong style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
            {formatCurrency(total)}
          </strong>
        </div>
      </div>

      {/* FORMULÁRIO E GRÁFICO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <form onSubmit={handleCreateTransaction} style={{ backgroundColor: theme.bgCard, padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: theme.textPrimary }}>Nova Transação</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Descrição (ex: Salário, Aluguel)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ padding: '0.66rem', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.bgCard, color: theme.textPrimary }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor (R$)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ padding: '0.66rem', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.bgCard, color: theme.textPrimary }}
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ padding: '0.66rem', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.bgCard, color: theme.textPrimary }}
            >
              <option value="INCOME">Entrada (Receita)</option>
              <option value="EXPENSE">Saída (Despesa)</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '0.5rem',
              }}
            >
              <Plus size={18} /> {loading ? 'Enviando...' : 'Adicionar Transação'}
            </button>
          </div>
        </form>

        <div style={{ backgroundColor: theme.bgCard, padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: theme.textPrimary, alignSelf: 'flex-start' }}>Visão Geral do Mês</h3>
          {income === 0 && outcome === 0 ? (
            <p style={{ color: theme.textSecondary, margin: 'auto' }}>Sem lançamentos neste período.</p>
          ) : (
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* TABELA DE HISTÓRICO */}
      <div style={{ backgroundColor: theme.bgCard, padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: theme.textPrimary }}>Histórico de Transações</h3>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '0.4rem 0.75rem' }}>
              <Search size={16} color={theme.textSecondary} />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.875rem', backgroundColor: 'transparent', color: theme.textPrimary }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '0.4rem 0.75rem' }}>
              <Filter size={16} color={theme.textSecondary} />
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.875rem', backgroundColor: 'transparent', color: theme.textPrimary }}
              >
                <option value="ALL">Todas</option>
                <option value="INCOME">Entradas</option>
                <option value="EXPENSE">Saídas</option>
              </select>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p style={{ color: theme.textSecondary, margin: 0 }}>Nenhuma transação encontrada para este período.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem', borderBottom: `2px solid ${theme.tableBorder}`, color: theme.textSecondary, fontSize: '0.875rem' }}>Descrição</th>
                <th style={{ padding: '0.75rem', borderBottom: `2px solid ${theme.tableBorder}`, color: theme.textSecondary, fontSize: '0.875rem' }}>Valor</th>
                <th style={{ padding: '0.75rem', borderBottom: `2px solid ${theme.tableBorder}`, color: theme.textSecondary, fontSize: '0.875rem' }}>Tipo</th>
                <th style={{ padding: '0.75rem', borderBottom: `2px solid ${theme.tableBorder}`, color: theme.textSecondary, fontSize: '0.875rem' }}>Data</th>
                <th style={{ padding: '0.75rem', borderBottom: `2px solid ${theme.tableBorder}`, color: theme.textSecondary, fontSize: '0.875rem' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id || t._id}>
                  <td style={{ padding: '0.75rem', color: theme.textPrimary, borderBottom: `1px solid ${theme.tableBorder}` }}>{t.title || t.description}</td>
                  <td
                    style={{
                      padding: '0.75rem',
                      borderBottom: `1px solid ${theme.tableBorder}`,
                      color: t.type === 'INCOME' ? '#10b981' : '#ef4444',
                      fontWeight: 'bold',
                    }}
                  >
                    {t.type === 'INCOME' ? '+ ' : '- '}{formatCurrency(t.amount)}
                  </td>
                  <td style={{ padding: '0.75rem', color: theme.textPrimary, borderBottom: `1px solid ${theme.tableBorder}` }}>
                    {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                  </td>
                  <td style={{ padding: '0.75rem', color: theme.textPrimary, borderBottom: `1px solid ${theme.tableBorder}` }}>{formatDate(t.createdAt || t.date)}</td>
                  <td style={{ padding: '0.75rem', borderBottom: `1px solid ${theme.tableBorder}` }}>
                    <button type="button" onClick={() => handleDeleteTransaction(t.id || t._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}