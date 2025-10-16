"use client";

import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
import { motion } from "framer-motion";
import Image from "next/image";

// Warna brand properti NESTAR:
const PRIMARY_COLOR = "#003366"; // Biru Gelap

const testimonials = [
  {
    name: "Rio Nugraha",
    role: "Pembeli Rumah Pertama",
    feedback:
      "Aplikasi NESTAR benar-benar memudahkan pencarian rumah. Fitur verifikasi listing membuat saya tenang, tidak khawatir dengan masalah legalitas. Saya menemukan rumah impian saya dalam sebulan!",
    image: "/avatars/1.jpeg", // Tidak diubah sesuai permintaan
  },
  {
    name: "Maya Sari",
    role: "Investor Properti",
    feedback:
      "Simulasi KPR di NESTAR sangat akurat dan membantu saya membandingkan penawaran terbaik. Prosesnya transparan dan efisien. Sangat direkomendasikan untuk investasi properti!",
    image: "/avatars/2.jpeg", // Tidak diubah sesuai permintaan
  },
  {
    name: "Irfan Hakim",
    role: "Pemilik Properti",
    feedback:
      "Saya menitipkan properti saya untuk dijual di NESTAR. Agen mereka sangat profesional dan cepat tanggap. Iklan saya langsung mendapatkan banyak calon pembeli. Properti terjual dalam waktu singkat!",
    image: "/avatars/3.jpeg", // Tidak diubah sesuai permintaan
  },
];

export default function Testimonials() {
  const t = useTranslation({ id, en });

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6 text-center">
        {/* Title - Menggunakan warna Biru Gelap */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-12"
        >
          Kata Mereka tentang Layanan{" "}
          <span style={{ color: PRIMARY_COLOR }}>NESTAR</span>
        </motion.h2>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-lg transition text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={50}
                  height={50}
                  // Styling untuk memastikan border avatar juga sesuai jika perlu, tapi kita biarkan default agar netral
                  className="rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t.name}
                  </h3>
                  {/* Role diubah menjadi peran properti */}
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                “{t.feedback}”
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}