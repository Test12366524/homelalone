"use client";
import { motion } from "framer-motion";
import { Handshake, Laptop, Store } from "lucide-react";

const story = [
  {
    year: "2008",
    title: "Pendirian Koperasi",
    desc: "Koperasi Merah Putih didirikan dengan tujuan utama untuk meningkatkan kesejahteraan ekonomi anggota melalui semangat gotong royong dan kemandirian.",
    icon: <Handshake className="w-6 h-6 text-white" />,
  },
  {
    year: "2015",
    title: "Inovasi Digital",
    desc: "Kami meluncurkan sistem simpan pinjam berbasis digital untuk mempermudah anggota dalam bertransaksi, menjadikan layanan lebih cepat dan transparan.",
    icon: <Laptop className="w-6 h-6 text-white" />,
  },
  {
    year: "2023",
    title: "Ekspansi Marketplace",
    desc: "Koperasi meluncurkan platform marketplace khusus untuk produk UMKM anggota, membuka akses pasar lebih luas dan meningkatkan pendapatan anggota.",
    icon: <Store className="w-6 h-6 text-white" />,
  },
];

export default function BrandStory() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#6B6B6B]/5 to-[#E53935]/5">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#6B6B6B] mb-4">
            Perjalanan{" "}
            <span className="text-[#E53935]">Koperasi Merah Putih</span>
          </h2>
          <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
            Dari awal berdiri hingga kini, kami terus konsisten menghadirkan
            inovasi untuk kemandirian finansial dan kesejahteraan anggota.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[#6B6B6B]/20" />

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
                  <div className="text-[#E53935] text-2xl font-bold mb-2">
                    {item.year}
                  </div>
                  <h3 className="text-xl font-bold text-[#6B6B6B] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[#6B6B6B]/80">{item.desc}</p>
                </div>

                {/* Timeline Dot */}
                <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-full bg-[#E53935] text-white shadow-lg mx-8">
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