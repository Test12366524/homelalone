"use client";
import { motion } from "framer-motion";

export default function Mission() {
  const PRIMARY_COLOR = "#003366"; // Biru Gelap
  const ACCENT_COLOR = "#00BFFF"; // Biru Muda

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Visi & <span style={{ color: PRIMARY_COLOR }}>Misi</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            NESTAR hadir sebagai solusi teknologi properti terdepan,
            menciptakan pengalaman jual beli rumah yang transparan, mudah,
            dan penuh kepercayaan bagi setiap pengguna.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Visi Properti */}
          <div className="bg-white shadow-lg rounded-3xl p-6 border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Visi</h3>
            <p className="text-gray-600">
              Menjadi portal properti digital **(PropTech)** nomor satu di Indonesia yang dikenal karena keandalan data, inovasi teknologi, dan layanan yang berorientasi pada kepuasan pelanggan.
            </p>
          </div>

          {/* Misi Properti */}
          <div className="bg-white shadow-lg rounded-3xl p-6 border-l-4" style={{ borderColor: ACCENT_COLOR }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Misi</h3>
            <p className="text-gray-600">
              Menyediakan listing properti yang 100% terverifikasi legalitasnya. Mengembangkan fitur simulasi KPR dan kalkulator finansial yang akurat. Menghubungkan pembeli dengan agen properti profesional berlisensi. Mengutamakan transparansi data dan proses transaksi digital yang aman.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}