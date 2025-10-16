"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Map, Smartphone, Award } from "lucide-react";

export default function BrandStory() {
  const PRIMARY_COLOR = "#003366"; // Biru Gelap
  const ACCENT_COLOR = "#00BFFF"; // Biru Muda

  // Sejarah disesuaikan untuk bisnis properti digital
  const story = [
    {
      year: "2010",
      title: "Pendirian Agensi Properti",
      desc: "NESTAR awalnya didirikan sebagai agensi properti konvensional dengan fokus pada layanan klien premium, membangun fondasi kepercayaan di pasar.",
      icon: <Award className="w-6 h-6 text-white" />,
    },
    {
      year: "2018",
      title: "Transformasi Digital (PropTech)",
      desc: "Kami meluncurkan platform digital awal, beralih dari model konvensional menjadi PropTech, dengan fokus pada listing online dan fitur tur virtual.",
      icon: <Smartphone className="w-6 h-6 text-white" />,
    },
    {
      year: "2023",
      title: "Fitur Verifikasi & KPR Terintegrasi",
      desc: "Peluncuran aplikasi e-commerce NESTAR dengan fitur unggulan verifikasi legalitas properti 100% dan integrasi simulasi KPR dengan bank-bank besar.",
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
    },
    {
      year: "2025",
      title: "Ekspansi Nasional",
      desc: "Berhasil memperluas jangkauan layanan dan listing ke sembilan kota besar di Indonesia, didukung oleh jaringan agen profesional yang kuat.",
      icon: <Map className="w-6 h-6 text-white" />,
    },
  ];

  return (
    <section 
      className="py-20" 
      // Mengubah gradien latar belakang ke warna biru
      style={{ backgroundImage: `linear-gradient(to right, ${PRIMARY_COLOR}05, ${ACCENT_COLOR}05)` }}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Tonggak Sejarah{" "}
            <span style={{ color: PRIMARY_COLOR }}>NESTAR</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Perjalanan kami dalam membangun ekosistem properti digital yang
            terpercaya dan inovatif di Indonesia.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line - Menggunakan warna Biru Gelap */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full" style={{ backgroundColor: `${PRIMARY_COLOR}30` }} />

          <div className="space-y-12">
            {story.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`flex flex-col lg:flex-row items-center ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  index % 2 === 0 ? "lg:pr-12" : "lg:pl-12"
                }`}>
                  {/* Warna Tahun dan Judul menggunakan warna Biru Gelap */}
                  <div className="text-2xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>
                    {item.year}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>

                {/* Timeline Dot - Menggunakan warna Biru Gelap */}
                <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg mx-8" style={{ backgroundColor: PRIMARY_COLOR }}>
                  {item.icon}
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}