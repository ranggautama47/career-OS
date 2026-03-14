"use client";

// src/app/login/page.tsx
// CareerOS — Login Page · Dark SaaS · Supabase Auth
import "./login.css";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("Email atau password salah. Periksa kembali.");
        } else if (authError.message === "Email not confirmed") {
          setError("Email belum diverifikasi. Cek inbox kamu.");
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-wrap">
        <div className="bg-grid" />
        <div className="bg-glow" />

        <div className="card-wrap">
          {/* Logo + heading */}
          <div className="logo-area">
            <Link href="/" className="logo-link">
              <div className="logo-box">
               <Image
                src="/careeros-logo.jpg"
                alt="CareerOS"
                width={24}
                height={24}
                style={{ objectFit: "contain" }}
                />
              </div>
              <span className="logo-name sora">
                Career<span>OS</span>
              </span>
            </Link>
            <h1 className="card-title sora">Selamat datang kembali</h1>
            <p className="card-sub">Masuk ke akun CareerOS kamu</p>
          </div>

          {/* Form */}
          <div className="form-card">
            {error && (
              <div className="error-box">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="field">
                <label htmlFor="email">Email</label>
                <div className="input-wrap" style={{ marginTop: "8px" }}>
                  <input
                    id="email"
                    type="email"
                    placeholder="kamu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <div className="field-header">
                  <label htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="forgot-link">Lupa password?</Link>
                </div>
                <div className="input-wrap">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    className="pw-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Masuk...
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">atau</span>
              <div className="divider-line" />
            </div>

            <div className="register-link">
              Belum punya akun?{" "}
              <Link href="/register">Daftar sekarang</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}