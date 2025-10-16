"use client";

import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
import { motion } from "framer-motion";
import {
  // Menggunakan ikon properti yang lebih relevan
  ShieldCheck, // Untuk verifikasi
  Calculator, // Untuk KPR/Finansial
  MapPin, // Untuk lokasi/pencarian
  MessageSquare, // Untuk komunikasi agen
} from "lucide-react";

export default function Features() {
  const t = useTranslation({ id, en });

  const PRIMARY_COLOR = "#003366"; // Biru Gelap
  const ACCENT_COLOR = "#00BFFF"; // Biru Muda

  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10" style={{ color: PRIMARY_COLOR }} />,
      title: "Listing Properti Terverifikasi",
      desc: "Semua properti di NESTAR melewati proses verifikasi ketat. Kami menjamin keakuratan data, legalitas, dan ketersediaan, memberikan Anda ketenangan dalam mencari hunian.",
    },
    {
      icon: <Calculator className="w-10 h-10" style={{ color: PRIMARY_COLOR }} />,
      title: "Simulasi KPR Akurat",
      desc: "Gunakan fitur Kalkulator KPR kami untuk menghitung estimasi cicilan bulanan, uang muka, dan total pinjaman dari berbagai bank mitra secara real-time. Rencanakan finansial dengan cerdas.",
    },
    {
      icon: <MapPin className="w-10 h-10" style={{ color: PRIMARY_COLOR }} />,
      title: "Pencarian Berbasis Lokasi Canggih",
      desc: "Temukan rumah berdasarkan lokasi, fasilitas terdekat (sekolah, stasiun, mall), dan filter spesifik (luas, tipe, harga). Cari properti idaman Anda lebih cepat dan efisien.",
    },
    {
      icon: <MessageSquare className="w-10 h-10" style={{ color: PRIMARY_COLOR }} />,
      title: "Hubungi Agen Profesional",
      desc: "Terhubung langsung dengan agen properti berlisensi atau in-house marketing kami melalui fitur chat terintegrasi. Dapatkan jawaban cepat dan jadwalkan kunjungan properti dengan mudah.",
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-12"
        >
          Keunggulan Layanan{" "}
          <span style={{ color: PRIMARY_COLOR }}>NESTAR</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              {/* Ikon kini menggunakan warna PRIMARY_COLOR */}
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}