"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  Smartphone,
  Wifi,
  Bolt,
  Wallet,
  Tv,
  Droplets,
  Zap,
  ShieldCheck,
  TicketPercent,
} from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";
import { useCreateTransaksiMutation } from "@/services/ppob/transaksi.service";
import {
  PpobForms,
  PaymentInvoice,
  type ApiTransaksiData,
} from "@/components/form-modal/ppob/ppob-form-invoice";

const ppobServices = [
  { id: "pulsa", name: "Pulsa", icon: <Smartphone className="w-7 h-7" /> },
  { id: "data", name: "Paket Data", icon: <Wifi className="w-7 h-7" /> },
  { id: "pln", name: "Listrik PLN", icon: <Bolt className="w-7 h-7" /> },
  { id: "ewallet", name: "E-Wallet", icon: <Wallet className="w-7 h-7" /> },
  { id: "pdam", name: "Air PDAM", icon: <Droplets className="w-7 h-7" /> },
  { id: "internet", name: "Internet & TV", icon: <Tv className="w-7 h-7" /> },
] as const;

// TARUH DI ATAS (dekat PRODUCT_MAP)
type PPOBCategory = "pulsa" | "data" | "pln" | "pdam" | "ewallet" | "internet";

const PRODUCT_MAP = {
  pulsa: {
    10000: 101,
    25000: 102,
    50000: 103,
    100000: 104,
  },
} as const;

// Map khusus kategori NON-pulsa
const NON_PULSA_PRODUCT_MAP: Record<Exclude<PPOBCategory, "pulsa">, number> = {
  data: 201,
  pln: 301,
  pdam: 401,
  ewallet: 501,
  internet: 601,
};

// Default metode pembayaran agar konsisten dengan contoh
const DEFAULT_PAYMENT_METHOD = "bank_transfer";
const DEFAULT_PAYMENT_CHANNEL = "bca";

export default function PPOBPage() {
  const [activeCategory, setActiveCategory] = useState<PPOBCategory>("pulsa");

  // ============= INVOICE MODAL STATE (sama seperti contoh) =============
  const [invoiceData, setInvoiceData] = useState<ApiTransaksiData | null>(null);
  const [createTransaksi, { isLoading: isCreating }] =
    useCreateTransaksiMutation();

  // Handler global untuk create transaksi dari form apapun
  const handleCreateTransaksi = useCallback(
    async (args: {
      customer_no: string;
      // untuk pulsa kirim denomination, nanti di-map ke product_id
      denomination?: number | null;
    }) => {
      try {
       let ppob_product_id = 0;

       if (activeCategory === "pulsa") {
         const denom = Number(args.denomination || 0);
         ppob_product_id =
           denom === 10000
             ? PRODUCT_MAP.pulsa[10000]
             : denom === 25000
             ? PRODUCT_MAP.pulsa[25000]
             : denom === 50000
             ? PRODUCT_MAP.pulsa[50000]
             : denom === 100000
             ? PRODUCT_MAP.pulsa[100000]
             : 0;
       } else {
         // aman secara tipe, karena activeCategory !== "pulsa"
         ppob_product_id = NON_PULSA_PRODUCT_MAP[activeCategory];
       }

        if (!ppob_product_id) {
          Swal.fire(
            "Gagal",
            "Produk tidak tersedia. Coba pilih nominal/layanan lain.",
            "error"
          );
          return;
        }

        const payload = {
          user_id: 1,
          ppob_product_id,
          customer_no: args.customer_no,
          payment_method: DEFAULT_PAYMENT_METHOD,
          payment_channel: DEFAULT_PAYMENT_CHANNEL,
        };

        // create → API balikin data invoice (struktur baru)
        const response = await createTransaksi(payload).unwrap();
        // response diasumsikan sudah dalam struktur ApiTransaksiData
        setInvoiceData(response as unknown as ApiTransaksiData);
        Swal.fire(
          "Sukses",
          "Transaksi dibuat. Lanjutkan pembayaran.",
          "success"
        );
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Gagal memproses transaksi PPOB.", "error");
      }
    },
    [activeCategory, createTransaksi]
  );

  const handleInvoiceDone = async () => {
    Swal.fire({
      title: "Pemberitahuan",
      text: "Permintaan memeriksa pembayaran telah diterima. Mohon tunggu konfirmasi.",
      icon: "info",
    });
    setInvoiceData(null);
  };

  const handleInvoiceCancel = () => setInvoiceData(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#6B6B6B]/10">
      {/* ===================== Header / Hero ===================== */}
      <section className="relative pt-24 pb-12 px-6 lg:px-12 overflow-hidden bg-white">
        <div className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full bg-[#E53935]/10 blur-3xl opacity-50" />
        <div className="absolute top-1/3 right-[-10%] w-[28rem] h-[28rem] rounded-full bg-[#6B6B6B]/10 blur-3xl opacity-40" />

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#E53935]/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#E53935]" />
            <span className="text-sm font-medium text-[#6B6B6B]">
              Layanan Digital Koperasi
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-[#6B6B6B] mb-6">
            Bayar & Beli Kebutuhan{" "}
            <span className="block text-[#E53935]">Digital Anda</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Nikmati kemudahan membayar tagihan dan membeli produk digital
            langsung dari NESTAR. Cepat, aman, dan terpercaya.
          </p>
        </div>
      </section>

      {/* ===================== PPOB Main Section ===================== */}
      <section className="px-6 lg:px-12 py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Interactive Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-3xl font-bold text-[#6B6B6B] mb-2">
                Pilih Layanan
              </h2>
              <p className="text-gray-500 mb-8">
                Klik layanan yang Anda butuhkan di bawah ini.
              </p>

              {/* Service Selection (UI tidak diubah) */}
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mb-10">
                {ppobServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() =>
                      setActiveCategory(service.id as PPOBCategory)
                    }
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl aspect-square transition-all duration-300 ${
                      activeCategory === service.id
                        ? "bg-[#E53935] text-white shadow-lg -translate-y-1"
                        : "bg-gray-100 text-[#6B6B6B] hover:bg-gray-200"
                    }`}
                  >
                    {service.icon}
                    <span className="text-xs font-semibold">
                      {service.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Dynamic Form Area (UI tetap, logic diangkat ke callback createTransaksi) */}
              <div className="border-t border-gray-200 pt-8">
                <PpobForms
                  category={activeCategory}
                  isSubmitting={isCreating}
                  onSubmit={handleCreateTransaksi}
                />
              </div>
            </div>

            {/* Right Column: Why Us & Promo (UI tidak diubah) */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="relative h-48 mb-6">
                  <Image
                    src="/ppob.webp"
                    alt="Ilustrasi Pembayaran Digital"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-[#6B6B6B] mb-4">
                  Kenapa Bertransaksi di Sini?
                </h3>
                <div className="space-y-5 text-left">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#E53935]/10 p-2 rounded-full">
                      <Zap className="w-6 h-6 text-[#E53935]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        Transaksi Cepat & Mudah
                      </h4>
                      <p className="text-sm text-gray-500">
                        Proses instan 24/7, hanya butuh beberapa klik.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-[#E53935]/10 p-2 rounded-full">
                      <ShieldCheck className="w-6 h-6 text-[#E53935]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        Aman & Terpercaya
                      </h4>
                      <p className="text-sm text-gray-500">
                        Sistem terenkripsi untuk keamanan data Anda.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-[#E53935]/10 p-2 rounded-full">
                      <TicketPercent className="w-6 h-6 text-[#E53935]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        Banyak Promo Menarik
                      </h4>
                      <p className="text-sm text-gray-500">
                        Dapatkan diskon dan cashback spesial untuk anggota.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MODAL INVOICE (logic contoh) ===================== */}
      {invoiceData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <PaymentInvoice
            data={invoiceData}
            onDone={handleInvoiceDone}
            onCancel={handleInvoiceCancel}
          />
        </div>
      )}
    </div>
  );
}