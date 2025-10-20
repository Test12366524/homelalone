"use client";

import { useState } from "react";
import {
  Home, // Icon untuk Properti
  Tag, // Icon untuk Harga/Nilai
  UserCheck, // Icon untuk Agen
  ArrowRight,
  Phone,
  MessageCircle,
  ShieldCheck, // Icon untuk WhatsApp
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // Asumsi komponen Button diimpor

// Warna NESTAR Properti
const PRIMARY_COLOR = "#003366"; // Biru Gelap
const ACCENT_COLOR = "#00BFFF"; // Biru Muda
const SECONDARY_TEXT_COLOR = "#666666"; // Abu-abu untuk teks sekunder

// Data dan Fungsi Dummy (Dipertahankan untuk struktur, tapi tidak digunakan dalam logic Titip Jual)
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

// Data Fitur Titip Jual
const sellingFeatures = [
  {
    icon: <UserCheck className="w-6 h-6" style={{ color: ACCENT_COLOR }} />,
    title: "Agen Profesional Bersertifikat",
    description: "Didukung tim agen yang berpengalaman dan mengerti pasar properti lokal.",
  },
  {
    icon: <Tag className="w-6 h-6" style={{ color: ACCENT_COLOR }} />,
    title: "Valuasi Akurat & Optimal",
    description: "Membantu menetapkan harga properti yang kompetitif dan menguntungkan.",
  },
  {
    icon: <MessageCircle className="w-6 h-6" style={{ color: ACCENT_COLOR }} />,
    title: "Pemasaran Multi-Platform",
    description: "Properti Anda dipromosikan di portal properti besar, media sosial, dan jaringan eksklusif.",
  },
  {
    icon: <Home className="w-6 h-6" style={{ color: ACCENT_COLOR }} />,
    title: "Proses Hukum & Transaksi Aman",
    description: "Pendampingan penuh dari legal hingga serah terima kunci properti.",
  },
];


export default function PropertyListingPage() {
  const [propertyType, setPropertyType] = useState("Rumah");
  const [propertyLocation, setPropertyLocation] = useState("Jakarta");
  const whatsappNumber = "6281234567890"; // Ganti dengan Nomor WA NESTAR yang sebenarnya
  const whatsappMessage = `Halo NESTAR Properti, saya tertarik untuk menitipkan jual properti jenis *${propertyType}* di area *${propertyLocation}*. Mohon informasinya lebih lanjut. Terima kasih!`;
  
  // URL WhatsApp
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#00336610]">
      {/* ===================== Header / Hero Titip Jual ===================== */}
      <section className="relative pt-24 pb-12 px-6 lg:px-12 overflow-hidden bg-white">
        <div className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-50" style={{ backgroundColor: `${ACCENT_COLOR}15` }} />
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${ACCENT_COLOR}15` }}>
            <Tag className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
              Layanan Eksklusif NESTAR
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Jual Properti Anda{" "}
            <span className="block" style={{ color: PRIMARY_COLOR }}>
              Lebih Cepat & Menguntungkan
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Percayakan penjualan properti Anda kepada NESTAR Properti. Dapatkan harga terbaik dengan proses yang aman dan transparan.
          </p>
        </div>
      </section>

      {/* ===================== Titip Jual Form & Result Panel ===================== */}
      <section className="px-6 lg:px-12 pb-12 -mt-16"> {/* -mt-16 agar panel naik sedikit */}
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CTA & Form Sederhana (Col 1 & 2) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-2xl border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Mulai Proses Titip Jual Anda
              </h3>

              <div className="space-y-6">
                {/* Input Jenis Properti */}
                <KPRInput
                  label="Jenis Properti yang Ingin Dijual"
                  icon={<Home className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />}
                  value={propertyType}
                  onChange={setPropertyType}
                  type="select"
                  options={["Rumah", "Apartemen", "Tanah", "Ruko/Kantor"]}
                />

                {/* Input Lokasi Properti */}
                <KPRInput
                  label="Lokasi Area Properti"
                  icon={<Tag className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />}
                  value={propertyLocation}
                  onChange={setPropertyLocation}
                  type="text"
                  placeholder="Contoh: Bintaro, Bandung Kota"
                />
              </div>
              
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  className="w-full mt-8 py-3 text-lg font-semibold shadow-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                    <MessageCircle className="w-5 h-5" />
                    Hubungi via WhatsApp Sekarang!
                </Button>
              </a>

              <p className="text-sm text-gray-500 mt-4 text-center">
                  Kami akan segera menghubungi Anda untuk valuasi dan strategi penjualan properti Anda.
              </p>
            </motion.div>

            {/* Benefit Titip Jual (Col 3) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 sticky top-24 h-fit"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
                Mengapa Pilih NESTAR?
              </h3>
              
              <div className="space-y-4">
                {sellingFeatures.map((feature, index) => (
                    <BenefitItem
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                    />
                ))}
              </div>
              
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================== CTA Bawah ===================== */}
      <section className="px-6 lg:px-12 pb-24 pt-8">
         <div className="container mx-auto">
            <div className="bg-white rounded-2xl p-8 lg:p-12 text-center shadow-xl border-t-4" style={{borderColor: ACCENT_COLOR}}>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Jual Properti Anti Ribet!
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                    Dapatkan pendampingan agen properti tepercaya hingga properti Anda terjual.
                </p>
                 <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button
                      className="py-4 px-8 text-xl font-bold shadow-2xl hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-3"
                      style={{ backgroundColor: ACCENT_COLOR, color: PRIMARY_COLOR }}
                    >
                      <Phone className="w-6 h-6" />
                      Konsultasi Gratis via WA
                    </Button>
                </a>
            </div>
         </div>
      </section>
    </div>
  );
}

// Komponen Input yang Diadaptasi
interface FormInputProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "select";
  placeholder?: string;
  options?: string[]; // Untuk tipe select
}

const KPRInput: React.FC<FormInputProps> = ({ label, icon, value, onChange, type = 'text', placeholder, options }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative rounded-2xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        
        {type === 'select' && options ? (
            <select
              value={value}
              onChange={(e) => handleInputChange(e)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-opacity-75"
            >
              {options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
        ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(e)}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-opacity-75"
            />
        )}
      </div>
    </div>
  );
};

// Komponen Item Benefit Titip Jual
interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl">
    <div className="flex-shrink-0 mt-1">{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

// KPRResultItem dihilangkan karena tidak relevan