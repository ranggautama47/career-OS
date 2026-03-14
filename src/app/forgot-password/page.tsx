"use client";
// src/app/forgot-password/page.tsx

import "../login/login.css";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";

const COOLDOWN_SECS = 60; // detik tunggu sebelum bisa kirim ulang

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [sent, setSent]         = useState(false);
  const [cooldown, setCooldown] = useState(0); // countdown detik
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ── Countdown timer ────────────────────────────────────────────────────
  const startCooldown = () => {
    setCooldown(COOLDOWN_SECS);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Masukkan email kamu."); return; }
    if (cooldown > 0) return; // block jika masih cooldown

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (err) {
        // Handle rate limit dari Supabase dengan pesan yang lebih ramah
        if (err.message.toLowerCase().includes("rate limit") ||
            err.message.toLowerCase().includes("too many")) {
          setError(`Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.`);
        } else {
          setError(err.message);
        }
        return;
      }

      setSent(true);
      startCooldown(); // mulai cooldown setelah berhasil kirim
    } catch {
      setError("Terjadi kesalahan koneksi. Periksa internet dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ── Kirim ulang (dari success state) ──────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) {
        if (err.message.toLowerCase().includes("rate limit") ||
            err.message.toLowerCase().includes("too many")) {
          setError("Terlalu banyak percobaan. Tunggu beberapa menit.");
        } else {
          setError(err.message);
        }
        return;
      }
      startCooldown();
    } catch {
      setError("Gagal mengirim ulang.");
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
          <h1 className="card-title sora">{sent ? "Email Terkirim!" : "Lupa Password?"}</h1>
          <p className="card-sub">
            {sent ? "Cek inbox kamu untuk link reset" : "Kami kirimkan link reset ke email kamu"}
          </p>
        </div>

        <div className="form-card">
          {/* Error box */}
          {error && (
            <div className="error-box">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          {sent ? (
            /* ── Success state ── */
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>📬</div>
              <p style={{ color: "#4ade80", fontWeight: 700, fontSize: "17px", marginBottom: "10px" }}>
                Link reset dikirim!
              </p>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "6px" }}>
                Cek inbox <strong style={{ color: "#94a3b8" }}>{email}</strong>{" "}
                dan klik link untuk reset password.
              </p>
              <p style={{ color: "#475569", fontSize: "12px", marginBottom: "8px" }}>
                Tidak ada email? Cek folder <strong>Spam / Junk</strong>.
              </p>

              {/* Kirim ulang dengan cooldown */}
              <div style={{ marginBottom: "20px" }}>
                {cooldown > 0 ? (
                  <p style={{ color: "#334155", fontSize: "12px" }}>
                    Kirim ulang tersedia dalam{" "}
                    <strong style={{ color: "#818cf8" }}>{cooldown}s</strong>
                  </p>
                ) : (
                  <button onClick={handleResend} disabled={loading}
                    style={{
                      background: "none", border: "none", color: "#818cf8",
                      fontWeight: 600, cursor: "pointer", fontSize: "13px",
                      opacity: loading ? 0.5 : 1,
                    }}>
                    {loading ? "Mengirim..." : "↺ Kirim ulang"}
                  </button>
                )}
              </div>

              <Link href="/login" style={{
                display: "inline-block", padding: "11px 28px",
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "11px", color: "#4ade80", textDecoration: "none",
                fontWeight: 600, fontSize: "14px",
              }}>
                Kembali ke Login →
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="email">Alamat Email</label>
                  <div className="input-wrap" style={{ marginTop: "8px" }}>
                    <input id="email" type="email" placeholder="kamu@email.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      required autoFocus autoComplete="email" />
                  </div>
                </div>

                {/* Tombol — disabled saat cooldown atau loading */}
                <button type="submit" className="btn-submit"
                  disabled={loading || cooldown > 0}>
                  {loading ? (
                    <><div className="spinner" />Mengirim...</>
                  ) : cooldown > 0 ? (
                    <>⏳ Tunggu {cooldown}s...</>
                  ) : (
                    <>Kirim Link Reset <span>→</span></>
                  )}
                </button>
              </form>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">atau</span>
                <div className="divider-line" />
              </div>
              <div className="register-link">
                <Link href="/login">← Kembali ke Login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}