"use client";

import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
import { motion } from "framer-motion";
import Link from "next/link";
// Mengganti ikon yang relevan untuk properti
import { Search, KeyRound } from "lucide-react";

export default function CTA() {
  const t = useTranslation({ id, en });

  const PRIMARY_COLOR = "#003366"; // Biru Gelap
  const ACCENT_COLOR = "#00BFFF"; // Biru Muda

  return (
    <section className="relative bg-gray-100 py-20">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-6"
        >
          Siap Mewujudkan Hunian Impian Anda? <br />
          <span style={{ color: PRIMARY_COLOR }}>Ayo Mulai Perjalanan Anda di NESTAR</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-600 text-lg mb-8"
        >
          Baik Anda mencari rumah pertama atau ingin menjual properti Anda dengan cepat, NESTAR menyediakan platform yang terpercaya, data yang akurat, dan akses ke agen profesional.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          {/* Tombol 1: Untuk Pembeli/Pencari Properti */}
          <Link
            href="/properti-dijual"
            style={{ backgroundColor: PRIMARY_COLOR }}
            className="px-8 py-4 text-white text-lg font-semibold rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Search className="h-6 w-6" />
            Cari Rumah Impian Anda
          </Link>

          {/* Tombol 2: Untuk Penjual/Agen/Pemilik Properti */}
          <Link
            href="/jual-properti"
            style={{ 
              backgroundColor: ACCENT_COLOR, 
              color: PRIMARY_COLOR, 
              borderColor: PRIMARY_COLOR, 
              borderWidth: "1px" 
            }}
            className="px-8 py-4 text-lg font-semibold rounded-xl shadow-md hover:bg-sky-400 transition flex items-center justify-center gap-2"
          >
            <KeyRound className="h-6 w-6" />
            Titip Jual Properti
          </Link>
        </motion.div>
      </div>
    </section>
  );
}