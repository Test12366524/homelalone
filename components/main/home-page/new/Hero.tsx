"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
// Mengganti ikon yang lebih relevan untuk properti
import { HomeIcon, CalculatorIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const t = useTranslation({ id, en });

  // Warna brand properti NESTAR:
  const PRIMARY_COLOR = "#003366"; // Biru Gelap
  const ACCENT_COLOR = "#00BFFF"; // Biru Muda

  return (
    <section className="relative bg-white py-16">
      <div className="container mx-auto grid md:grid-cols-2 gap-10 items-center px-6 overflow-hidden">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            <span style={{ color: PRIMARY_COLOR }}>NESTAR:</span> <br />
            Jembatan Nyaman Menuju Hunian Impian Anda
          </h1>
          <p className="text-gray-600 text-lg">
            Jelajahi properti terverifikasi, dapatkan simulasi KPR akurat, dan
            hubungi agen profesional. <strong>NESTAR</strong> adalah portal properti digital
            yang menawarkan <strong>kepercayaan</strong> dan <strong>stabilitas</strong> dalam setiap
            transaksi.
          </p>

          <div className="flex gap-4">
            <Link
              href="/product"
              style={{ backgroundColor: PRIMARY_COLOR }}
              className="px-6 py-3 text-white font-medium rounded-xl shadow-md hover:opacity-90 transition flex items-center gap-x-1.5"
            >
              <HomeIcon className="size-5" />
              Cari Properti Dijual
            </Link>
            <Link
              href="/kpr-simulation"
              style={{
                backgroundColor: ACCENT_COLOR,
                color: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
                borderWidth: "1px",
              }}
              className="px-6 py-3 font-medium rounded-xl shadow-md hover:bg-sky-400 transition flex items-center gap-x-1.5"
            >
              <CalculatorIcon className="size-5" />
              Simulasi KPR
            </Link>
          </div>
          {/* Tambahan: Aksen untuk kepercayaan dan lokasi */}
          <div className="flex items-center text-sm text-gray-500 pt-2">
            <MapPinIcon className="size-4 mr-2" />
            Ribuan listing terverifikasi di seluruh Indonesia.
          </div>
        </motion.div>

        {/* Image Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          {/* Anda perlu mengganti sumber gambar ke ilustrasi rumah/apartemen yang relevan */}
          <Image
            src="/nestar-hero.webp" // Ganti dengan path gambar properti Anda
            alt="NESTAR Properti Digital"
            width={500}
            height={500}
            className="rounded-2xl shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}