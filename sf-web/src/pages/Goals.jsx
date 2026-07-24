import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Target, Plus, Trash2, CalendarDays, BadgeCheck } from 'lucide-react';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'Outros',
  });

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const response = await api.get('/goals');
        setGoals(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao carregar metas:', error);
        toast.error('Erro ao carregar metas');
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  const totalTarget = useMemo(
    () => goals.reduce((acc, goal) => acc + Number(goal.targetAmount || 0), 0),
    [goals]
  );

  const totalCurrent = useMemo(
    () => goals.reduce((acc, goal) => acc + Number(goal.currentAmount || 0), 0),
    [goals]
  );

  const totalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.targetAmount || !form.deadline) return;

    try {
      const payload = {
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
        deadline: form.deadline,
        category: form.category,
      };

      const response = await api.post('/goals', payload);
      setGoals((prev) => [response.data, ...prev]);

      setForm({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        category: 'Outros',
      });

      toast.success('Meta criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast.error('Erro ao criar meta');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta meta?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/goals/${id}`);
      setGoals((prev) => prev.filter((goal) => goal.id !== id));
      toast.success('Meta excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast.error('Erro ao excluir meta');
    }
  };

  const updateCurrentAmount = async (id, delta) => {
    try {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;

      const newCurrentAmount = Math.max(0, Number(goal.currentAmount || 0) + delta);
      const completed = newCurrentAmount >= Number(goal.targetAmount || 0);

      const response = await api.put(`/goals/${id}`, {
        currentAmount: newCurrentAmount,
        completed,
      });

      setGoals((prev) => prev.map((g) => (g.id === id ? response.data : g)));
      toast.success('Meta atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div>
          <span style={styles.badge}>
            <Target size={16} /> Metas financeiras
          </span>
          <h1 style={styles.title}>Planeje e acompanhe seus objetivos</h1>
          <p style={styles.subtitle}>
            Crie metas, acompanhe o progresso e mantenha o foco no que você quer conquistar.
          </p>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Metas ativas</span>
            <strong style={styles.summaryValue}>{goals.length}</strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Valor alvo</span>
            <strong style={styles.summaryValue}>
              R$ {totalTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Valor acumulado</span>
            <strong style={styles.summaryValue}>
              R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>

          <div style={{ ...styles.summaryCard, gridColumn: '1 / -1' }}>
            <span style={styles.summaryLabel}>Progresso geral</span>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(totalProgress, 100)}%`,
                }}
              />
            </div>
            <strong style={styles.progressText}>
              {Math.min(totalProgress, 100).toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>
            <Plus size={18} /> Nova meta
          </h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nome da meta"
              style={styles.input}
            />

            <div style={styles.row}>
              <input
                type="number"
                name="targetAmount"
                value={form.targetAmount}
                onChange={handleChange}
                placeholder="Valor alvo"
                min="0"
                step="0.01"
                style={styles.input}
              />
              <input
                type="number"
                name="currentAmount"
                value={form.currentAmount}
                onChange={handleChange}
                placeholder="Valor atual"
                min="0"
                step="0.01"
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                style={styles.input}
              />
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Segurança">Segurança</option>
                <option value="Lazer">Lazer</option>
                <option value="Educação">Educação</option>
                <option value="Investimento">Investimento</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <button type="submit" style={styles.primaryButton}>
              Criar meta
            </button>
          </form>
        </section>

        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>
            <BadgeCheck size={18} /> Minhas metas
          </h2>

          {loading ? (
            <p style={styles.emptyState}>Carregando metas...</p>
          ) : (
            <div style={styles.goalsList}>
              {goals.length === 0 ? (
                <p style={styles.emptyState}>Nenhuma meta cadastrada ainda.</p>
              ) : (
                goals.map((goal) => {
                  const progress = Math.min(
                    (goal.currentAmount / goal.targetAmount) * 100 || 0,
                    100
                  );
                  const isComplete = progress >= 100;

                  return (
                    <article key={goal.id} style={styles.goalCard}>
                      <div style={styles.goalHeader}>
                        <div>
                          <h3 style={styles.goalTitle}>{goal.name}</h3>
                          <p style={styles.goalMeta}>{goal.category}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          style={styles.iconButton}
                          title="Excluir meta"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={styles.goalInfo}>
                        <span>
                          <strong>Atual:</strong> R${' '}
                          {Number(goal.currentAmount).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span>
                          <strong>Alvo:</strong> R${' '}
                          {Number(goal.targetAmount).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <div style={styles.goalFooter}>
                        <span style={styles.goalMeta}>
                          <CalendarDays size={14} />{' '}
                          {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                        </span>
                        <span style={isComplete ? styles.completeTag : styles.tag}>
                          {isComplete ? 'Concluída' : `${progress.toFixed(1)}%`}
                        </span>
                      </div>

                      <div style={styles.actionsRow}>
                        <button
                          type="button"
                          onClick={() => updateCurrentAmount(goal.id, 100)}
                          style={styles.secondaryButton}
                        >
                          + R$ 100
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCurrentAmount(goal.id, 500)}
                          style={styles.secondaryButton}
                        >
                          + R$ 500
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>
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
  goalsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  goalCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1rem',
    backgroundColor: '#f8fafc',
  },
  goalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'start',
    marginBottom: '0.9rem',
  },
  goalTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '1rem',
  },
  goalMeta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#64748b',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
  },
  goalInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
    color: '#334155',
    fontSize: '0.9rem',
  },
  goalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'center',
    marginTop: '0.85rem',
    flexWrap: 'wrap',
  },
  tag: {
    padding: '0.35rem 0.6rem',
    borderRadius: '999px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  completeTag: {
    padding: '0.35rem 0.6rem',
    borderRadius: '999px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  iconButton: {
    border: 'none',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  actionsRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  secondaryButton: {
    padding: '0.55rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#0f172a',
    cursor: 'pointer',
    fontWeight: '600',
  },
  emptyState: {
    color: '#64748b',
    textAlign: 'center',
    padding: '1rem 0',
  },
};