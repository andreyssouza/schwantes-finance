import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Plus, Trash2, Calculator, Wallet, BarChart3 } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    type: 'Renda Fixa',
    investedAmount: '',
    currentValue: '',
    monthlyRate: '',
  });

  const [simulation, setSimulation] = useState({
    initialValue: '1000',
    monthlyContribution: '200',
    monthlyRate: '0.8',
    periodMonths: '12',
  });

  useEffect(() => {
    const loadInvestments = async () => {
      try {
        const response = await api.get('/investments');
        setInvestments(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao carregar investimentos:', error);
        toast.error('Erro ao carregar investimentos');
      } finally {
        setLoading(false);
      }
    };

    loadInvestments();
  }, []);

  const totalInvested = useMemo(
    () => investments.reduce((acc, item) => acc + Number(item.investedAmount || 0), 0),
    [investments]
  );

  const totalCurrent = useMemo(
    () => investments.reduce((acc, item) => acc + Number(item.currentValue || 0), 0),
    [investments]
  );

  const totalProfit = totalCurrent - totalInvested;

  const handleInvestmentChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSimulationChange = (e) => {
    const { name, value } = e.target;
    setSimulation((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInvestment = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.investedAmount) return;

    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        investedAmount: Number(form.investedAmount),
        currentValue: Number(form.currentValue || form.investedAmount),
        monthlyRate: Number(form.monthlyRate || 0),
      };

      const response = await api.post('/investments', payload);
      setInvestments((prev) => [response.data, ...prev]);

      setForm({
        name: '',
        type: 'Renda Fixa',
        investedAmount: '',
        currentValue: '',
        monthlyRate: '',
      });

      toast.success('Investimento criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      toast.error('Erro ao criar investimento');
    }
  };

  const handleDeleteInvestment = async (id) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir este investimento?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/investments/${id}`);
      setInvestments((prev) => prev.filter((item) => item.id !== id));
      toast.success('Investimento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir investimento:', error);
      toast.error('Erro ao excluir investimento');
    }
  };

  const simulationData = useMemo(() => {
    const initialValue = Number(simulation.initialValue || 0);
    const monthlyContribution = Number(simulation.monthlyContribution || 0);
    const monthlyRate = Number(simulation.monthlyRate || 0) / 100;
    const periodMonths = Number(simulation.periodMonths || 0);

    const data = [];
    let balance = initialValue;

    for (let month = 0; month <= periodMonths; month += 1) {
      if (month > 0) {
        balance = (balance + monthlyContribution) * (1 + monthlyRate);
      }

      data.push({
        month: `M${month}`,
        value: Number(balance.toFixed(2)),
      });
    }

    return data;
  }, [simulation]);

  const simulationResult = useMemo(() => {
    const initialValue = Number(simulation.initialValue || 0);
    const monthlyContribution = Number(simulation.monthlyContribution || 0);
    const monthlyRate = Number(simulation.monthlyRate || 0) / 100;
    const periodMonths = Number(simulation.periodMonths || 0);

    let balance = initialValue;
    let totalContributed = initialValue;

    for (let month = 0; month < periodMonths; month += 1) {
      balance = (balance + monthlyContribution) * (1 + monthlyRate);
      totalContributed += monthlyContribution;
    }

    return {
      finalValue: balance,
      totalContributed,
      estimatedProfit: balance - totalContributed,
    };
  }, [simulation]);

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div>
          <span style={styles.badge}>
            <TrendingUp size={16} /> Investimentos e simulação
          </span>
          <h1 style={styles.title}>Acompanhe sua carteira e simule crescimento</h1>
          <p style={styles.subtitle}>
            Registre seus investimentos, veja o desempenho total e estime cenários futuros de forma simples.
          </p>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total investido</span>
            <strong style={styles.summaryValue}>
              R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Valor atual</span>
            <strong style={styles.summaryValue}>
              R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Lucro estimado</span>
            <strong style={styles.summaryValue}>
              R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>

          <div style={{ ...styles.summaryCard, gridColumn: '1 / -1' }}>
            <span style={styles.summaryLabel}>Performance geral</span>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${totalInvested > 0 ? Math.min((totalCurrent / totalInvested) * 100, 100) : 0}%`,
                }}
              />
            </div>
            <strong style={styles.progressText}>
              {totalInvested > 0 ? ((totalCurrent / totalInvested) * 100).toFixed(1) : '0.0'}%
            </strong>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>
            <Plus size={18} /> Novo investimento
          </h2>

          <form onSubmit={handleAddInvestment} style={styles.form}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInvestmentChange}
              placeholder="Nome do investimento"
              style={styles.input}
            />

            <div style={styles.row}>
              <select name="type" value={form.type} onChange={handleInvestmentChange} style={styles.input}>
                <option value="Renda Fixa">Renda Fixa</option>
                <option value="Renda Variável">Renda Variável</option>
                <option value="Fundo">Fundo</option>
                <option value="Cripto">Cripto</option>
              </select>

              <input
                type="number"
                name="monthlyRate"
                value={form.monthlyRate}
                onChange={handleInvestmentChange}
                placeholder="Rendimento mensal (%)"
                min="0"
                step="0.01"
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <input
                type="number"
                name="investedAmount"
                value={form.investedAmount}
                onChange={handleInvestmentChange}
                placeholder="Valor investido"
                min="0"
                step="0.01"
                style={styles.input}
              />
              <input
                type="number"
                name="currentValue"
                value={form.currentValue}
                onChange={handleInvestmentChange}
                placeholder="Valor atual"
                min="0"
                step="0.01"
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.primaryButton}>
              Adicionar investimento
            </button>
          </form>
        </section>

        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>
            <Calculator size={18} /> Simulador
          </h2>

          <div style={styles.form}>
            <div style={styles.row}>
              <input
                type="number"
                name="initialValue"
                value={simulation.initialValue}
                onChange={handleSimulationChange}
                placeholder="Valor inicial"
                min="0"
                step="0.01"
                style={styles.input}
              />
              <input
                type="number"
                name="monthlyContribution"
                value={simulation.monthlyContribution}
                onChange={handleSimulationChange}
                placeholder="Aporte mensal"
                min="0"
                step="0.01"
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <input
                type="number"
                name="monthlyRate"
                value={simulation.monthlyRate}
                onChange={handleSimulationChange}
                placeholder="Taxa ao mês (%)"
                min="0"
                step="0.01"
                style={styles.input}
              />
              <input
                type="number"
                name="periodMonths"
                value={simulation.periodMonths}
                onChange={handleSimulationChange}
                placeholder="Período (meses)"
                min="1"
                step="1"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.simulationSummary}>
            <div style={styles.simulationCard}>
              <span style={styles.summaryLabel}>Valor final estimado</span>
              <strong style={styles.summaryValue}>
                R$ {simulationResult.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div style={styles.simulationCard}>
              <span style={styles.summaryLabel}>Total aportado</span>
              <strong style={styles.summaryValue}>
                R$ {simulationResult.totalContributed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div style={styles.simulationCard}>
              <span style={styles.summaryLabel}>Lucro projetado</span>
              <strong style={styles.summaryValue}>
                R$ {simulationResult.estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>
          <BarChart3 size={18} /> Evolução da simulação
        </h2>

        <div style={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>
          <Wallet size={18} /> Carteira de investimentos
        </h2>

        {loading ? (
          <p style={styles.emptyState}>Carregando investimentos...</p>
        ) : (
          <div style={styles.investmentsList}>
            {investments.length === 0 ? (
              <p style={styles.emptyState}>Nenhum investimento cadastrado ainda.</p>
            ) : (
              investments.map((item) => {
                const gain = Number(item.currentValue || 0) - Number(item.investedAmount || 0);
                const gainPercent = item.investedAmount > 0 ? (gain / item.investedAmount) * 100 : 0;

                return (
                  <article key={item.id} style={styles.investmentCard}>
                    <div style={styles.investmentHeader}>
                      <div>
                        <h3 style={styles.investmentTitle}>{item.name}</h3>
                        <p style={styles.investmentMeta}>{item.type}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteInvestment(item.id)}
                        style={styles.iconButton}
                        title="Excluir investimento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={styles.investmentInfo}>
                      <span>
                        <strong>Investido:</strong> R$ {Number(item.investedAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span>
                        <strong>Atual:</strong> R$ {Number(item.currentValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span>
                        <strong>Rentabilidade:</strong> {Number(item.monthlyRate || 0).toFixed(2)}% ao mês
                      </span>
                    </div>

                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(Math.max((Number(item.currentValue) / Number(item.investedAmount)) * 100, 0), 100)}%`,
                        }}
                      />
                    </div>

                    <div style={styles.investmentFooter}>
                      <span style={gain >= 0 ? styles.tagPositive : styles.tagNegative}>
                        {gain >= 0 ? '+' : '-'} R$ {Math.abs(gain).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span style={styles.percentageText}>
                        {gainPercent >= 0 ? '+' : ''}
                        {gainPercent.toFixed(1)}%
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.85rem',
    borderRadius: '999px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontWeight: '700',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    color: '#0f172a',
    lineHeight: 1.05,
  },
  subtitle: {
    marginTop: '0.85rem',
    color: '#64748b',
    fontSize: '1rem',
    lineHeight: 1.6,
    maxWidth: '60ch',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1rem',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  summaryLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '0.35rem',
  },
  summaryValue: {
    fontSize: '1.1rem',
    color: '#0f172a',
  },
  progressBar: {
    width: '100%',
    height: '10px',
    borderRadius: '999px',
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
    marginTop: '0.4rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #2563eb, #10b981)',
    borderRadius: '999px',
  },
  progressText: {
    display: 'inline-block',
    marginTop: '0.5rem',
    color: '#0f172a',
    fontSize: '0.9rem',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  panel: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '0 0 1rem 0',
    color: '#0f172a',
    fontSize: '1.05rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.75rem',
  },
  input: {
    width: '100%',
    padding: '0.85rem 0.95rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#0f172a',
  },
  primaryButton: {
    padding: '0.9rem 1rem',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
  },
  simulationSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  simulationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '1rem',
    border: '1px solid #e2e8f0',
  },
  chartContainer: {
    width: '100%',
    height: '280px',
  },
  investmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  investmentCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1rem',
    backgroundColor: '#f8fafc',
  },
  investmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'start',
    marginBottom: '0.9rem',
  },
  investmentTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '1rem',
  },
  investmentMeta: {
    marginTop: '0.25rem',
    color: '#64748b',
    fontSize: '0.85rem',
  },
  investmentInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
    color: '#334155',
    fontSize: '0.9rem',
  },
  investmentFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'center',
    marginTop: '0.85rem',
    flexWrap: 'wrap',
  },
  tagPositive: {
    padding: '0.35rem 0.6rem',
    borderRadius: '999px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  tagNegative: {
    padding: '0.35rem 0.6rem',
    borderRadius: '999px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  percentageText: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '700',
  },
  iconButton: {
    border: 'none',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  emptyState: {
    color: '#64748b',
    textAlign: 'center',
    padding: '1rem 0',
  },
};