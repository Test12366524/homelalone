"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Home, // Mengganti Heart/Shield/Award menjadi ikon properti/kepercayaan
  Briefcase, // Untuk agen/profesional
  CheckCircle, // Untuk verifikasi
  ArrowRight,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const goToFaqPage = () => {
    router.push("/faq");
  };

  const PRIMARY_COLOR = "#003366"; // Biru Gelap
  const ACCENT_COLOR = "#00BFFF"; // Biru Muda

  // Konten FAQ Properti
  const faqs = [
    {
      question: "Bagaimana NESTAR memverifikasi properti?",
      answer:
        "Tim profesional NESTAR melakukan audit legalitas dokumen (SHM/HGB) dan survei fisik untuk memastikan setiap listing akurat, sah, dan siap dijual.",
    },
    {
      question: "Apakah saya bisa mengajukan KPR lewat aplikasi?",
      answer:
        "Ya, Anda dapat menggunakan fitur Simulasi KPR dan mengajukan permohonan awal ke bank mitra kami langsung dari aplikasi. Kami akan membantu prosesnya.",
    },
  ];

  // Link Properti
  const quickLinks = [
    { name: "Cari Rumah Dijual", href: "/properti-dijual" },
    { name: "Simulasi KPR", href: "/kpr-simulator" },
    { name: "Titip Jual Properti", href: "/jual-properti" },
    { name: "Tentang Kami", href: "/about" },
    { name: "Pusat Bantuan", href: "/faq" },
    { name: "Login Agen", href: "/auth/login-agent" },
  ];

  return (
    <footer className="bg-gray-50 text-gray-700 relative overflow-hidden border-t">
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="pt-16 pb-8 px-6 lg:px-12">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              {/* Company Info */}
              <div className="lg:col-span-2">
                {/* Logo dan Judul Brand Properti */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Ganti gambar logo ke versi properti (asumsi logo properti memiliki warna biru) */}
                  <Image
                    src="/nestar.webp" // Ganti dengan path logo properti biru Anda
                    alt="NESTAR Properti"
                    width={75}
                    height={75}
                    className="flex-shrink-0 object-contain"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      NESTAR Properti
                    </h2>
                    <p className="text-sm text-gray-600">
                      Jembatan Nyaman Menuju Hunian Impian Anda
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Portal properti digital yang menjamin **kepercayaan** dan
                  **stabilitas** dalam setiap transaksi jual beli rumah. Kami
                  hadir untuk menemukan aset terbaik Anda.
                </p>

                {/* Values Properti */}
                <div className="space-y-3 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                    <span>Listing Terverifikasi 100%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                    <span>Agen Profesional Tersertifikasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                    <span>Fokus pada Kualitas Hunian</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4.5 h-4.5" style={{ color: PRIMARY_COLOR }} />
                    <span>
                      Gedung NESTAR Properti, Jl. Properti Digital No. 88, Jakarta Selatan 12790
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                    <span>+62 811 1234 5678 (Hotline Properti)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                    <span>info@nestarproperti.com</span>
                  </div>
                </div>
              </div>

              {/* Quick Links Properti */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-gray-800">
                  Akses Cepat
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-gray-600 hover:text-[#E53935] transition-colors flex items-center group"
                      >
                        <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: PRIMARY_COLOR }} />
                        <span className="group-hover:translate-x-1 transition-transform">
                          {link.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQ Properti */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-gray-800">
                  FAQ Properti
                </h4>
                <div className="space-y-4 mb-4">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                    >
                      <button
                        className="w-full flex justify-between items-center text-left p-4 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() =>
                          setActiveIndex(activeIndex === i ? null : i)
                        }
                      >
                        <span className="font-medium text-sm pr-2">
                          {faq.question}
                        </span>
                        <div className="flex-shrink-0">
                          {activeIndex === i ? (
                            <ChevronUp className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                          ) : (
                            <ChevronDown className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                          )}
                        </div>
                      </button>
                      {activeIndex === i && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={goToFaqPage}
                    type="button"
                    // Tombol CTA FAQ menggunakan warna Biru Gelap
                    style={{ backgroundColor: PRIMARY_COLOR }}
                    className="w-full text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                  >
                    Butuh Informasi Lebih Lanjut?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Bottom Bar */}
        <div className="border-t border-gray-200 bg-gray-100">
          <div className="container mx-auto px-6 lg:px-12 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <p>
                © {new Date().getFullYear()} NESTAR Properti. Hak cipta
                dilindungi.
              </p>

              {/* Social Media - Warna hover dipertahankan agar ikon media sosial tetap dikenali */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <p className="text-gray-600 text-sm">Ikuti kami:</p>
                <div className="flex gap-4">
                  <a
                    className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-pink-500 hover:text-white"
                    href="https://www.instagram.com/nestarproperti"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram size={18} />
                  </a>
                  <a
                    className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white"
                    href="https://www.facebook.com/nestarproperti"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebookF size={18} />
                  </a>
                  <a
                    className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-green-500 hover:text-white"
                    href="https://wa.me/6281112345678"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaWhatsapp size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}