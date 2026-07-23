import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, WalletCards, Sparkles, PlayCircle } from 'lucide-react';
import logoImg from '../assets/logosfoff.png';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard financeiro inteligente',
      description: 'Visualize entradas, saídas e saldo com gráficos claros e uma experiência moderna.',
    },
    {
      icon: WalletCards,
      title: 'Controle de transações',
      description: 'Cadastre, filtre e acompanhe suas movimentações com agilidade e organização.',
    },
    {
      icon: ShieldCheck,
      title: 'Perfil e segurança',
      description: 'Gerencie seus dados e senha com segurança em um fluxo simples e confiável.',
    },
  ];

  const highlights = [
    'Interface premium inspirada em fintechs modernas',
    'Experiência responsiva para desktop e mobile',
    'Visual com foco em clareza, confiança e performance',
  ];

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow} />
      <div style={styles.backgroundGlowAlt} />

      <header style={styles.header}>
        <div style={styles.brand}>
          <img src={logoImg} alt="Schwantes Finance" style={styles.brandLogo} />
          <div>
            <div style={styles.brandName}>Schwantes Finance</div>
            <div style={styles.brandTag}>Personal Finance SaaS</div>
          </div>
        </div>

        <div style={styles.headerActions}>
          <a href="#features" style={styles.secondaryButton}>Ver recursos</a>
          <Link to="/" style={styles.primaryButton}>Entrar no app</Link>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroText}>
            <div style={styles.badge}>
              <Sparkles size={16} />
              Finanças com visual premium
            </div>

            <h1 style={styles.title}>
              Organize suas finanças com uma experiência <span style={styles.titleAccent}>moderna e impactante</span>.
            </h1>

            <p style={styles.subtitle}>
              O Schwantes Finance foi pensado para transformar o controle financeiro em algo simples,
              bonito e profissional — com dashboard, perfil, transações e uma identidade visual de alto nível.
            </p>

            <div style={styles.ctaRow}>
              <Link to="/" style={styles.primaryCta}>
                Abrir aplicação
                <ArrowRight size={18} />
              </Link>
              <a href="#video" style={styles.videoCta}>
                <PlayCircle size={18} />
                Ver vídeo 3D
              </a>
            </div>

            <ul style={styles.highlightsList}>
              {highlights.map((item) => (
                <li key={item} style={styles.highlightItem}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={styles.heroVisual} id="video">
            <div style={styles.videoFrame}>
              <div style={styles.videoGlow} />
              <img src={logoImg} alt="Schwantes Finance logo 3D" style={{ ...styles.heroLogo, ...(mounted ? styles.heroLogoMounted : {}) }} />
              <div style={styles.videoCaption}>
                Logo 3D / hero visual
              </div>
              <div style={styles.videoBackdrop} />
            </div>
          </div>
        </section>

        <section id="features" style={styles.featuresSection}>
          <div style={styles.sectionHeader}>
            <p style={styles.sectionKicker}>Recursos principais</p>
            <h2 style={styles.sectionTitle}>Tudo o que você precisa para mostrar um projeto de portfólio forte.</h2>
          </div>

          <div style={styles.featuresGrid}>
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} style={styles.featureCard}>
                <div style={styles.featureIconWrap}>
                  <Icon size={22} color="#dbeafe" />
                </div>
                <h3 style={styles.featureTitle}>{title}</h3>
                <p style={styles.featureDescription}>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.bottomCta}>
          <div>
            <p style={styles.sectionKicker}>Pronto para impressionar</p>
            <h2 style={styles.bottomTitle}>Uma landing page bonita muda a percepção do projeto inteiro.</h2>
            <p style={styles.bottomText}>
              Use esta página para apresentar o produto, destacar o vídeo 3D e direcionar o usuário ao app.
            </p>
          </div>
          <Link to="/" style={styles.primaryButtonLarge}>Começar agora</Link>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #0f1a33 0%, #050816 45%, #02040b 100%)',
    color: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGlow: {
    position: 'absolute',
    inset: '-20% auto auto -10%',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: 'rgba(37, 99, 235, 0.25)',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  backgroundGlowAlt: {
    position: 'absolute',
    right: '-8%',
    top: '18%',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.18)',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  header: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
  },
  brandLogo: {
    width: '54px',
    height: '54px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 10px 25px rgba(37, 99, 235, 0.35))',
  },
  brandName: {
    fontSize: '1rem',
    fontWeight: '800',
    letterSpacing: '0.02em',
  },
  brandTag: {
    fontSize: '0.82rem',
    color: '#94a3b8',
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  primaryButton: {
    padding: '0.8rem 1.1rem',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '700',
    boxShadow: '0 12px 30px rgba(37, 99, 235, 0.22)',
  },
  secondaryButton: {
    padding: '0.8rem 1.1rem',
    borderRadius: '999px',
    background: 'rgba(15, 23, 42, 0.45)',
    color: '#e2e8f0',
    textDecoration: 'none',
    fontWeight: '700',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    backdropFilter: 'blur(12px)',
  },
  main: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem 4rem',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    gap: '2rem',
    alignItems: 'center',
    minHeight: 'calc(100vh - 120px)',
  },
  heroText: {
    padding: '1rem 0',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.45rem 0.8rem',
    borderRadius: '999px',
    background: 'rgba(37, 99, 235, 0.16)',
    border: '1px solid rgba(96, 165, 250, 0.25)',
    color: '#bfdbfe',
    fontSize: '0.85rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  title: {
    fontSize: 'clamp(2.6rem, 5vw, 5rem)',
    lineHeight: 1.03,
    margin: 0,
    color: '#f8fafc',
    maxWidth: '12ch',
  },
  titleAccent: {
    background: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
  subtitle: {
    marginTop: '1.2rem',
    fontSize: '1.06rem',
    lineHeight: 1.7,
    color: '#cbd5e1',
    maxWidth: '58ch',
  },
  ctaRow: {
    display: 'flex',
    gap: '0.9rem',
    flexWrap: 'wrap',
    marginTop: '1.7rem',
  },
  primaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.95rem 1.25rem',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
    color: '#fff',
    fontWeight: '800',
    textDecoration: 'none',
    boxShadow: '0 16px 35px rgba(37, 99, 235, 0.25)',
  },
  videoCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.95rem 1.25rem',
    borderRadius: '14px',
    background: 'rgba(15, 23, 42, 0.45)',
    color: '#e2e8f0',
    textDecoration: 'none',
    fontWeight: '700',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    backdropFilter: 'blur(12px)',
  },
  highlightsList: {
    listStyle: 'none',
    padding: 0,
    margin: '1.5rem 0 0 0',
    display: 'grid',
    gap: '0.75rem',
  },
  highlightItem: {
    paddingLeft: '1.15rem',
    position: 'relative',
    color: '#dbe4f0',
  },
  heroVisual: {
    display: 'flex',
    justifyContent: 'center',
  },
  videoFrame: {
    position: 'relative',
    width: '100%',
    minHeight: '560px',
    borderRadius: '30px',
    background: 'linear-gradient(180deg, rgba(15,23,42,0.65), rgba(2,6,23,0.9))',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    backdropFilter: 'blur(18px)',
  },
  videoGlow: {
    position: 'absolute',
    inset: '18% 15% auto 15%',
    height: '180px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.45) 0%, rgba(16,185,129,0.22) 45%, rgba(0,0,0,0) 75%)',
    filter: 'blur(40px)',
  },
  heroLogo: {
    position: 'relative',
    width: '86%',
    maxWidth: '470px',
    objectFit: 'contain',
    zIndex: 1,
    transform: 'translateY(16px) scale(0.96)',
    opacity: 0,
    transition: 'all 900ms ease',
    filter: 'drop-shadow(0 24px 45px rgba(0,0,0,0.35))',
  },
  heroLogoMounted: {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
  },
  videoCaption: {
    position: 'absolute',
    left: '1.25rem',
    bottom: '1.25rem',
    zIndex: 2,
    padding: '0.45rem 0.75rem',
    borderRadius: '999px',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    color: '#cbd5e1',
    fontSize: '0.82rem',
    backdropFilter: 'blur(10px)',
  },
  videoBackdrop: {
    position: 'absolute',
    inset: 'auto -10% -25% auto',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'rgba(37, 99, 235, 0.14)',
    filter: 'blur(70px)',
  },
  featuresSection: {
    paddingTop: '1rem',
  },
  sectionHeader: {
    marginBottom: '1.25rem',
  },
  sectionKicker: {
    margin: 0,
    color: '#60a5fa',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontSize: '0.78rem',
  },
  sectionTitle: {
    margin: '0.35rem 0 0 0',
    fontSize: 'clamp(1.7rem, 3vw, 2.6rem)',
    color: '#f8fafc',
    maxWidth: '18ch',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  featureCard: {
    padding: '1.4rem',
    borderRadius: '22px',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.16)',
  },
  featureIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(37,99,235,0.4), rgba(16,185,129,0.25))',
    border: '1px solid rgba(96, 165, 250, 0.18)',
    marginBottom: '1rem',
  },
  featureTitle: {
    margin: 0,
    fontSize: '1.05rem',
    color: '#f8fafc',
  },
  featureDescription: {
    margin: '0.65rem 0 0 0',
    color: '#cbd5e1',
    lineHeight: 1.65,
  },
  bottomCta: {
    marginTop: '2rem',
    padding: '1.6rem',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, rgba(37,99,235,0.22), rgba(16,185,129,0.16))',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    marginTop: '2.25rem',
    backdropFilter: 'blur(14px)',
  },
  bottomTitle: {
    margin: '0.35rem 0 0 0',
    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
    color: '#f8fafc',
    maxWidth: '22ch',
  },
  bottomText: {
    margin: '0.75rem 0 0 0',
    color: '#cbd5e1',
    maxWidth: '62ch',
    lineHeight: 1.7,
  },
  primaryButtonLarge: {
    padding: '0.95rem 1.3rem',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '800',
    boxShadow: '0 16px 35px rgba(37, 99, 235, 0.22)',
    whiteSpace: 'nowrap',
  },
};
