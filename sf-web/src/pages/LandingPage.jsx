import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import heroVideo from '../assets/logo3D.mp4';

export default function LandingPage() {
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow} />
      <div style={styles.backgroundGlowAlt} />

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroText}>
            <div style={styles.badge}>
              <Sparkles size={16} />
              Organização financeira simples e elegante
            </div>

            <h1 style={styles.title}>
              Controle suas finanças com uma experiência <span style={styles.titleAccent}>moderna</span>.
            </h1>

            <p style={styles.subtitle}>
              O Schwantes Finance ajuda você a acompanhar ganhos, gastos e evolução financeira com clareza.
            </p>

            <div style={styles.ctaRow}>
              <Link
                to="/auth?mode=register"
                style={{
                  ...styles.primaryCta,
                  ...(hoveredButton === 'register' ? styles.primaryCtaHover : {}),
                }}
                onMouseEnter={() => setHoveredButton('register')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Criar conta
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/auth?mode=login"
                style={{
                  ...styles.secondaryCta,
                  ...(hoveredButton === 'login' ? styles.secondaryCtaHover : {}),
                }}
                onMouseEnter={() => setHoveredButton('login')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Fazer login
              </Link>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.videoFrame}>
              <video
                src={heroVideo}
                autoPlay
                loop
                muted
                playsInline
                controls
                style={styles.heroVideo}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    background: 'radial-gradient(circle at top, #0f1a33 0%, #050816 45%, #02040b 100%)',
    color: '#e2e8f0',
    position: 'relative',
    overflowX: 'hidden',
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
  main: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    minHeight: '100vh',
    padding: '0',
    boxSizing: 'border-box',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '0 2rem',
    boxSizing: 'border-box',
  },
  heroText: {
    padding: '1rem 0',
    maxWidth: '640px',
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
    fontSize: 'clamp(2.8rem, 5vw, 5rem)',
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
    maxWidth: '52ch',
  },
  ctaRow: {
    display: 'flex',
    gap: '0.9rem',
    flexWrap: 'wrap',
    marginTop: '1.8rem',
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
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease',
  },
  primaryCtaHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 20px 42px rgba(37, 99, 235, 0.35)',
    filter: 'brightness(1.05)',
  },
  secondaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.95rem 1.25rem',
    borderRadius: '14px',
    background: 'rgba(15, 23, 42, 0.45)',
    color: '#e2e8f0',
    textDecoration: 'none',
    fontWeight: '700',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    backdropFilter: 'blur(12px)',
    transition: 'transform 0.2s ease, background 0.2s ease, border-color 0.2s ease',
  },
  secondaryCtaHover: {
    transform: 'translateY(-2px)',
    background: 'rgba(15, 23, 42, 0.65)',
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  heroVisual: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoFrame: {
    position: 'relative',
    width: '100%',
    maxWidth: '680px',
    borderRadius: '30px',
    background: 'linear-gradient(180deg, rgba(15,23,42,0.65), rgba(2,6,23,0.9))',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backdropFilter: 'blur(18px)',
  },
  heroVideo: {
    width: '100%',
    height: '100%',
    minHeight: '520px',
    objectFit: 'cover',
    borderRadius: '22px',
    background: '#020617',
  },
};