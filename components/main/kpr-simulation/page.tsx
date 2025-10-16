"use client";

import { useState, useMemo } from "react";
import {
  ShieldCheck, // Icon untuk kepercayaan
  Calculator, // Icon utama
  Home,
  Percent, // Icon untuk bunga
  Clock, // Icon untuk tenor
  ArrowRight,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // Asumsi komponen Button diimpor
import DotdLoader from "@/components/loader/3dot"; // Tetap pertahankan loader jika diperlukan

// Warna NESTAR Properti
const PRIMARY_COLOR = "#003366"; // Biru Gelap
const ACCENT_COLOR = "#00BFFF"; // Biru Muda
const SECONDARY_TEXT_COLOR = "#666666"; // Abu-abu untuk teks sekunder

// Helper untuk format mata uang IDR
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export default function KPRSimulationPage() {
  const [hargaProperti, setHargaProperti] = useState(500000000); // Default 500 Juta
  const [uangMuka, setUangMuka] = useState(100000000); // Default 100 Juta (20%)
  const [sukuBungaTahunan, setSukuBungaTahunan] = useState(6.5); // Default 6.5%
  const [tenorTahun, setTenorTahun] = useState(15); // Default 15 Tahun
  const [isCalculating, setIsCalculating] = useState(false);

  // Fungsi Kalkulasi KPR (Menggunakan rumus anuitas dasar)
  const { totalPinjaman, sukuBungaBulanan, cicilanBulanan, totalPembayaran } =
    useMemo(() => {
      const pinjaman = hargaProperti - uangMuka;
      const bungaBulanan = sukuBungaTahunan / 100 / 12;
      const tenorBulan = tenorTahun * 12;

      let cicilan = 0;
      let totalBayar = 0;

      if (pinjaman > 0 && bungaBulanan > 0 && tenorBulan > 0) {
        // Rumus Cicilan Anuitas Bulanan (M= P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ] )
        cicilan =
          pinjaman *
          (bungaBulanan * Math.pow(1 + bungaBulanan, tenorBulan)) /
          (Math.pow(1 + bungaBulanan, tenorBulan) - 1);
        
        totalBayar = cicilan * tenorBulan;
      } else if (pinjaman > 0 && tenorBulan > 0) {
        // Jika bunga 0% (hanya pokok)
        cicilan = pinjaman / tenorBulan;
        totalBayar = pinjaman;
      }
      

      return {
        totalPinjaman: pinjaman > 0 ? pinjaman : 0,
        sukuBungaBulanan: bungaBulanan,
        cicilanBulanan: cicilan,
        totalPembayaran: totalBayar,
      };
    }, [hargaProperti, uangMuka, sukuBungaTahunan, tenorTahun]);

  const handleSimulate = () => {
    setIsCalculating(true);
    // Simulasi loading
    setTimeout(() => {
      setIsCalculating(false);
      // Hasil kalkulasi langsung ditampilkan via useMemo
    }, 800);
  };

  const isFormValid = useMemo(() => {
    return hargaProperti > 0 && uangMuka >= 0 && hargaProperti >= uangMuka && sukuBungaTahunan > 0 && tenorTahun > 0;
  }, [hargaProperti, uangMuka, sukuBungaTahunan, tenorTahun]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#00336610]">
      {/* ===================== Header / Hero KPR ===================== */}
      <section className="relative pt-24 pb-12 px-6 lg:px-12 overflow-hidden bg-white">
        <div className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-50" style={{ backgroundColor: `${ACCENT_COLOR}15` }} />
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${ACCENT_COLOR}15` }}>
            <Calculator className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
              Kalkulator KPR NESTAR
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Rencanakan Cicilan{" "}
            <span className="block" style={{ color: PRIMARY_COLOR }}>
              Rumah Impian Anda
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Gunakan simulasi KPR akurat kami untuk menghitung estimasi cicilan,
            total pinjaman, dan temukan skema pembayaran terbaik.
          </p>
        </div>
      </section>

      {/* ===================== KPR Input & Result Panel ===================== */}
      <section className="px-6 lg:px-12 pb-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* KPR Input Form (Col 1 & 2) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Masukkan Data Pinjaman
              </h3>

              <div className="space-y-6">
                {/* Input Harga Properti */}
                <KPRInput
                  label="Harga Properti (Rp)"
                  icon={<Home className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />}
                  value={hargaProperti}
                  onChange={(v) => setHargaProperti(Math.max(0, v))}
                  type="number"
                  min={0}
                />

                {/* Input Uang Muka */}
                <KPRInput
                  label="Uang Muka (Down Payment - DP)"
                  icon={<Percent className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />}
                  value={uangMuka}
                  onChange={(v) => setUangMuka(Math.max(0, v))}
                  type="number"
                  min={0}
                  max={hargaProperti}
                />

                {/* Input Suku Bunga */}
                <KPRInput
                  label="Suku Bunga Tahunan (%)"
                  icon={<Percent className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />}
                  value={sukuBungaTahunan}
                  onChange={(v) => setSukuBungaTahunan(Math.max(0, v))}
                  type="number"
                  min={0}
                  step={0.1}
                />

                {/* Input Tenor */}
                <KPRInput
                  label="Tenor Pinjaman (Tahun)"
                  icon={<Clock className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />}
                  value={tenorTahun}
                  onChange={(v) => setTenorTahun(Math.max(1, v))}
                  type="number"
                  min={1}
                  max={30}
                />

              </div>
              
              <Button
                onClick={handleSimulate}
                disabled={!isFormValid || isCalculating}
                className="w-full mt-8 py-3 text-lg font-semibold shadow-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                {isCalculating ? (
                  <>
                    <DotdLoader />
                    <span>Menghitung...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    Hitung Estimasi Cicilan
                  </>
                )}
              </Button>
               {!isFormValid && (
                    <p className="text-red-500 text-sm mt-3 text-center">Pastikan Harga Properti lebih besar dari Uang Muka dan semua kolom terisi dengan benar.</p>
                )}
            </motion.div>

            {/* Hasil Kalkulasi & CTA (Col 3) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 sticky top-24 h-fit"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Hasil Simulasi
              </h3>
              
              {isCalculating ? (
                <div className="h-64 flex flex-col items-center justify-center">
                    <DotdLoader />
                    <p className="text-gray-600 mt-4">Menyiapkan hasil...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Estimasi Cicilan Bulanan */}
                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${ACCENT_COLOR}15` }}>
                    <p className="text-lg font-medium text-gray-600">
                      Estimasi Cicilan Bulanan
                    </p>
                    <h4 className="text-4xl font-extrabold mt-1" style={{ color: PRIMARY_COLOR }}>
                      {formatRupiah(cicilanBulanan)}
                    </h4>
                  </div>

                  {/* Detail Angka */}
                  <KPRResultItem
                    label="Total Pinjaman Pokok"
                    value={formatRupiah(totalPinjaman)}
                    color={PRIMARY_COLOR}
                  />
                  <KPRResultItem
                    label="Total Pembayaran (Pokok + Bunga)"
                    value={formatRupiah(totalPembayaran)}
                    color={SECONDARY_TEXT_COLOR}
                  />
                  <KPRResultItem
                    label="Tenor"
                    value={`${tenorTahun} Tahun (${tenorTahun * 12} Bulan)`}
                    color={SECONDARY_TEXT_COLOR}
                  />
                  <KPRResultItem
                    label="Bunga Tahunan"
                    value={`${sukuBungaTahunan}%`}
                    color={SECONDARY_TEXT_COLOR}
                  />
                  
                  {/* Peringatan/Disclaimer */}
                  <p className="text-xs text-red-500 pt-3 border-t border-gray-200">
                      *Estimasi ini belum termasuk biaya provisi, administrasi, asuransi, dan PPN/BPHTB.
                  </p>
                </div>
              )}

              {/* CTA Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                <p className="text-lg font-semibold text-center text-gray-800">
                    Siap Mengajukan?
                </p>
                <Button
                  className="w-full py-3 text-lg font-semibold shadow-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <ArrowRight className="w-5 h-5" />
                  Ajukan KPR (Aplikasi Online)
                </Button>
                <Button
                  className="w-full py-3 text-lg font-semibold border-2 hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'white', borderColor: ACCENT_COLOR, color: PRIMARY_COLOR }}
                >
                  <Phone className="w-5 h-5" />
                  Hubungi Agen KPR Kami
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Komponen Input KPR yang dapat digunakan kembali
interface KPRInputProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
}

const KPRInput: React.FC<KPRInputProps> = ({ label, icon, value, onChange, type = 'text', ...props }) => {
  const isCurrency = label.includes('(Rp)');
  const inputValue = isCurrency ? formatRupiah(value).replace('Rp', '').trim() : value;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    let numericValue: number;

    if (isCurrency) {
      // Hapus karakter non-angka kecuali koma/titik untuk desimal (jika diizinkan)
      numericValue = parseFloat(rawValue.replace(/\./g, '').replace(/,/g, '.'));
    } else {
      numericValue = parseFloat(rawValue);
    }
    
    // Pastikan nilainya adalah angka
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    } else if (rawValue === '') {
      onChange(0);
    }
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
        <input
          type={type === 'number' && !isCurrency ? 'number' : 'text'}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={isCurrency ? handleInputChange : undefined} // Update saat blur untuk format Rupiah
          onFocus={isCurrency ? (e) => e.target.value = value.toString() : undefined} // Saat fokus, tampilkan angka murni
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-opacity-75"
          min={props.min}
          max={props.max}
          step={props.step}
        />
        {isCurrency && value > 0 && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                Rp
            </div>
        )}
      </div>
    </div>
  );
};

// Komponen Item Hasil KPR
interface KPRResultItemProps {
  label: string;
  value: string;
  color: string;
}

const KPRResultItem: React.FC<KPRResultItemProps> = ({ label, value, color }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold" style={{ color: color }}>
      {value}
    </span>
  </div>
);