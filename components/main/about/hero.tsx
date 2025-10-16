"use client";

import Image from "next/image";
import { Home, Shield, Sparkles, MapPin, Calculator } from "lucide-react";

const Hero = () => {
  const PRIMARY_COLOR = "#003366"; // Biru Gelap
  const ACCENT_COLOR = "#00BFFF"; // Biru Muda

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient - Menggunakan gradien biru muda yang menenangkan */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8F5FF] via-[#F0F8FF] to-[#FFFFFF]"></div>

        {/* Decorative Elements - Menggunakan warna biru */}
        <div className="absolute top-20 left-10 w-24 h-24 rounded-full blur-2xl" style={{ backgroundColor: `${PRIMARY_COLOR}15` }}></div>
        <div className="absolute bottom-32 right-16 w-20 h-20 rounded-full blur-2xl" style={{ backgroundColor: `${ACCENT_COLOR}25` }}></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full blur-md" style={{ backgroundColor: `${PRIMARY_COLOR}30` }}></div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-20 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: `${ACCENT_COLOR}30` }}>
                <Sparkles className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
                  Tentang NESTAR Properti
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Kepercayaan, Stabilitas,
                <span className="block text-gray-600">dan Transparansi</span>
                <span className="block" style={{ color: PRIMARY_COLOR }}>di Dunia Properti</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                NESTAR adalah portal properti digital Anda yang terpercaya. Kami
                berkomitmen menyediakan listing terverifikasi dan layanan agen
                profesional untuk memastikan transaksi Anda aman dan nyaman.
              </p>

              {/* Info Cards Properti */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: PRIMARY_COLOR }}>
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      Properti Terverifikasi
                    </div>
                    <div className="text-sm text-gray-600">
                      Jaminan Legalitas dan Fisik
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: ACCENT_COLOR }}>
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Simulasi KPR</div>
                    <div className="text-sm text-gray-600">
                      Rencana Finansial Akurat
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/nestar-hero.webp" // Gambar dipertahankan
                  alt="NESTAR Properti"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Floating Badge - Statistik Properti */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {/* Ikon untuk Listing Properti, Agen, dan Transaksi */}
                      <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-white text-xs font-bold" style={{ backgroundColor: `${PRIMARY_COLOR}20`, color: PRIMARY_COLOR }}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-white text-xs font-bold" style={{ backgroundColor: `${PRIMARY_COLOR}20`, color: PRIMARY_COLOR }}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-white text-xs font-bold" style={{ backgroundColor: `${PRIMARY_COLOR}20`, color: PRIMARY_COLOR }}>
                        <Home className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-gray-900">10.000+</div>
                      <div className="text-xs text-gray-600">
                        Properti Terverifikasi
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;