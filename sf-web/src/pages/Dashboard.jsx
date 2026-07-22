import { useState, useEffect } from 'react';
import api from '../api';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Plus, Trash2 } from 'lucide-react';

export function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('INCOME');
  const [loading, setLoading] = useState(false);

  // Auxiliar para tratar qualquer formato de resposta da API
  const parseTransactionsData = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.transactions)) return data.transactions;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  };

  // Buscar transações ao carregar a página
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await api.get('/transactions');
        const list = parseTransactionsData(response.data);
        setTransactions(list);
      } catch (err) {
        console.error('Erro ao carregar transações', err);
        setTransactions([]);
      }
    }

    fetchTransactions();
  }, []);

  // Função para recarregar após ações de criar/deletar
  const reloadTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      const list = parseTransactionsData(response.data);
      setTransactions(list);
    } catch (err) {
      console.error('Erro ao recarregar transações', err);
    }
  };

  // Cadastrar nova transação
  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    setLoading(true);
    try {
      await api.post('/transactions', {
        title,
        description: title,
        amount: parseFloat(amount),
        type,
      });

      setTitle('');
      setAmount('');
      await reloadTransactions();
    } catch (err) {
      console.error(err.response?.data);
      window.alert(err.response?.data?.error || err.response?.data?.message || 'Erro ao criar transação');
    } finally {
      setLoading(false);
    }
  };

  // Deletar transação
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta transação?')) return;

    try {
      await api.delete(`/transactions/${id}`);
      await reloadTransactions();
    } catch (err) {
      console.error(err);
      window.alert('Erro ao excluir transação');
    }
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Cálculos do Resumo
  const income = safeTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const outcome = safeTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const total = income - outcome;

  return (
    <div style={styles.container}>
      {/* CARDS DE RESUMO */}
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Entradas</span>
            <ArrowUpCircle color="#10b981" size={24} />
          </div>
          <strong style={{ ...styles.cardValue, color: '#10b981' }}>
            R$ {income.toFixed(2)}
          </strong>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Saídas</span>
            <ArrowDownCircle color="#ef4444" size={24} />
          </div>
          <strong style={{ ...styles.cardValue, color: '#ef4444' }}>
            R$ {outcome.toFixed(2)}
          </strong>
        </div>

        <div style={{ ...styles.card, backgroundColor: total >= 0 ? '#10b981' : '#ef4444', color: '#fff' }}>
          <div style={styles.cardHeader}>
            <span style={{ color: '#fff' }}>Saldo Total</span>
            <DollarSign color="#fff" size={24} />
          </div>
          <strong style={styles.cardValue}>
            R$ {total.toFixed(2)}
          </strong>
        </div>
      </div>

      {/* FORMULÁRIO DE NOVA TRANSAÇÃO */}
      <form onSubmit={handleCreateTransaction} style={styles.formCard}>
        <h3 style={styles.formTitle}>Nova Transação</h3>
        <div style={styles.formGrid}>
          <input
            type="text"
            placeholder="Descrição (ex: Salário, Aluguel)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Valor (R$)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={styles.input}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} style={styles.select}>
            <option value="INCOME">Entrada (Receita)</option>
            <option value="EXPENSE">Saída (Despesa)</option>
          </select>
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            <Plus size={18} /> {loading ? 'Enviando...' : 'Add'}
          </button>
        </div>
      </form>

      {/* TABELA DE TRANSAÇÕES */}
      <div style={styles.tableCard}>
        <h3 style={styles.formTitle}>Histórico de Transações</h3>
        {safeTransactions.length === 0 ? (
          <p style={styles.emptyText}>Nenhuma transação registrada ainda.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Descrição</th>
                <th style={styles.th}>Valor</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {safeTransactions.map((t) => (
                <tr key={t.id || t._id}>
                  <td style={styles.td}>{t.title || t.description}</td>
                  <td
                    style={{
                      ...styles.td,
                      color: t.type === 'INCOME' ? '#10b981' : '#ef4444',
                      fontWeight: 'bold',
                    }}
                  >
                    {t.type === 'INCOME' ? '+ ' : '- '}R$ {Number(t.amount).toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleDeleteTransaction(t.id || t._id)} style={styles.deleteBtn}>
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

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' },
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: '#64748b' },
  cardValue: { fontSize: '1.75rem', fontWeight: 'bold' },
  formCard: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  formTitle: { margin: '0 0 1rem 0', color: '#1e293b' },
  formGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem' },
  input: { padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' },
  select: { padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' },
  submitBtn: { display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.6rem 1.2rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  tableCard: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  emptyText: { color: '#94a3b8', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '0.75rem', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.875rem' },
  td: { padding: '0.75rem', color: '#334155' },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' },
};