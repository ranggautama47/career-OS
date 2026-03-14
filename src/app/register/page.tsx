"use client";
// src/app/register/page.tsx
// Flow: Register → Supabase kirim OTP → Input OTP → verifyOtp() → Dashboard

import "./register.css";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type Step = "register" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>("register");
  const [form, setForm]           = useState({ name: "", email: "", password: "" });
  const [otp, setOtp]             = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent]       = useState(false);
  const [error, setError]         = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ── Password strength ────────────────────────────────────────────────────
  const pwStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const pwScore  = pwStrength(form.password);
  const pwColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const pwLabels = ["", "Lemah", "Sedang", "Kuat", "Sangat Kuat"];

  // ── Step 1: Register → Supabase generate + kirim OTP ────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password minimal 8 karakter."); return; }
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name },
          // Tidak perlu set emailRedirectTo untuk OTP flow
        },
      });

      if (err) {
        // Handle error umum
        if (err.message.toLowerCase().includes("already registered") ||
            err.message.toLowerCase().includes("already exists")) {
          setError("Email sudah terdaftar. Silakan login atau gunakan email lain.");
        } else {
          setError(err.message);
        }
        return;
      }

      if (data.user && !data.session) {
        // Session null = Supabase menunggu verifikasi OTP → pindah ke step 2
        setStep("otp");
      } else if (data.session) {
        // Confirm email dimatikan di Supabase → langsung masuk
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan koneksi. Periksa internet dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verifikasi OTP ───────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.trim().length < 6) { setError("Masukkan kode 6 digit dari email kamu."); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: form.email,
        token: otp.trim(),
        type: "signup",
      });

      if (err) {
        if (err.message.toLowerCase().includes("expired")) {
          setError("Kode sudah kadaluarsa. Klik 'Kirim Ulang' untuk mendapat kode baru.");
        } else if (err.message.toLowerCase().includes("invalid")) {
          setError("Kode salah. Cek kembali email kamu, pastikan 6 digit benar.");
        } else {
          setError(err.message);
        }
        return;
      }

      // OTP benar → session dibuat → masuk dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.resend({
        type: "signup",
        email: form.email,
      });
      if (err) { setError(err.message); return; }
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
      setError("Gagal mengirim ulang. Coba lagi.");
    } finally {
      setResending(false);
    }
  };

  const upd = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }));

  return (
    <div className="page-wrap">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="card-wrap">
        {/* Logo + heading */}
        <div className="logo-area">
          <Link href="/" className="logo-link">
            <div className="logo-box">
              <Image src="/careeros-logo.jpg" alt="CareerOS" width={24} height={24}
                style={{ objectFit: "contain" }} />
            </div>
            <span className="logo-name sora">Career<span>OS</span></span>
          </Link>

          {step === "register" ? (
            <>
              <h1 className="card-title sora">Buat akun gratis</h1>
              <p className="card-sub">Mulai kelola karir kamu hari ini</p>
            </>
          ) : (
            <>
              <h1 className="card-title sora">Verifikasi Email</h1>
              <p className="card-sub">
                Kode dikirim ke{" "}
                <strong style={{ color: "#94a3b8" }}>{form.email}</strong>
              </p>
            </>
          )}
        </div>

        <div className="form-card">
          {/* Error box */}
          {error && (
            <div className="error-box">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: Register form ── */}
          {step === "register" && (
            <form onSubmit={handleRegister}>
              <div className="field">
                <label htmlFor="name">Nama Lengkap</label>
                <input id="name" type="text" placeholder="Nama kamu"
                  value={form.name} onChange={upd("name")} required autoFocus />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="kamu@email.com"
                  value={form.email} onChange={upd("email")} required autoComplete="email" />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <input id="password" type={showPw ? "text" : "password"} className="pw-input"
                    placeholder="Min. 8 karakter" value={form.password}
                    onChange={upd("password")} required minLength={8} />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password && (
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

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading
                  ? <><div className="spinner" />Membuat akun...</>
                  : <>Buat Akun & Kirim Kode <span>→</span></>
                }
              </button>

              <p className="terms-note">
                Dengan mendaftar, kamu setuju dengan{" "}
                <a href="/terms">Syarat & Ketentuan</a> CareerOS.
              </p>
            </form>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              {/* Info banner */}
              <div style={{
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "20px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "18px", flexShrink: 0 }}>📬</span>
                <div>
                  <p style={{ color: "#a5b4fc", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                    Cek email kamu!
                  </p>
                  <p style={{ color: "#64748b", fontSize: "12px", lineHeight: "1.5" }}>
                    Kode 6 digit dikirim ke{" "}
                    <strong style={{ color: "#94a3b8" }}>{form.email}</strong>.{" "}
                    Kode berlaku <strong style={{ color: "#94a3b8" }}>10 menit</strong>.
                  </p>
                </div>
              </div>

              {/* OTP input */}
              <div className="field">
                <label htmlFor="otp">Kode Verifikasi</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="_ _ _ _ _ _ _ _"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  style={{
                    textAlign: "center",
                    fontSize: "28px",
                    letterSpacing: "0.35em",
                    fontWeight: 700,
                    marginTop: "8px",
                  }}
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading || otp.length < 6}>
                {loading
                  ? <><div className="spinner" />Memverifikasi...</>
                  : <>✓ Verifikasi & Masuk</>
                }
              </button>

              {/* Resend + ganti email */}
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                {resent ? (
                  <p style={{ color: "#4ade80", fontSize: "13px" }}>✓ Kode baru sudah dikirim!</p>
                ) : (
                  <p style={{ color: "#475569", fontSize: "13px" }}>
                    Tidak terima kode?{" "}
                    <button type="button" onClick={handleResend} disabled={resending}
                      style={{
                        background: "none", border: "none", color: "#818cf8",
                        fontWeight: 600, cursor: "pointer", fontSize: "13px",
                        opacity: resending ? 0.5 : 1,
                      }}>
                      {resending ? "Mengirim..." : "Kirim Ulang"}
                    </button>
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => { setStep("register"); setError(""); setOtp(""); }}
                  style={{
                    background: "none", border: "none", color: "#475569",
                    fontSize: "12px", cursor: "pointer", marginTop: "10px",
                    display: "block", margin: "10px auto 0",
                  }}>
                  ← Ganti email / kembali
                </button>
              </div>
            </form>
          )}

          {/* Divider + link ke login (hanya di step register) */}
          {step === "register" && (
            <>
              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">atau</span>
                <div className="divider-line" />
              </div>
              <div className="register-link">
                Sudah punya akun? <Link href="/login">Masuk sekarang</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}