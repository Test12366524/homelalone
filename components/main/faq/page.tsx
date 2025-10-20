"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Home, // Diubah dari Sparkles
  ChevronRight,
  ShieldCheck, // Icon baru untuk Kepercayaan
  Phone, // Icon baru untuk Kontak
} from "lucide-react";
// Asumsi FaqItems tetap digunakan untuk menampilkan list FAQ di bawah judul grup
import FaqItems from "./faq-items"; 

// Warna NESTAR Properti
const PRIMARY_COLOR = "#003366"; // Biru Gelap
const ACCENT_COLOR = "#00BFFF"; // Biru Muda

const FaqPage = () => {
  const [groupsActive, setGroupsActive] = useState<Array<number>>([]);

  const groupedFaqs: {
    name: string;
    items: { question: string; answer: string }[];
  }[] = [
    {
      name: "Layanan Jual Beli Properti",
      items: [
        {
          question: "Apa saja jenis properti yang dilayani NESTAR?",
          answer:
            "NESTAR melayani penjualan, pembelian, dan penyewaan berbagai jenis properti, mulai dari rumah tinggal, apartemen, tanah, ruko, hingga properti komersial besar di area Jabodetabek dan kota besar lainnya.",
        },
        {
          question: "Bagaimana proses Titip Jual properti di NESTAR?",
          answer:
            "Prosesnya mudah: 1. Konsultasi dan Valuasi Gratis. 2. Penandatanganan Perjanjian Jual. 3. Pemasaran Intensif oleh Agen. 4. Negosiasi dan Proses Legal. 5. Transaksi Aman hingga Serah Terima Kunci.",
        },
        {
          question: "Apakah NESTAR menjamin harga properti yang optimal?",
          answer:
            "Ya, kami menggunakan data pasar terbaru dan analisis valuasi profesional untuk memastikan properti Anda dijual dengan harga yang optimal dan kompetitif, menarik pembeli yang tepat.",
        },
        {
          question: "Berapa lama waktu rata-rata properti terjual?",
          answer:
            "Waktu penjualan sangat bervariasi tergantung lokasi, harga, dan jenis properti. Namun, strategi pemasaran NESTAR dirancang untuk mencapai closing secepat mungkin, biasanya dalam 1-3 bulan untuk properti dengan harga pasar yang wajar.",
        },
      ],
    },
    {
      name: "Legalitas & Keamanan",
      items: [
        {
          question: "Bagaimana NESTAR memastikan legalitas transaksi?",
          answer:
            "Setiap transaksi didampingi oleh tim legal yang berpengalaman. Kami memastikan semua dokumen (SHM/SHGB, IMB, PBB) lengkap dan sah, serta menjamin proses Akta Jual Beli (AJB) di Notaris/PPAT terpercaya.",
        },
        {
          question: "Apakah data klien dijamin kerahasiaannya?",
          answer:
            "Prioritas utama kami adalah kerahasiaan data klien. Semua informasi properti dan pribadi dijaga ketat sesuai standar privasi dan hukum yang berlaku.",
        },
        {
          question: "Apa yang membedakan Agen NESTAR dengan yang lain?",
          answer:
            "Agen NESTAR adalah profesional bersertifikat, terikat kode etik, dan memiliki akses penuh ke jaringan pembeli/penjual eksklusif serta sistem pemasaran multi-platform NESTAR.",
        },
      ],
    },
    {
      name: "Simulasi KPR & Pembayaran",
      items: [
        {
          question: "Apakah NESTAR membantu proses pengajuan KPR?",
          answer:
            "Tentu! Kami menyediakan simulasi KPR akurat dan membantu Anda menghubungkan dengan bank-bank mitra terbaik untuk mendapatkan suku bunga KPR yang paling kompetitif dan proses pengajuan yang cepat.",
        },
        {
          question: "Bagaimana cara kerja Kalkulator KPR di website NESTAR?",
          answer:
            "Kalkulator kami menggunakan rumus anuitas standar untuk mengestimasi cicilan bulanan berdasarkan Harga Properti, Uang Muka, Suku Bunga Tahunan, dan Tenor yang Anda masukkan. (Catatan: Ini hanyalah estimasi awal).",
        },
        {
          question: "Apa saja biaya tambahan yang perlu disiapkan pembeli?",
          answer:
            "Selain harga properti, pembeli perlu menyiapkan dana untuk Uang Muka (DP), biaya KPR (provisi, administrasi, asuransi), BPHTB (Pajak Pembeli), dan biaya Notaris/PPAT.",
        },
      ],
    },
    {
      name: "Kontak & Layanan Pelanggan",
      items: [
        {
          question: "Bagaimana cara menghubungi Customer Service NESTAR?",
          answer:
            "Anda dapat menghubungi kami melalui Telepon/WhatsApp di +62 812-XXXX-XXXX, atau melalui email di info@nestarproperti.com pada jam kerja (Senin-Jumat, 09.00-17.00 WIB).",
        },
        {
          question: "Apakah bisa membuat janji temu atau konsultasi langsung?",
          answer:
            "Ya, Anda dapat menjadwalkan janji temu dengan agen kami di kantor pusat atau kantor cabang terdekat. Silakan hubungi kami untuk konfirmasi waktu dan lokasi.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Header Section */}
      <section className="pt-24 pb-6 px-6 lg:px-12">
        <div className="container mx-auto text-center">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: `${ACCENT_COLOR}15` }} // Aksen Biru Muda Transparan
          >
            <Home className="w-4 h-4" style={{ color: PRIMARY_COLOR }} /> {/* Icon Home dengan Biru Gelap */}
            <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
              PUSAT BANTUAN
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-[#333333] mb-6">
            Ada Pertanyaan Seputar{" "}
            <span style={{ color: PRIMARY_COLOR }}>Properti?</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Temukan jawaban cepat mengenai layanan Jual-Beli, KPR, dan keamanan
            transaksi bersama{" "}
            <span style={{ color: PRIMARY_COLOR }} className="font-semibold">NESTAR Properti</span>.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="pt-4 pb-24 px-6 lg:px-12">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-3">
            {groupedFaqs.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "border-b border-gray-200 py-3 transition-all",
                  "hover:bg-gray-50 rounded-xl px-3"
                )}
              >
                <button
                  onClick={() => {
                    setGroupsActive((state) =>
                      state.includes(index)
                        ? state.filter((x) => x !== index)
                        : [...state, index]
                    );
                  }}
                  className="w-full flex items-center gap-x-2 text-left"
                >
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      { "rotate-90": groupsActive.includes(index) }
                    )}
                    style={{ color: PRIMARY_COLOR }} // Icon panah dengan Biru Gelap
                    strokeWidth={2.3}
                  />
                  <span className="text-lg font-medium text-[#333333]">
                    {item.name}
                  </span>
                </button>
                {groupsActive.includes(index) && (
                  <div className="mt-3 text-gray-600">
                    <FaqItems faqs={item.items} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Kontak Tambahan */}
       <section className="pb-16 px-6 lg:px-12">
        <div className="container mx-auto max-w-3xl">
            <div className="p-6 text-center rounded-2xl border-2" style={{ borderColor: ACCENT_COLOR }}>
                <ShieldCheck className="w-8 h-8 mx-auto mb-3" style={{ color: PRIMARY_COLOR }} />
                <h4 className="text-xl font-bold mb-3" style={{ color: PRIMARY_COLOR }}>Masih Belum Menemukan Jawaban?</h4>
                <p className="text-gray-600 mb-4">Tim konsultan properti kami siap membantu Anda secara personal.</p>
                <button
                    onClick={() => alert("Simulasi navigasi ke halaman kontak atau pop-up chat")}
                    className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-full font-semibold shadow-md hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: ACCENT_COLOR, color: PRIMARY_COLOR, margin: 'auto' }}
                >
                    <Phone className="w-5 h-5" />
                    Hubungi NESTAR
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;