"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function TeamSection() {
  const PRIMARY_COLOR = "#003366"; // Biru Gelap
  const SECONDARY_TEXT_COLOR = "#4A5568"; // Abu-abu gelap

  // Struktur tim disesuaikan untuk bisnis properti digital
  const team = [
    {
      name: "Ayu Pratama",
      role: "Chief Executive Officer (CEO)",
      image: "/avatars/1.jpeg",
    },
    {
      name: "Rina Cahya",
      role: "Kepala Verifikasi Properti",
      image: "/avatars/2.jpeg",
    },
    {
      name: "Nanda Putri",
      role: "Manajer Agen & Kemitraan",
      image: "/avatars/3.jpeg",
    },
    {
      name: "Dewi Lestari",
      role: "Kepala Pengembangan Teknologi",
      image: "/avatars/4.jpeg",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Tim Manajemen{" "}
            <span style={{ color: PRIMARY_COLOR }}>NESTAR</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Profesional berpengalaman di bidang properti, teknologi, dan hukum yang berdedikasi menciptakan pengalaman jual beli terbaik.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center group"
            >
              <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden shadow-lg group-hover:scale-105 transform transition duration-300">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {member.name}
              </h3>
              {/* Warna peran menggunakan PRIMARY_COLOR (Biru Gelap) */}
              <p className="font-medium" style={{ color: PRIMARY_COLOR }}>
                {member.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}