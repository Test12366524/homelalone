"use client";
import { motion } from "framer-motion";

export default function Stats() {
  const PRIMARY_COLOR = "#003366"; // Biru Gelap
  const SECONDARY_TEXT_COLOR = "#4A5568"; // Abu-abu gelap untuk teks sekunder

  const stats = [
    { number: "10.000+", label: "Properti Terverifikasi" },
    { number: "250+", label: "Agen Profesional" },
    { number: "9 Kota Besar", label: "Jangkauan Pemasaran" },
    { number: "15 Tahun", label: "Pengalaman di Industri" },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Angka Bicara: Keandalan{" "}
            <span style={{ color: PRIMARY_COLOR }}>NESTAR</span>
          </h2>
          <p style={{ color: SECONDARY_TEXT_COLOR }} className="text-lg">
            Statistik yang mencerminkan kepercayaan pengguna dan dominasi pasar kami di properti digital.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-3xl shadow-md p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>
                {stat.number}
              </h3>
              <p style={{ color: SECONDARY_TEXT_COLOR }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}