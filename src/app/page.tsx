// src/app/page.tsx
// CareerOS — Landing Page
// Design: Dark SaaS · Deep slate · Electric indigo accent · Geometric grid

import Link from "next/link";
import Image from "next/image";

// ── Feature list ──────────────────────────────────────────────────────────
const features = [
  {
    emoji: "📋",
    label: "Job Tracker",
    desc: "Kanban board lamaran kerja dari apply sampai offer",
    accent: "#6366f1",
    glow: "rgba(99,102,241,0.15)",
  },
  {
    emoji: "✅",
    label: "Task Manager",
    desc: "Kelola tugas kuliah & project dengan deadline & prioritas",
    accent: "#22d3ee",
    glow: "rgba(34,211,238,0.15)",
  },
  {
    emoji: "🧠",
    label: "AI Smart Notes",
    desc: "Semantic search berbasis Gemini AI untuk catatan cerdas",
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.15)",
  },
];

// ── Stats ────────────────────────────────────────────────────────────────
const stats = [
  { value: "3", label: "Modul Terintegrasi" },
  { value: "AI", label: "Semantic Search" },
  { value: "∞", label: "Lamaran Tercatat" },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Google Fonts ── */}
      <style precedence="default" href="landing-page-styles">{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #080b14;
          color: #e2e8f0;
          overflow-x: hidden;
        }

        .sora { font-family: 'Sora', sans-serif; }

        /* Grid overlay */
        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
          z-index: 0;
        }

        /* Glow blobs */
        .blob-1 {
          position: fixed;
          top: -15%;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 500px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .blob-2 {
          position: fixed;
          bottom: 0;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(34,211,238,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Navbar */
        nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          max-width: 1120px;
          margin: 0 auto;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-mark {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 20px rgba(99,102,241,0.35);
          flex-shrink: 0;
        }

        .nav-brand {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #f1f5f9;
          letter-spacing: -0.02em;
        }

        .nav-brand span { color: #818cf8; }

        .nav-actions { display: flex; gap: 10px; align-items: center; }

        .btn-ghost {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost:hover { color: #f1f5f9; }

        .btn-primary {
          padding: 9px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 0 20px rgba(99,102,241,0.3);
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 28px rgba(99,102,241,0.45);
        }

        /* Hero */
        .hero {
          position: relative;
          z-index: 5;
          max-width: 1120px;
          margin: 0 auto;
          padding: 100px 48px 80px;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 14px;
          border-radius: 999px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          color: #818cf8;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 32px;
        }

        .hero-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 80px;
        }

        .hero-logo-wrap {
          position: relative;
          display: inline-flex;
        }

        .hero-logo-glow {
          position: absolute;
          inset: -12px;
          background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
          border-radius: 38px;
        }

        .hero-logo-box {
        position: relative;
        width: 180px;
        height: 180px;
        border-radius: 28px;
        overflow: hidden;
        }

        h1.hero-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(42px, 6vw, 68px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #f1f5f9;
          margin-bottom: 20px;
        }

        h1.hero-title .gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #22d3ee 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200%;
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        .hero-sub {
          font-size: 17px;
          color: #64748b;
          max-width: 480px;
          margin: 0 auto 44px;
          line-height: 1.7;
          font-weight: 400;
        }

        .hero-cta {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 60px;
        }

        .btn-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          text-decoration: none;
          transition: all 0.25s;
          box-shadow: 0 4px 24px rgba(99,102,241,0.35);
          font-family: 'DM Sans', sans-serif;
        }
        .btn-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.5);
        }

        .btn-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #94a3b8;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          text-decoration: none;
          transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-cta-secondary:hover {
          color: #f1f5f9;
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.12);
        }

        /* Stats bar */
        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 0;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          max-width: 420px;
          margin: 0 auto 80px;
          background: rgba(255,255,255,0.02);
        }

        .stat-item {
          flex: 1;
          padding: 20px 16px;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .stat-item:last-child { border-right: none; }

        .stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #818cf8;
          display: block;
        }
        .stat-label {
          font-size: 11px;
          color: #475569;
          font-weight: 500;
          margin-top: 3px;
          letter-spacing: 0.03em;
        }

        /* Features */
        .features {
          position: relative;
          z-index: 5;
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 48px 100px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 768px) {
          nav { padding: 16px 24px; }
          .hero { padding: 64px 24px 48px; }
          .features { padding: 0 24px 64px; }
          .features-grid { grid-template-columns: 1fr; }
          .nav-brand-text { display: none; }
          .stats-bar { max-width: 100%; }
        }

        .feature-card {
          padding: 28px 24px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          transition: all 0.3s;
          cursor: default;
        }

        .feature-card:hover {
          border-color: rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          transform: translateY(-3px);
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 16px;
        }

        .feature-title {
          font-family: 'Sora', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 8px;
        }

        .feature-desc {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
        }

        /* Footer */
        footer {
          position: relative;
          z-index: 5;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 24px 48px;
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-text { font-size: 13px; color: #334155; }

        .powered-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #334155;
        }

        .powered-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 6px rgba(99,102,241,0.7);
        }
      `}</style>

      {/* ── Background ── */}
      <div className="grid-bg" />
      <div className="blob-1" />
      <div className="blob-2" />

      {/* ── Navbar ── */}
      <nav>
        <Link href="/" className="nav-logo">
            <Image
                src="/careeros-logo.jpg"
                alt="CareerOS Logo"
                width={36}
                height={36}
                className="nav-logo-img"
            />

            <span className="nav-brand sora">
                Career<span>OS</span>
            </span>
        </Link>
        <div className="nav-actions">
          <Link href="/login" className="btn-ghost">Masuk</Link>
          <Link href="/register" className="btn-primary">Daftar Gratis</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-badge">
          <span>✦</span>
          AI-Powered Career Platform
        </div>

        {/* Logo */}
        <div className="hero-logo">
          <div className="hero-logo-wrap">
            <div className="hero-logo-glow" />
            <div className="hero-logo-box">
             <Image
                src="/careeros-logo.jpg"
                alt="CareerOS Logo"
                fill
                style={{ objectFit: "cover" }}
            />
            </div>
          </div>
        </div>

        <h1 className="hero-title sora">
          Satu Platform untuk
          <br />
          <span className="gradient-text">Karir & Akademik</span>
        </h1>

        <p className="hero-sub">
          CareerOS membantu kamu melacak lamaran kerja, mengelola tugas,
          dan mencatat ilmu — semuanya dalam satu dashboard yang cerdas.
        </p>

        <div className="hero-cta">
          <Link href="/register" className="btn-cta-primary">
            Mulai Sekarang — Gratis
            <span>→</span>
          </Link>
          <Link href="/login" className="btn-cta-secondary">
            Sudah punya akun? Masuk
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-value sora">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features">
        <div className="features-grid">
          {features.map((f) => (
            <div
              key={f.label}
              className="feature-card"
              style={{ "--accent": f.accent } as React.CSSProperties}
            >
              <div
                className="feature-icon"
                style={{ background: f.glow, border: `1px solid ${f.accent}22` }}
              >
                {f.emoji}
              </div>
              <div className="feature-title sora">{f.label}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <span className="footer-text">
          © 2026 CareerOS · Built for students & job seekers
        </span>
        <div className="powered-badge">
          <div className="powered-dot" />
          Gemini AI · pgvector · Supabase
        </div>
      </footer>
    </>
  );
}