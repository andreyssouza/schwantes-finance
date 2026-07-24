import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Trash2,
  Download,
  Search
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Estados do Formulário de Nova Transação
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'expense' (Saída) ou 'income' (Entrada)
  const [category, setCategory] = useState('Moradia'); // Categoria inicial padrão

  // Estados de Filtro/Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Buscar transações ao carregar a página (com tratamento de Array seguro)
  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      try {
        const response = await api.get('/transactions');
        if (isMounted) {
          // Garante extração correta mesmo se a API envelopar a resposta
          const data = Array.isArray(response.data)
            ? response.data
            : response.data?.transactions || response.data?.data || [];

          setTransactions(data);
        }
      } catch (error) {
        console.error('Erro ao buscar transações:', error);
        toast.error('Erro ao carregar transações');
        if (isMounted) {
          setTransactions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Trata a mudança de Tipo no formulário
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    if (newType === 'income') {
      setCategory('Salário');
    } else {
      setCategory('Moradia');
    }
  };

  // Adicionar Nova Transação
  const handleAddTransaction = async (e) => {
    e.preventDefault();

    if (!description.trim() || !amount) {
      toast.error('Preencha a descrição e o valor!');
      return;
    }

    try {
      const payload = {
        description,
        amount: parseFloat(amount),
        type,
        category,
      };

      const response = await api.post('/transactions', payload);

      setTransactions((prev) => [response.data, ...prev]);
      toast.success('Transação adicionada com sucesso!');

      // Resetar os campos
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('Moradia');
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast.error('Erro ao salvar transação');
    }
  };

  // Excluir Transação
  const handleDeleteTransaction = async (id) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta transação?');
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success('Transação removida!');
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      toast.error('Erro ao excluir transação');
    } finally {
      setDeletingId(null);
    }
  };

  // Garantia de segurança contra dados que não sejam Array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Filtro na Lista de Transações
  const filteredTransactions = safeTransactions.filter((t) => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'income' && (t.type === 'income' || t.type === 'entrada')) ||
      (filterType === 'expense' && (t.type === 'expense' || t.type === 'saida'));

    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Exportar para CSV
  const exportToCSV = () => {
    if (safeTransactions.length === 0) {
      toast.error('Nenhuma transação para exportar');
      return;
    }

    const headers = 'Descrição,Valor,Tipo,Categoria,Data\n';
    const rows = filteredTransactions
      .map((t) => {
        const rawDate = t.createdAt || t.date;
        const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('pt-BR') : '-';
        return `"${t.description}",${t.amount},${t.type},"${t.category || 'Outros'}",${formattedDate}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transacoes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cálculos do Resumo Financeiro
  const totalIncome = safeTransactions
    .filter((t) => t.type === 'income' || t.type === 'entrada')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalExpense = safeTransactions
    .filter((t) => t.type === 'expense' || t.type === 'saida')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalBalance = totalIncome - totalExpense;

  // Dados do Gráfico de Categorias
  const categoryTotals = safeTransactions
    .filter((t) => t.type === 'expense' || t.type === 'saida')
    .reduce((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  const chartData = {
    labels: Object.keys(categoryTotals).length > 0 ? Object.keys(categoryTotals) : ['Nenhum gasto'],
    datasets: [
      {
        data: Object.values(categoryTotals).length > 0 ? Object.values(categoryTotals) : [1],
        backgroundColor: [
          '#3b82f6',
          '#ef4444',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#64748b'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={styles.container}>

      {/* TARJETAS DE RESUMO */}
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Entradas</span>
            <ArrowUpCircle color="#10b981" size={24} />
          </div>
          <h2 style={{ ...styles.cardValue, color: '#10b981' }}>
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Saídas</span>
            <ArrowDownCircle color="#ef4444" size={24} />
          </div>
          <h2 style={{ ...styles.cardValue, color: '#ef4444' }}>
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div style={{ ...styles.card, backgroundColor: '#10b981', color: '#fff' }}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.cardTitle, color: '#fff' }}>Saldo do Período</span>
            <DollarSign color="#fff" size={24} />
          </div>
          <h2 style={{ ...styles.cardValue, color: '#fff' }}>
            R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: FORMULÁRIO E GRÁFICO */}
      <div style={styles.mainGrid}>

        {/* FORMULÁRIO */}
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Nova Transação</h3>
          <form onSubmit={handleAddTransaction} style={styles.form}>

            <input
              type="text"
              placeholder="Descrição (ex: Mercado, Aluguel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.input}
              required
            />

            <input
              type="number"
              step="0.01"
              placeholder="Valor (R$)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
              required
            />

            <div style={styles.row}>
              <select value={type} onChange={handleTypeChange} style={styles.select}>
                <option value="expense">Saída</option>
                <option value="income">Entrada</option>
              </select>

              <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
                {type === 'income' ? (
                  <>
                    <option value="Salário">Salário</option>
                    <option value="Investimentos">Investimentos</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Outros">Outros</option>
                  </>
                ) : (
                  <>
                    <option value="Moradia">Moradia</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Outros">Outros</option>
                  </>
                )}
              </select>
            </div>

            <button type="submit" style={styles.submitButton}>
              + Adicionar Transação
            </button>
          </form>
        </div>

        {/* GRÁFICO */}
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Gastos por Categoria</h3>
          <div style={styles.chartContainer}>
            <Doughnut
              data={chartData}
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
        </div>

      </div>

      {/* HISTÓRICO DE TRANSAÇÕES */}
      <div style={styles.panel}>

        <div style={styles.tableHeaderSection}>
          <h3 style={styles.panelTitle}>Histórico de Transações</h3>

          <div style={styles.filtersContainer}>

            <button onClick={exportToCSV} style={styles.exportButton}>
              <Download size={16} /> Exportar CSV
            </button>

            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="ALL">Todos Tipos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="ALL">Todas Categ.</option>
              <option value="Salário">Salário</option>
              <option value="Moradia">Moradia</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Transporte">Transporte</option>
              <option value="Lazer">Lazer</option>
              <option value="Investimentos">Investimentos</option>
              <option value="Outros">Outros</option>
            </select>

          </div>
        </div>

        {/* TABELA */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Carregando...</p>
        ) : filteredTransactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
            Nenhuma transação encontrada.
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Descrição</th>
                <th style={styles.th}>Valor</th>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>Data</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => {
                const isIncome = t.type === 'income' || t.type === 'entrada';
                const rawDate = t.createdAt || t.date;
                const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('pt-BR') : '-';

                return (
                  <tr key={t.id} style={styles.tr}>
                    <td style={styles.td}>{t.description}</td>
                    <td style={{ ...styles.td, fontWeight: 'bold', color: isIncome ? '#10b981' : '#ef4444' }}>
                      {isIncome ? '+ ' : '- '}
                      R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{t.category || 'Outros'}</span>
                    </td>
                    <td style={styles.td}>{formattedDate}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        style={styles.deleteButton}
                        title="Excluir"
                        disabled={deletingId === t.id}
                      >
                        {deletingId === t.id ? 'Excluindo...' : <Trash2 size={16} color="#ef4444" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  cardTitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: '1.75rem',
    margin: 0,
    fontWeight: 'bold',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  panel: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
  },
  panelTitle: {
    margin: '0 0 1.25rem 0',
    fontSize: '1.1rem',
    color: '#1e293b',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
  },
  select: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
  },
  submitButton: {
    padding: '0.75rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  chartContainer: {
    height: '240px',
    position: 'relative',
  },
  tableHeaderSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1rem',
  },
  filtersContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.8rem',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: '#fff',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.85rem',
    width: '120px',
  },
  filterSelect: {
    padding: '0.4rem 0.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.85rem',
    backgroundColor: '#fff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '2px solid #e2e8f0',
  },
  th: {
    padding: '0.75rem',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '0.75rem',
    fontSize: '0.9rem',
    color: '#334155',
  },
  badge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    opacity: 1,
    minWidth: '90px',
  },
};