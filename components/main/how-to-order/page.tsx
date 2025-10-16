"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart,
  CreditCard,
  User,
  Package,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Truck,
  HeadphonesIcon,
  Mail,
  MessageCircle,
  Star,
  Play,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowLeft,
  Store, // New icon for marketplace
  Landmark, // New icon for savings & loans
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Step {
  id: number;
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  image: string;
  tips?: string[];
}
interface FAQ {
  question: string;
  answer: string;
}

export default function HowToOrderPage() {
  const router = useRouter();

  const goToMarketplacePage = () => {
    router.push("/marketplace");
  };

  const [activeStep, setActiveStep] = useState(1);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // === THEME (urut ke-2: #F6CCD0), selang-seling dgn putih ===
  const THEME = {
    primary: "#6B6B6B", // warna halaman ini
    bubbleA: "#DFF19D",
    bubbleB: "#BFF0F5",
  };

  const orderSteps: Step[] = [
    {
      id: 1,
      title: "Pilih Produk atau Layanan",
      description:
        "Jelajahi marketplace kami untuk produk UMKM atau pilih layanan simpan pinjam yang Anda butuhkan.",
      details: [
        "Jelajahi kategori produk UMKM (Makanan, Kerajinan, dll.)",
        "Pilih produk atau layanan simpan pinjam yang Anda butuhkan",
        "Baca detail produk, manfaat, dan review dari anggota lain",
        "Untuk layanan pinjaman, cek syarat dan ketentuannya",
      ],
      icon: <ShoppingCart className="w-8 h-8" />,
      image: "/images/new/order-steps/step-1.png",
      tips: [
        "Gunakan fitur pencarian untuk menemukan produk favorit Anda",
        "Cek rating dan ulasan dari anggota lain sebelum membeli",
        "Untuk pinjaman, pastikan Anda telah melengkapi semua dokumen",
      ],
    },
    {
      id: 2,
      title: "Masukkan ke Keranjang",
      description:
        "Tambahkan produk ke keranjang belanja Anda atau lengkapi formulir pengajuan layanan.",
      details: [
        "Klik ikon keranjang untuk melihat daftar produk",
        "Ubah jumlah produk yang akan dibeli jika diperlukan",
        "Untuk layanan, klik 'Ajukan' dan lengkapi formulir",
        "Klik 'Checkout' untuk melanjutkan",
      ],
      icon: <Package className="w-8 h-8" />,
      image: "/images/new/order-steps/step-2.png",
      tips: [
        "Pastikan Anda sudah login sebagai anggota untuk bertransaksi",
        "Jika ada kode voucher, masukkan di halaman keranjang",
        "Periksa kembali data diri di formulir pengajuan layanan",
      ],
    },
    {
      id: 3,
      title: "Isi Data Diri & Pengiriman",
      description:
        "Lengkapi informasi pengiriman produk atau detail pengajuan layanan.",
      details: [
        "Isi nama lengkap dan nomor WhatsApp aktif",
        "Masukkan alamat lengkap untuk pengiriman produk",
        "Untuk pengajuan, pastikan semua data diri terisi dengan benar",
        "Tambahkan catatan khusus untuk penjual jika diperlukan",
      ],
      icon: <User className="w-8 h-8" />,
      image: "/images/new/order-steps/step-3.png",
      tips: [
        "Pastikan nomor WhatsApp aktif untuk konfirmasi cepat",
        "Alamat pengiriman harus jelas dan lengkap",
        "Data pengajuan Anda akan dijaga kerahasiaannya",
      ],
    },
    {
      id: 4,
      title: "Konfirmasi Pembayaran",
      description:
        "Lakukan pembayaran sesuai instruksi untuk menyelesaikan transaksi atau pengajuan.",
      details: [
        "Pilih metode: Transfer Bank atau E-Wallet",
        "Ikuti instruksi pembayaran yang tertera",
        "Sistem kami akan memverifikasi pembayaran Anda",
        "Konfirmasi pembayaran dikirim via WhatsApp/Email",
      ],
      icon: <CreditCard className="w-8 h-8" />,
      image: "/images/new/order-steps/step-4.png",
      tips: [
        "Transfer ke rekening koperasi yang tertera di invoice",
        "Simpan bukti pembayaran untuk berjaga-jaga",
        "Konfirmasi biasanya memakan waktu beberapa menit",
      ],
    },
    {
      id: 5,
      title: "Pesanan atau Pengajuan Diproses",
      description:
        "Pesanan produk segera diproses oleh seller, dan pengajuan layanan akan diverifikasi oleh tim koperasi.",
      details: [
        "Pesanan produk akan diproses oleh seller UMKM dalam 1-2 hari kerja",
        "Untuk pengajuan, tim kami akan segera menghubungi Anda",
        "Update status akan dikirim via WhatsApp/Email",
        "Estimasi pengiriman produk 2-5 hari kerja",
      ],
      icon: <CheckCircle className="w-8 h-8" />,
      image: "/images/new/order-steps/step-5.png",
      tips: [
        "Simpan nomor pesanan untuk tracking",
        "Cek update status di WhatsApp/Email",
        "Hubungi customer service jika ada kendala",
      ],
    },
    {
      id: 6,
      title: "Status Pesanan / Pengajuan",
      description:
        "Pantau status pesanan produk atau konfirmasi pengajuan layanan Anda.",
      details: [
        "Login ke akun Anda di aplikasi internal",
        "Buka menu 'Pesanan Saya' untuk produk",
        "Lihat status pengajuan layanan di menu 'Pinjaman' atau 'Layanan'",
        "Berikan review dan nikmati manfaat SHU tahunan",
      ],
      icon: <Truck className="w-8 h-8" />,
      image: "/images/new/order-steps/step-6.png",
      tips: [
        "Gunakan nomor resi untuk tracking pengiriman",
        "Beri ulasan untuk produk yang Anda beli",
        "Status akan update otomatis saat ada perubahan",
      ],
    },
  ];

  const faqs: FAQ[] = [
    {
      question: "Apakah saya harus menjadi anggota untuk membeli di marketplace?",
      answer:
        "Ya, marketplace kami adalah platform khusus untuk anggota. Dengan menjadi anggota, Anda tidak hanya bisa membeli, tetapi juga bisa mendapatkan Sisa Hasil Usaha (SHU) tahunan.",
    },
    {
      question: "Bagaimana cara mengajukan pinjaman?",
      answer:
        "Anda bisa mengajukan pinjaman langsung melalui aplikasi internal atau website ini. Lengkapi data diri, unggah dokumen yang diperlukan, dan tim kami akan segera memprosesnya.",
    },
    {
      question: "Metode pembayaran apa saja yang tersedia?",
      answer:
        "Saat ini kami menerima pembayaran melalui Transfer Bank dan E-Wallet. Semua transaksi akan diarahkan ke rekening resmi NESTAR.",
    },
    {
      question: "Berapa lama proses persetujuan pinjaman?",
      answer:
        "Proses persetujuan pinjaman bervariasi tergantung kelengkapan dokumen dan besarnya pinjaman. Namun, tim kami akan berusaha memprosesnya secepat mungkin, biasanya dalam 1-3 hari kerja.",
    },
    {
      question: "Bagaimana jika ada kendala atau pertanyaan?",
      answer:
        "Anda bisa menghubungi tim Customer Service kami melalui WhatsApp atau email yang tertera di halaman ini. Kami siap membantu Anda.",
    },
    {
      question: "Apa keuntungan menjadi seller di marketplace ini?",
      answer:
        "Sebagai seller anggota, Anda akan mendapatkan jangkauan pasar yang luas, dukungan dari komunitas, dan tentunya Sisa Hasil Usaha (SHU) dari transaksi penjualan Anda.",
    },
  ];

  const paymentMethods = [
    {
      name: "Transfer Bank",
      icon: "🏦",
      description: "Ke Rekening Koperasi",
    },
    {
      name: "E-Wallet",
      icon: "📱",
      description: "GoPay, OVO, DANA",
    },
    {
      name: "Virtual Account",
      icon: "💳",
      description: "VA Bank Anggota",
    },
    {
      name: "Giro & Cek",
      icon: "📄",
      description: "Layanan Khusus Anggota",
    },
  ];

  const benefits = [
    {
      icon: <Shield className="w-6 h-6" style={{ color: THEME.primary }} />,
      title: "Keamanan Terjamin",
      description: "Transaksi dan data dilindungi sistem Koperasi",
    },
    {
      icon: <HeadphonesIcon className="w-6 h-6" style={{ color: THEME.primary }} />,
      title: "Tim Solid",
      description: "Tim support siap membantu setiap hari kerja",
    },
    {
      icon: <Landmark className="w-6 h-6" style={{ color: THEME.primary }} />,
      title: "Proses Cepat",
      description: "Pengajuan dan konfirmasi cepat",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(180deg, #FFFFFF 0%, ${THEME.primary}1A 100%)`,
      }}
    >
      {/* ============== HERO (Koperasi theme) ============== */}
      <section className="relative pt-24 pb-12 px-6 lg:px-12 overflow-hidden bg-white">
        {/* bubbles blend */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full"
            style={{
              background: "#6B6B6B",
              filter: "blur(80px)",
              opacity: 0.15,
            }}
          />
          <div
            className="absolute -top-10 right-[-10%] w-[28rem] h-[28rem] rounded-full"
            style={{
              background: "#E53935",
              filter: "blur(100px)",
              opacity: 0.12,
            }}
          />
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full"
            style={{
              background: "#6B6B6B",
              filter: "blur(80px)",
              opacity: 0.1,
            }}
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: "#E53935", color: "#FFFFFF" }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium">Panduan Layanan</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-6xl font-bold text-[#000000] mb-6">
            Cara Menggunakan
            <span className="block text-[#6B6B6B]">Layanan di</span>
            <span className="block text-[#E53935]">NESTAR</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto mb-8">
            Ikuti panduan mudah untuk bertransaksi di marketplace atau
            mengajukan layanan simpan pinjam. Proses yang simple, aman, dan
            menguntungkan!
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#6B6B6B]/20"
              >
                <div className="flex justify-center mb-3 text-[#E53935]">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-[#000000] text-sm mb-1">
                  {benefit.title}
                </h3>
                <p className="text-xs text-[#6B6B6B]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== STEP NAV + CONTENT (Koperasi theme) ============== */}
      <section className="px-6 lg:px-12 mb-16 bg-white pt-10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#000000] mb-4">
              Langkah-langkah <span className="text-[#E53935]">Bertransaksi</span>
            </h2>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto">
              Proses yang simple dan user-friendly, dirancang untuk kemudahan
              anggota.
            </p>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex justify-center mb-12">
              <div
                className="bg-white rounded-3xl p-6 shadow-lg w-full"
                style={{ border: `1px solid #6B6B6B33` }}
              >
                <div className="flex flex-wrap gap-3">
                  {orderSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setActiveStep(step.id)}
                            className="flex items-center gap-3 w-full sm:w-auto px-4 py-3 rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base"
                            style={
                              activeStep === step.id
                                ? {
                                    backgroundColor: "#E53935",
                                    color: "#fff",
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                                  }
                                : {
                                    backgroundColor: "#F3F4F6",
                                    color: "#6B6B6B",
                                  }
                            }
                          >
                            <div
                              className="p-2 rounded-xl flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  activeStep === step.id ? "#FFFFFF33" : "#fff",
                              }}
                            >
                              <div
                                style={{
                                  color:
                                    activeStep === step.id ? "#fff" : "#E53935",
                                }}
                              >
                                {step.icon}
                              </div>
                            </div>
                            <span className="sm:hidden">{step.id}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {index + 1}. {step.title}
                        </TooltipContent>
                      </Tooltip>

                      {/* Arrow only on large screens */}
                      {index < orderSteps.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-[#6B6B6B]/30 mx-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Step Content */}
          {orderSteps.map((step) => (
            <div
              key={step.id}
              className={`transition-all duration-500 ${
                activeStep === step.id
                  ? "opacity-100 visible"
                  : "opacity-0 invisible absolute"
              }`}
            >
              {activeStep === step.id && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Content */}
                    <div className="p-8 lg:p-12">
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
                          style={{ backgroundColor: "#E53935" }}
                        >
                          {step.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#E53935]">
                            Langkah {step.id}
                          </div>
                          <h3 className="text-2xl font-bold text-[#000000]">
                            {step.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-[#6B6B6B] text-lg mb-6">
                        {step.description}
                      </p>

                      <div className="space-y-4 mb-8">
                        <h4 className="font-semibold text-[#000000]">
                          Detail Langkah:
                        </h4>
                        {step.details.map((detail, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#E53935]/10">
                              <div className="w-2 h-2 rounded-full bg-[#E53935]" />
                            </div>
                            <span className="text-[#6B6B6B]">{detail}</span>
                          </div>
                        ))}
                      </div>

                      {step.tips && (
                        <div className="rounded-2xl p-6 bg-[#6B6B6B]/5">
                          <h4 className="font-semibold text-[#000000] mb-3 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-[#E53935]" />
                            Tips Berguna:
                          </h4>
                          <ul className="space-y-2">
                            {step.tips.map((tip, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-start gap-2 text-[#6B6B6B]"
                              >
                                <Star className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#E53935]" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Visual */}
                    <div className="relative flex items-center justify-center p-8 bg-gradient-to-br from-[#FFFFFF] via-[#F9F9F9] to-[#FFEAEA]">
                      <div className="relative w-full max-w-md">
                        <Image
                          src={step.image}
                          alt={step.title}
                          width={400}
                          height={300}
                          className="w-full h-auto rounded-2xl shadow-lg"
                        />
                        <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full opacity-50 bg-[#E53935]/30" />
                        <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full opacity-50 bg-[#6B6B6B]/30" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#6B6B6B] text-[#6B6B6B] hover:bg-[#6B6B6B] hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              Langkah Sebelumnya
            </button>

            <button
              onClick={() => setActiveStep(Math.min(6, activeStep + 1))}
              disabled={activeStep === 6}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#E53935] hover:bg-[#c62828]"
            >
              Langkah Selanjutnya
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============== PAYMENT (section putih) ============== */}
      <section className="px-6 lg:px-12 mb-16">
        <div className="container mx-auto">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg">
            {/* Title */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Metode <span style={{ color: THEME.primary }}>Pembayaran</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Kami menyediakan berbagai metode pembayaran yang aman dan
                terpercaya
              </p>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl transition-all duration-300 border hover:shadow-md"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div
                    className="text-4xl mb-4"
                    style={{ color: THEME.primary }}
                  >
                    {method.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              ))}
            </div>

            {/* Security Info */}
            <div
              className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: `${THEME.primary}0D` }} // merah lembut transparan
            >
              <div className="flex justify-center mb-4">
                <Shield className="w-8 h-8" style={{ color: THEME.primary }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Keamanan Terjamin
              </h3>
              <p className="text-gray-600">
                Semua transaksi dilindungi sistem keamanan Koperasi dan diawasi
                tim internal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CONTACT (section berwarna) ============== */}
      <section className="px-6 lg:px-12 mb-16">
        <div className="container mx-auto">
          <div
            className="rounded-3xl p-8 lg:p-12 text-gray-900"
            style={{
              background: `linear-gradient(90deg, ${THEME.primary} 0%, ${THEME.primary}CC 100%)`,
              color: "#fff",
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Butuh Bantuan?</h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                Tim Customer Services akan siap membantu fast response hari
                Senin - Jumat jam 08.00 - 17.00 WIB. Jangan ragu untuk
                menghubungi kami!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <p className="text-white/90">+62 817 694 2128</p>
                <p className="text-sm text-white/70">
                  Respon cepat dalam 5 menit
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-white/90">support@koperasimerahputih.co.id</p>
                <p className="text-sm text-white/70">Respon dalam 2 jam</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HeadphonesIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Customer Support</h3>
                <p className="text-white/90">24/7 Online</p>
                <p className="text-sm text-white/70">Live chat tersedia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CTA (section putih) ============== */}
      <section className="px-6 lg:px-12 mb-16">
        <div className="container mx-auto">
          <div className="bg-white rounded-3xl p-8 lg:p-12 text-center shadow-lg">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Yuk Mulai Bertransaksi Sekarang
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Jelajahi berbagai produk UMKM dari anggota kami atau ajukan
              layanan simpan pinjam untuk kebutuhan Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={goToMarketplacePage}
                className="text-white px-8 py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: THEME.primary }}
              >
                <Store className="w-5 h-5" />
                Masuk ke Marketplace
              </button>
              <button
                className="px-8 py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2 border"
                style={{ color: THEME.primary, borderColor: THEME.primary }}
              >
                <Landmark className="w-5 h-5" />
                Ajukan Pinjaman
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FAQ (section putih) ============== */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pertanyaan <span style={{ color: THEME.primary }}>Umum</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan jawaban untuk pertanyaan yang sering ditanyakan tentang
              proses bertransaksi dan pengajuan layanan.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === index ? null : index)
                    }
                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    {expandedFAQ === index ? (
                      <ChevronUp
                        className="w-5 h-5"
                        style={{ color: THEME.primary }}
                      />
                    ) : (
                      <ChevronDown
                        className="w-5 h-5"
                        style={{ color: THEME.primary }}
                      />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}