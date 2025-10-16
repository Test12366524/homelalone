"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Sparkles, User, Store, Landmark } from "lucide-react";
import Image from "next/image";

export default function TestimonialsPage() {
  const router = useRouter();

  const goToRegisterPage = () => {
    router.push("/register");
  };

  const testimonials = [
    {
      id: 1,
      name: "Budi, 45",
      role: "Anggota Koperasi",
      image: "/avatars/1.jpeg",
      content:
        "Proses pengajuan pinjaman di sini sangat mudah dan cepat. Bunga yang ditawarkan juga sangat adil. Sangat membantu saya untuk membiayai kebutuhan tak terduga.",
    },
    {
      id: 2,
      name: "Siti, 32",
      role: "Anggota & Seller",
      image: "/avatars/2.jpeg",
      content:
        "Sejak menjual produk di marketplace NESTAR, penjualan saya meningkat drastis. Ada banyak dukungan dan promosi yang membantu UMKM seperti saya.",
    },
    {
      id: 3,
      name: "Rudi, 55",
      role: "Anggota Koperasi",
      image: "/avatars/3.jpeg",
      content:
        "Saya merasa tenang menyimpan uang di sini. Layanan yang transparan dan digital membuat semuanya terasa mudah diakses, bahkan bagi saya yang sudah senior.",
    },
  ];

  return (
    <>
      <section className="px-6 lg:px-12 py-20 bg-gradient-to-b from-white to-[#6B6B6B]/10">
        <div className="container mx-auto text-center">
          {/* Heading */}
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[#6B6B6B] bg-[#6B6B6B]/20">
            <Sparkles className="w-4 h-4 text-#6B6B6B" />
            <span className="text-sm font-medium">Testimoni</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Apa Kata Para Anggota Kami?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            Dengarkan pengalaman nyata dari anggota kami yang sudah merasakan
            manfaat bergabung dengan NESTAR.
          </motion.p>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-all"
              >
                <div className="relative w-20 h-20 mb-4">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t.name}
                </h3>
                <p className="text-sm text-[#6B6B6B] mb-4">{t.role}</p>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array(5)
                    .fill(0)
                    .map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-5 h-5 text-[#6B6B6B] fill-current"
                      />
                    ))}
                </div>

                <p className="text-gray-600 leading-relaxed">{t.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Customer Stats Section */}
      <section className="px-6 lg:px-12 py-16">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h3 className="text-4xl font-bold text-[#6B6B6B] mb-2">2.5K+</h3>
            <p className="text-gray-600">Anggota Aktif</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h3 className="text-4xl font-bold text-[#6B6B6B] mb-2">98%</h3>
            <p className="text-gray-600">Tingkat Kepuasan Anggota</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h3 className="text-4xl font-bold text-[#6B6B6B] mb-2">4.9/5</h3>
            <p className="text-gray-600">Rating Rata-rata Pelayanan</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-12 py-20">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-[#6B6B6B] to-[#6B6B6B]/90 rounded-3xl p-12 text-center text-white">
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Siap Menjadi Bagian dari Kami?
            </motion.h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Gabung dengan ribuan anggota yang sudah merasakan manfaat
              keuangan dan bisnis dari NESTAR.
            </p>
            <motion.button
              onClick={goToRegisterPage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#6B6B6B] px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Daftar Jadi Anggota
            </motion.button>
          </div>
        </div>
      </section>
    </>
  );
}