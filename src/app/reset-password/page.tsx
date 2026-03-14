"use client";
// src/app/reset-password/page.tsx
// Dibuka setelah user klik link dari email.
// Link dari Supabase: /reset-password#access_token=xxx&type=recovery
// Kita cek session dengan getSession() — lebih stabil dari onAuthStateChange di Next.js App Router.

import "../login/login.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true); // sedang cek session
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [ready, setReady]       = useState(false); // session valid

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ── Cek session saat halaman load ────────────────────────────────────
  // Supabase otomatis parse #access_token dari URL hash saat createBrowserClient init.
  // Kita tunggu sebentar lalu cek apakah session sudah ada.
  useEffect(() => {
    const check = async () => {
      // Beri sedikit delay agar Supabase punya waktu parse URL hash
      await new Promise((r) => setTimeout(r, 500));

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setReady(true);
      }
      setChecking(false);
    };

    // Juga listen event PASSWORD_RECOVERY sebagai backup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecking(false);
      }
    });

    check();
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Password strength ─────────────────────────────────────────────────
  const pwStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const pwScore  = pwStrength(password);
  const pwColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const pwLabels = ["", "Lemah", "Sedang", "Kuat", "Sangat Kuat"];

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8)  { setError("Password minimal 8 karakter."); return; }
    if (password !== confirm)  { setError("Password dan konfirmasi tidak cocok."); return; }
    if (pwScore < 2)           { setError("Password terlalu lemah. Tambahkan huruf besar atau angka."); return; }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) { setError(err.message); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="card-wrap">
        <div className="logo-area">
          <Link href="/" className="logo-link">
            <div className="logo-box">
              <Image src="/careeros-logo.jpg" alt="CareerOS" width={24} height={24}
                style={{ objectFit: "contain" }} />
            </div>
            <span className="logo-name sora">Career<span>OS</span></span>
          </Link>
          <h1 className="card-title sora">
            {success ? "Password Diperbarui!" : "Buat Password Baru"}
          </h1>
          <p className="card-sub">
            {success ? "Mengalihkan ke login..." : "Masukkan password baru kamu"}
          </p>
        </div>

        <div className="form-card">

          {/* ── Sedang cek session ── */}
          {checking && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "14px" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "#6366f1", animation: "bounce 1s infinite",
                    animationDelay: `${i * 0.15}s`,
                  }} />
                ))}
              </div>
              <p style={{ color: "#475569", fontSize: "14px" }}>Memvalidasi link reset...</p>
            </div>
          )}

          {/* ── Success ── */}
          {!checking && success && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>🎉</div>
              <p style={{ color: "#4ade80", fontWeight: 700, fontSize: "17px", marginBottom: "10px" }}>
                Password berhasil diperbarui!
              </p>
              <p style={{ color: "#475569", fontSize: "14px", marginBottom: "24px" }}>
                Kamu akan diarahkan ke halaman login dalam 3 detik...
              </p>
              <Link href="/login" style={{
                display: "inline-block", padding: "11px 28px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                borderRadius: "11px", color: "#fff", textDecoration: "none",
                fontWeight: 600, fontSize: "14px",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}>
                Masuk Sekarang →
              </Link>
            </div>
          )}

          {/* ── Link expired / tidak valid ── */}
          {!checking && !ready && !success && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: "44px", marginBottom: "16px" }}>🔗</div>
              <p style={{ color: "#f87171", fontWeight: 600, fontSize: "15px", marginBottom: "10px" }}>
                Link tidak valid atau sudah kadaluarsa
              </p>
              <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
                Link reset password berlaku <strong style={{ color: "#94a3b8" }}>1 jam</strong>.
                Silakan minta link baru.
              </p>
              <Link href="/forgot-password" style={{
                display: "inline-block", padding: "11px 24px",
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: "11px", color: "#818cf8", textDecoration: "none",
                fontWeight: 600, fontSize: "13px",
              }}>
                Minta Link Reset Baru →
              </Link>
            </div>
          )}

          {/* ── Form ganti password ── */}
          {!checking && ready && !success && (
            <>
              {error && (
                <div className="error-box">
                  <span>⚠</span><span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                {/* Password baru */}
                <div className="field">
                  <label htmlFor="password">Password Baru</label>
                  <div className="input-wrap">
                    <input id="password" type={showPw ? "text" : "password"} className="pw-input"
                      placeholder="Min. 8 karakter" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required autoFocus autoComplete="new-password" />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                      {showPw ? "🙈" : "👁"}
                    </button>
                  </div>
                  {password && (
                    <div className="pw-strength">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="pw-bar"
                          style={{ background: pwScore >= i ? pwColors[pwScore] : "rgba(255,255,255,0.06)" }} />
                      ))}
                      <span className="pw-label" style={{ color: pwColors[pwScore] }}>
                        {pwLabels[pwScore]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Konfirmasi */}
                <div className="field">
                  <label htmlFor="confirm">Konfirmasi Password</label>
                  <div className="input-wrap" style={{ marginTop: "8px" }}>
                    <input id="confirm" type={showPw ? "text" : "password"}
                      placeholder="Ulangi password baru" value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required autoComplete="new-password" />
                  </div>
                  {confirm && password !== confirm && (
                    <p style={{ color: "#f87171", fontSize: "12px", marginTop: "6px" }}>
                      ⚠ Password tidak cocok
                    </p>
                  )}
                  {confirm && password === confirm && confirm.length >= 8 && (
                    <p style={{ color: "#4ade80", fontSize: "12px", marginTop: "6px" }}>
                      ✓ Password cocok
                    </p>
                  )}
                </div>

                <button type="submit" className="btn-submit"
                  disabled={loading || password !== confirm || password.length < 8}>
                  {loading
                    ? <><div className="spinner" />Menyimpan...</>
                    : <>Simpan Password Baru <span>→</span></>
                  }
                </button>
              </form>
            </>
          )}

          {/* Bounce animation untuk loading dots */}
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-8px); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}