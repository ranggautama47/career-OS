// src/app/terms/page.tsx
// Halaman Syarat dan Ketentuan (Terms & Conditions) Profesional
// Styled with Tailwind CSS · Dark Theme Match

import Link from "next/link";

// ── Metadata untuk SEO ──
export const metadata = {
  title: "Syarat dan Ketentuan (Terms of Service) | CareerOS",
  description: "Dokumen hukum yang mengatur penggunaan platform CareerOS, hak dan kewajiban pengguna, serta sanksi pelanggaran.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#080b14] text-[#e2e8f0] font-sans relative overflow-hidden">
      {/* ── Background Effects (Optional but Consistent) ── */}
      <div className="fixed inset-0 grid-bg opacity-10 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }} />
      <div className="fixed top-[-15%] left-[50%] transform translateX(-50%) width-[900px] height-[500px] pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)'
      }} />

      {/* ── Konten Utama ── */}
      <div className="relative z-10 max-w-4xl mx-auto p-8 md:p-12 lg:p-16">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="logo-box width-[36px] height-[36px] bg-gradient-to-br from-[#6366f1] to-[#818cf8] rounded-[10px] flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
              <span className="text-white text-lg">⚡</span>
            </div>
            <span className="nav-brand sora font-bold text-xl text-white">
              Career<span className="text-[#818cf8]">OS</span>
            </span>
          </Link>
          <span className="text-sm text-[#475569]">Terakhir Diperbarui: 15 Juli 2025</span>
        </div>

        {/* Title */}
        <h1 className="sora font-extrabold text-4xl md:text-5xl text-white leading-tight mb-4 tracking-tighter">
          Syarat dan Ketentuan Penggunaan (Terms of Service)
        </h1>
        <p className="hero-sub text-lg text-[#64748b] max-w-2xl mb-12 leading-relaxed">
          Harap baca dokumen ini dengan saksama sebelum menggunakan platform CareerOS. Dengan mengakses atau menggunakan layanan kami, kamu menyetujui seluruh ketentuan di bawah ini.
        </p>

        {/* Content Body */}
        <div className="prose prose-sm md:prose-base prose-invert max-w-none space-y-12 leading-relaxed text-[#a1a1aa]">
          
          <section>
            <h2 className="sora text-2xl font-semibold text-white mb-5 tracking-tight">1. PENGANTAR & PENERIMAAN</h2>
            <p>
              Selamat datang di CareerOS (&quot;Platform,&quot; &quot;Layanan,&quot; &quot;Kami&quot;). Platform ini adalah SaaS (Software as a Service) yang dirancang untuk mahasiswa dan pencari kerja di Indonesia untuk melacak lamaran kerja, mengelola tugas, dan mencatat ilmu menggunakan teknologi kecerdasan buatan (AI) Gemini dari Google dan didukung oleh infrastruktur Supabase.
            </p>
            <p className="font-semibold text-white/90">
              Dengan mendaftar, mengakses, atau menggunakan Layanan CareerOS, kamu (&quot;Pengguna,&quot; &quot;Kamu&quot;) menyatakan bahwa kamu telah membaca, memahami, dan menyetujui dokumen Syarat dan Ketentuan ini, serta Kebijakan Privasi kami. Jika kamu tidak menyetujui ketentuan ini, harap segera berhenti menggunakan Layanan kami.
            </p>
          </section>

          <section>
            <h2 className="sora text-2xl font-semibold text-white mb-5 tracking-tight">2. KEBANGSAAN & REGISTRASI AKUN</h2>
            <p>
              Untuk menggunakan Layanan, kamu wajib mendaftar menggunakan email aktif. Kamu menyatakan bahwa informasi yang kamu berikan adalah benar, akurat, dan lengkap. Layanan ini saat ini ditujukan terutama untuk mahasiswa dan pengguna di wilayah hukum Republik Indonesia.
            </p>
            <p>
              Kamu bertanggung jawab penuh atas keamanan kata sandi dan aktivitas yang terjadi di bawah akun kamu. Segera beri tahu kami jika ada pelanggaran keamanan atau penggunaan akun yang tidak sah. Satu Pengguna hanya diperbolehkan memiliki satu akun CareerOS yang valid.
            </p>
          </section>

          <section>
            <h2 className="sora text-2xl font-semibold text-white mb-5 tracking-tight">3. KEBBIJAKAN PENGGUNAAN (PROHIBITED USES)</h2>
            <p className="font-semibold text-white mb-4">
              Penyalahgunaan Layanan ini sangat dilarang. Pelanggaran terhadap poin ini dapat mengakibatkan tindakan hukum perdata atau pidana. Kamu setuju untuk TIDAK menggunakan Platform ini untuk:
            </p>
            <ul className="list-disc list-outside space-y-3 pl-6 border-l-2 border-[#818cf8]/20 bg-[#1e1e2e]/30 p-6 rounded-xl">
              <li>Mencoba mendapatkan akses tidak sah ke sistem kami, database, atau jaringan (melakukan hacking atau pencurian data).</li>
              <li>Menerapkan skrip otomatis, crawler, bot, atau perangkat lunak lain untuk &quot;mengikis&quot; (scraping) data Platform tanpa izin tertulis dari kami.</li>
              <li>Menyalahgunakan fitur AI Smart Notes (Gemini AI) untuk menghasilkan, menyimpan, atau menyebarkan konten yang melanggar hukum, berbahaya, pornografi, atau menyinggung SARA.</li>
              <li>Meretas, mendekompilasi, atau melakukan reverse engineering pada Platform ini, termasuk pada logika embedding berbasis Gemini AI yang kami miliki.</li>
              <li>Menggunakan data lamaran kerja (Job Applications) milik Pengguna lain yang mungkin tidak sengaja kamu akses.</li>
              <li>Membebani server kami (Serangan DoS) atau infrastruktur Supabase dengan penggunaan yang tidak wajar.</li>
              <li>Menggunakan platform untuk tujuan komersial atau selain produktivitas karir dan akademik mahasiswa.</li>
            </ul>
          </section>

          <section>
            <h2 className="sora text-2xl font-semibold text-white mb-5 tracking-tight">4. HAK KEKAYAAN INTELEKTUAL</h2>
            <p>
              Semua konten di Platform CareerOS (logo, desain, UI/UX, teks, ikon, skrip, dan logika AI yang dikustomisasi) adalah properti intelektual milik kami atau lisensi yang kami miliki, dan dilindungi oleh hukum Hak Cipta dan Kekayaan Intelektual Republik Indonesia.
            </p>
            <p className="font-semibold text-white/90 border-l-2 border-[#818cf8] pl-6 bg-[#6366f1]/5 p-6 rounded-r-xl rounded-l-none">
              Hak Cipta AI Gemini adalah milik Google LLC. Kami menggunakan Gemini API untuk memberikan Layanan. Kamu setuju bahwa kamu tidak mendapatkan hak kepemilikan apa pun atas teknologi AI kami, dan hanya berhak menggunakan Layanan sesuai ketentuan dokumen ini.
            </p>
          </section>

          <section>
            <h2 className="sora text-2xl font-semibold text-white mb-5 tracking-tight">5. PELANGGARAN & SANKSI (PENALTIES/DENDA)</h2>
            <p>
              Kami berhak, atas kebijakan kami sendiri, untuk segera menangguhkan, membatasi, atau mengakhiri akun kamu tanpa pemberitahuan sebelumnya jika kami mendeteksi adanya pelanggaran serius terhadap Syarat dan Ketentuan ini, terutama pada Bagian 3 (Kebijakan Penggunaan).
            </p>
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-2xl p-8 my-8 text-[#fca5a5]">
              <h4 className="sora font-semibold text-lg text-[#fecaca] mb-4">⚠️ Sanksi Ganti Rugi Pelanggaran Berat</h4>
              <p>
                Pelanggaran berat terhadap Kebijakan Penggunaan (termasuk namun tidak terbatas pada upaya peretasan sistem, pencurian data embedding AI Gemini, atau scraping massal database Supabase kami) akan dikenakan tindakan hukum perdata dan/atau pidana.
              </p>
              <p className="font-bold text-[#fca5a5]/90 mt-4">
                Pelanggaran serius yang mengakibatkan investigasi hukum atau biaya pemulihan sistem yang signifikan dapat dikenakan denda administratif ganti rugi mulai dari Rp [Jumlah Default: Misal 1.000.000] (satu juta Rupiah) untuk biaya pemulihan sistem per insiden, serta tuntutan ganti rugi penuh atas kerusakan sistem atau kerugian data yang ditimbulkan sesuai hukum yang berlaku di Republik Indonesia.
              </p>
            </div>
          </section>

          <section>
            <h2 className="sora text-2xl font-semibold text-white mb-5 tracking-tight">6. PEMBATASAN TANGGUNG JAWAB (LIMITATION OF LIABILITY)</h2>
            <p>
              Layanan ini disediakan &quot;APA ADANYA&quot; (AS IS). Kami tidak menjamin bahwa Layanan ini akan selalu bebas dari kesalahan, aman, atau tidak terganggu. Sebagai platform mahasiswa dalam pengembangan, kamu memahami dan menyetujui bahwa kami menggunakan layanan pihak ketiga (Google Gemini AI & Supabase), dan kami tidak bertanggung jawab atas ketidakakuratan data AI atau gangguan pada API mereka.
            </p>
            <p>
              Kami tidak bertanggung jawab atas kerugian langsung, tidak langsung, atau konsekuensial (misalnya: gagal mendapatkan pekerjaan, kehilangan data catatan) yang mungkin timbul dari penggunaan atau ketidakmampuan kamu menggunakan Platform.
            </p>
          </section>

          <section>
            <h2 className="sora text-2xl font-semibold text-white mb-5 tracking-tight">7. HUKUM YANG BERLAKU & SENGKETA</h2>
            <p>
              Dokumen Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia.
            </p>
            <p>
              Segala sengketa yang timbul dari atau terkait dengan penggunaan Layanan ini akan diupayakan untuk diselesaikan secara musyawarah untuk mufakat. Jika kesepakatan tidak tercapai, sengketa akan diselesaikan melalui pengadilan di wilayah hukum Republik Indonesia.
            </p>
          </section>

        </div>

        {/* Footer & CTA */}
        <div className="border-t border-white/5 mt-16 pt-12 text-center">
          <p className="footer-text text-sm text-[#475569] mb-8">
            © 2025 CareerOS · Syarat dan Ketentuan ini adalah dokumen MVP untuk lomba.
          </p>
          <Link href="/register" className="btn-primary inline-flex items-center gap-2 group px-7 py-3 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] font-semibold text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all">
             Setuju & Lanjut Daftar
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}