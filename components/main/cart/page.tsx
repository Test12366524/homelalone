"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Home,
  Upload,
  User,
  Phone,
  X,
  Loader2,
  Trash2, // Tambahkan Loader2 untuk loading IFrame
} from "lucide-react";
import { Product } from "@/types/admin/product";
import DotdLoader from "@/components/loader/3dot";

// === Import logic checkout (dipertahankan minimal) ===
import {
  useGetCurrentUserQuery,
} from "@/services/auth.service";
import { useCreateTransactionFrontendMutation } from "@/services/admin/transaction.service";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import {
  CheckoutDetail,
  CheckoutItem,
  CheckoutPayload,
  CheckoutShipment,
} from "@/types/admin/payment";
import { PaymentMethodSelect } from "@/components/ui/payment-method-select";
import { PaymentChannelSelect } from "@/components/ui/payment-channel-select";
import { Payment } from "@/types/admin/simpanan";
import { showPaymentInstruction } from "@/lib/show-payment-instructions";

// Warna NESTAR Properti
const PRIMARY_COLOR = "#003366"; // Biru Gelap
const ACCENT_COLOR = "#00BFFF"; // Biru Muda

// Midtrans Sandbox Credentials (Untuk Simulasi Tokenization)
const MIDTRANS_CLIENT_KEY = 'Mid-client-gMjC8jwuOrqziovd';
const MIDTRANS_TOKEN_ENDPOINT = 'https://api.sandbox.midtrans.com/v2/token';

// Disesuaikan untuk Properti (Asumsi Keranjang hanya menyimpan properti)
const STORAGE_KEY = "cart-storage";

type StoredCartItem = Product & { quantity: number };
interface CartItemView {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  category: string;
  isEcoFriendly: boolean;
  inStock: boolean;
}

type ErrorBag = Record<string, string[] | string>;

interface CardData {
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
}

function parseStorage(): StoredCartItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    const items: unknown = parsed?.state?.cartItems;
    return Array.isArray(items) ? (items as StoredCartItem[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(nextItems: StoredCartItem[]) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  let base = {
    state: { cartItems: [] as StoredCartItem[] },
    version: 0 as number,
  };
  try {
    base = raw ? JSON.parse(raw) : base;
  } catch {}
  base.state = { ...(base.state || {}), cartItems: nextItems };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(base));
  window.dispatchEvent(new CustomEvent("cartUpdated"));
}

function getImageUrlFromProduct(product: Product): string {
  // Adjust this logic based on your Product type structure
  // Example: return product.imageUrl || "/default-image.png";
  if (product.image && typeof product.image === "string") {
    return product.image;
  }
  if (Array.isArray((product as any).images) && (product as any).images.length > 0) {
    return (product as any).images[0];
  }
  return "/default-image.png";
}

function mapStoredToView(items: StoredCartItem[]): CartItemView[] {
  return items.map((it) => ({
    id: it.id,
    name: it.name,
    price: it.price,
    originalPrice: undefined,
    image: getImageUrlFromProduct(it),
    quantity: 1,
    category: it.category_name,
    isEcoFriendly: false,
    inStock: true,
  }));
}


export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const { data: currentUserResp } = useGetCurrentUserQuery();
  const sessionName = useMemo(() => session?.user?.name ?? "", [session]);
  const sessionPhone = useMemo(() => currentUserResp?.phone ?? "", [currentUserResp]);

  const [cartItems, setCartItems] = useState<CartItemView[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [payType, setPayType] = useState<"automatic" | "manual">("automatic");
  const [payMethod, setPayMethod] = useState<string | undefined>(undefined);
  const [payChannel, setPayChannel] = useState<string | undefined>(undefined);
  
  const [cardData, setCardData] = useState<CardData>({
      number: "",
      expMonth: "",
      expYear: "",
      cvv: "",
  });

  const [contactInfo, setContactInfo] = useState({
    fullName: "",
    phone: "",
  });

  // NEW STATE: Untuk menyimpan URL 3DS Midtrans
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [isIFrameLoading, setIsIFrameLoading] = useState(true);

  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const validatePhone = (phone: string) => {
    const regex = /^(?:\+62|62|0)8\d{8,11}$/;
    return regex.test(phone);
  };

  useEffect(() => {
    setIsPhoneValid(validatePhone(contactInfo.phone));
  }, [contactInfo.phone]);

  const handleInputChange = (field: string, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (sessionName) {
      setContactInfo((prev) => ({ ...prev, fullName: sessionName }));
    }
    if (sessionPhone) {
        setContactInfo((prev) => ({ ...prev, phone: sessionPhone }));
    }
  }, [sessionName, sessionPhone]);

  const [createTransactionFrontend] = useCreateTransactionFrontendMutation();

  useEffect(() => {
    const sync = () => setCartItems(mapStoredToView(parseStorage()));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("cartUpdated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cartUpdated", sync);
    };
  }, []);

  const updateStorageAndState = (
    updater: (items: StoredCartItem[]) => StoredCartItem[]
  ) => {
    const current = parseStorage();
    const next = updater(current);
    writeStorage(next);
    setCartItems(mapStoredToView(next));
  };

  const removeItem = (id: number) => {
    updateStorageAndState((items) => items.filter((it) => it.id !== id));
  };

  const clearCart = () => {
    writeStorage([]);
    setCartItems([]);
  };

  const subtotal = cartItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
  
  const bookingFee = subtotal; 
  const total = bookingFee; 
  
  const buildCheckoutItem = (): CheckoutItem => {
    const stored = parseStorage();
    const details: CheckoutDetail[] = stored.map((it) => ({
      product_id: it.id,
      quantity: 1,
    }));

    const shipment: CheckoutShipment = {
      parameter: JSON.stringify({ note: "Booking Properti" }),
      shipment_detail: JSON.stringify({ service: "No Shipment" }),
      courier: "NONE",
      cost: 0,
    };

    return { shop_id: 1, details, shipment };
  };

  // ====================================================================
  // [NEW LOGIC] Tokenization Kartu Kredit
  // ====================================================================

  const validateCardData = (data: CardData): boolean => {
    if (data.number.replace(/\s/g, '').length < 13 || data.number.replace(/\s/g, '').length > 19) return false;
    if (data.expMonth.length !== 2 || Number(data.expMonth) > 12 || Number(data.expMonth) < 1) return false;
    if (data.expYear.length !== 4) return false;
    if (data.cvv.length < 3 || data.cvv.length > 4) return false;
    
    const currentYear = new Date().getFullYear() % 100;
    const inputYear = Number(data.expYear.slice(2, 4));
    if (inputYear < currentYear) return false;

    return true;
  };

  const getTokenFromMidtrans = async (data: CardData): Promise<string | null> => {
    const cardNumber = data.number.replace(/\s/g, '');
    const expMonth = data.expMonth;
    const expYear = data.expYear.slice(2, 4);
    const cvv = data.cvv;
    
    const url = new URL(MIDTRANS_TOKEN_ENDPOINT);
    url.searchParams.append('client_key', MIDTRANS_CLIENT_KEY);
    url.searchParams.append('card_number', cardNumber);
    url.searchParams.append('card_exp_month', expMonth);
    url.searchParams.append('card_exp_year', expYear);
    url.searchParams.append('card_cvv', cvv);
    
    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
        });
        
        const result = await response.json();
        
        if (result.status_code === '200' && result.token_id) {
            return result.token_id;
        } else {
            console.error("Midtrans Tokenization Failed:", result);
            Swal.fire({
                icon: 'error',
                title: 'Token Kartu Gagal',
                text: result.validation_messages ? result.validation_messages.join(', ') : 'Informasi kartu tidak valid.',
                confirmButtonColor: PRIMARY_COLOR
            });
            return null;
        }
    } catch (e) {
        console.error("Network Error during tokenization:", e);
        Swal.fire({
            icon: 'error',
            title: 'Koneksi Gagal',
            text: 'Gagal mendapatkan token kartu. Cek koneksi Anda.',
            confirmButtonColor: PRIMARY_COLOR
        });
        return null;
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    if (!contactInfo.fullName || !isPhoneValid) {
      await Swal.fire({
        icon: "warning",
        title: "Lengkapi Data",
        text: "Harap lengkapi Nama Lengkap dan Nomor Telepon yang valid.",
        confirmButtonColor: PRIMARY_COLOR
      });
      setIsCheckingOut(false);
      return;
    }

    if (payType === "automatic") {
      if (!payMethod) {
          await Swal.fire({ icon: "warning", title: "Metode Pembayaran", text: "Pilih Payment Method.", confirmButtonColor: PRIMARY_COLOR });
          setIsCheckingOut(false);
          return;
      }
      
      if (payMethod === "card") {
          if (!validateCardData(cardData)) {
              await Swal.fire({ icon: "warning", title: "Data Kartu Tidak Lengkap", text: "Harap isi semua detail kartu kredit dengan benar.", confirmButtonColor: PRIMARY_COLOR });
              setIsCheckingOut(false);
              return;
          }
          
          const token = await getTokenFromMidtrans(cardData);
          if (!token) {
              setIsCheckingOut(false);
              return;
          }
          
          // Kirim payload dengan token kartu
          await processTransactionWithToken(token);
          setIsCheckingOut(false);
          return;
      }
      
      if (payMethod !== "card" && !payChannel) {
          await Swal.fire({ icon: "warning", title: "Payment Channel", text: "Pilih Payment Channel (mis. Bank).", confirmButtonColor: PRIMARY_COLOR });
          setIsCheckingOut(false);
          return;
      }
    }
    
    // Jika bukan kartu, lanjutkan proses transaksi non-kartu
    await processTransactionWithToken(null);
    setIsCheckingOut(false);
  };
  
  const processTransactionWithToken = async (cardToken: string | null) => {
    setIsSubmitting(true);
    
    const item = buildCheckoutItem();
    
    // Tentukan payment channel yang benar untuk payload
    const finalPayMethod = cardToken ? "card" : payMethod;
    const finalPayChannel = cardToken ? "card" : payChannel;

    const payload: CheckoutPayload = {
      address_line_1: `Kontak: ${contactInfo.fullName} / ${contactInfo.phone}`,
      address_line_2: `Booking Fee: ${formatRupiah(bookingFee)}`,
      postal_code: "00000",
      payment_type: payType === "automatic" ? "automatic" : "saldo",
      
      ...(payType === "automatic"
        ? { payment_method: finalPayMethod, payment_channel: finalPayChannel }
        : {}),
      
      // Kirim token kartu jika tersedia
      ...(cardToken ? { card_token: cardToken } : {}),
      
      data: [item],
    };

    // === FLOW MANUAL ===
    if (payType === "manual") {
      try {
        await createTransactionFrontend(payload).unwrap();
        // ... (SweetAlert Success Manual Payment)
        Swal.fire({ icon: "success", title: "Booking Berhasil Dibuat", text: "Silakan transfer manual dan upload bukti." });
        clearCart();
        router.push("/me");
      } catch (err: unknown) {
          Swal.fire({ icon: "error", title: "Gagal Membuat Booking", text: "Terjadi kesalahan saat transfer manual." });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // === FLOW AUTOMATIC ===
    try {
      const result = await createTransactionFrontend(payload).unwrap();
      const resp = result as { data?: { payment?: Payment; payment_link?: string } };
      const payment = resp?.data?.payment;
      const link = resp?.data?.payment?.redirect_url;

      if (link && finalPayMethod === "card") {
          // PENTING: Jika payment_link ada (untuk kartu kredit/3DS)
          // Atur state redirect dan tampilkan IFrame
          setRedirectUrl(link);
          setIsIFrameLoading(true);
          return; // Jangan clear cart atau redirect dulu
      }

      if (payment) {
        // ... (Show VA/QRIS Instruction)
        Swal.fire({ icon: "success", title: "Booking Dibuat", text: "Silakan bayar via VA/QRIS." });
        await showPaymentInstruction(payment); 
      } else if (link) {
        // ... (Redirect for general payment link)
        Swal.fire({ icon: "success", title: "Lanjut Pembayaran", text: "Mengalihkan ke gateway." });
        window.open(link, "_blank");
      } else {
        Swal.fire({ icon: "info", title: "Booking Dibuat", text: "Cek riwayat booking." });
      }

      clearCart();
      router.push("/me");

    } catch (err: unknown) {
        Swal.fire({ icon: "error", title: "Gagal Membuat Booking", text: "Transaksi otomatis gagal diproses." });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper untuk Rupiah
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };
  
  // ====================================================================
  // IFRAME REDIRECT VIEW (untuk 3DS Kartu Kredit)
  // ====================================================================
  if (redirectUrl) {
      return (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4 lg:p-8">
              <div className="w-full max-w-7xl h-full flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden">
                  {/* Header IFrame */}
                  <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: PRIMARY_COLOR + '20' }}>
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <CreditCard className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
                        Konfirmasi Pembayaran Kartu (3D Secure)
                      </h2>
                      <button
                          onClick={() => {
                              Swal.fire({ icon: "success", title: "Transaksi berhasil", text: "Silakan cek history pembayaran." });
                              clearCart();
                              router.push("/me");
                          }}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                          <X className="w-5 h-5 text-gray-600" />
                      </button>
                  </div>
                  
                  {/* Loading State IFrame */}
                  {isIFrameLoading && (
                      <div className="flex items-center justify-center py-20 flex-col">
                          <Loader2 className="w-10 h-10 animate-spin" style={{ color: PRIMARY_COLOR }} />
                          <p className="mt-4 text-gray-600">Memuat halaman 3D Secure...</p>
                          <p className="text-sm text-gray-500 mt-2">Mohon jangan tutup jendela ini.</p>
                      </div>
                  )}

                  {/* IFrame Konten */}
                  <iframe
                      src={redirectUrl}
                      onLoad={() => setIsIFrameLoading(false)}
                      className={`flex-1 w-full border-0 ${isIFrameLoading ? 'hidden' : 'block'}`}
                      style={{ minHeight: '600px' }}
                      title="Midtrans 3D Secure Payment"
                  />
                  
                  {/* Footer Reminder */}
                  <div className="p-3 text-center text-xs text-gray-500 border-t border-gray-200">
                    Ini adalah halaman pembayaran yang aman dari Midtrans. NESTAR tidak menyimpan data kartu Anda.
                  </div>
              </div>
          </div>
      );
  }


  return (
    <div className="min-h-screen pt-24" style={{ backgroundImage: `linear-gradient(to br, #FFFFFF, ${PRIMARY_COLOR}10)` }}>
      {/* ... (Konten Utama) ... */}
      <div className="container mx-auto px-6 lg:px-12 pb-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <a
              href="/listings"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Lanjut Cari Properti
            </a>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: PRIMARY_COLOR + '10' }}>
              <ShieldCheck className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
                Proses Booking Properti
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              <span style={{ color: PRIMARY_COLOR }}>Keranjang</span> Properti
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Properti di keranjang akan diproses sebagai pengajuan booking awal.
              Harap konfirmasi **Booking Fee** di ringkasan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Daftar Properti di Keranjang (dipertahankan) */}
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative w-full sm:w-40 h-48 sm:h-32 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-2xl"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold" style={{ color: PRIMARY_COLOR }}>
                        Booking Fee
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>
                        <span className="text-sm text-gray-600 font-medium">
                          {item.category}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          (Kuantitas dihitung 1 properti)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <button
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Tambah ke Wishlist"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Hapus dari Keranjang"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                          {formatRupiah(item.price)}
                        </span>
                        <span className="text-sm text-gray-500">
                            (Booking Fee)
                        </span>
                      </div>

                      <div className="text-right">
                          <div className="font-bold text-gray-900">
                            Subtotal: {formatRupiah(item.price)}
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Informasi Kontak (dipertahankan) */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                Informasi Kontak
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={contactInfo.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                  {!isPhoneValid && contactInfo.phone && (
                    <p className="text-sm text-red-500 mt-0.5">
                      Nomor telepon tidak valid
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Kolom Ringkasan Pembayaran */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                Metode Pembayaran Booking Fee
              </h3>

              <div className="space-y-4">
                {/* TIPE PEMBAYARAN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Pembayaran
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-neutral-50">
                      <input
                        type="radio"
                        name="pay-type"
                        value="automatic"
                        checked={payType === "automatic"}
                        onChange={() => {
                          setPayType("automatic");
                          setPayMethod(undefined);
                          setPayChannel(undefined);
                          setCardData({ number: "", expMonth: "", expYear: "", cvv: "" });
                        }}
                        className="form-radio h-4 w-4"
                        style={{ color: PRIMARY_COLOR }}
                      />
                      <div>
                        <p className="font-medium">Otomatis</p>
                        <p className="text-sm text-gray-500">
                          Gateway (VA/QRIS/Debit/Credit Card)
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-neutral-50">
                      <input
                        type="radio"
                        name="pay-type"
                        value="manual"
                        checked={payType === "manual"}
                        onChange={() => {
                          setPayType("manual");
                          setPayMethod(undefined);
                          setPayChannel(undefined);
                          setCardData({ number: "", expMonth: "", expYear: "", cvv: "" });
                        }}
                        className="form-radio h-4 w-4"
                        style={{ color: PRIMARY_COLOR }}
                      />
                      <div>
                        <p className="font-medium">Manual</p>
                        <p className="text-sm text-gray-500">
                          Transfer bank manual
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* METHOD & CHANNEL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Method{payType === "automatic" ? " *" : ""}
                    </label>
                    <PaymentMethodSelect
                      mode={payType}
                      value={payMethod}
                      onChange={(v) => {
                        if (v === "card") {
                          setPayMethod("card");
                          setPayChannel("card"); 
                        } else if (v === "bank_transfer") {
                          setPayMethod("bank_transfer");
                          setPayChannel(undefined);
                        } else if (v === "qris") {
                          setPayMethod("qris");
                          setPayChannel("qris");
                        } else {
                          setPayMethod(v);
                          setPayChannel(undefined);
                        }
                        setCardData({ number: "", expMonth: "", expYear: "", cvv: "" });
                      }}
                    />
                  </div>
                  
                  {payType === "automatic" && payMethod === "card" && (
                    <div className="col-span-2 space-y-2">                         
                        <label className="block text-sm font-medium text-gray-700">
                            Nomor Kartu Kredit *
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={19}
                            placeholder="1234 5678 9012 3456"
                            value={cardData.number}
                            onChange={(e) => setCardData(p => ({ ...p, number: e.target.value.replace(/[^0-9\s]/g, '').slice(0, 19) }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                            Exp. Bulan (MM) *
                            </label>
                            <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            placeholder="MM"
                            value={cardData.expMonth}
                            onChange={(e) => setCardData(p => ({ ...p, expMonth: e.target.value.replace(/[^0-9]/g, '').slice(0, 2) }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                            Exp. Tahun (YYYY) *
                            </label>
                            <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="YYYY"
                            value={cardData.expYear}
                            onChange={(e) => setCardData(p => ({ ...p, expYear: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            CVV *
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="CVV"
                            value={cardData.cvv}
                            onChange={(e) => setCardData(p => ({ ...p, cvv: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                        />
                        </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    {payType === "automatic" && payMethod !== "card" && (
                         <>
                            <label className="block text-sm font-medium text-gray-700">
                                Payment Channel{payType === "automatic" ? " *" : ""}
                            </label>
                            <PaymentChannelSelect
                                mode={payType}
                                method={payMethod}
                                value={payChannel}
                                onChange={setPayChannel}
                            />
                         </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ringkasan Biaya */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4">
                Ringkasan Booking Fee
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Booking Fee ({cartItems.length} Properti)
                  </span>
                  <span className="font-semibold">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Pembayaran Awal</span>
                    <span style={{ color: PRIMARY_COLOR }}>
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <ShieldCheck className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                  <span>Pembayaran Booking Fee 100% aman</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Home className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                  <span>Properti akan segera dikunci untuk Anda</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={
                  isCheckingOut ||
                  isSubmitting ||
                  cartItems.length === 0 ||
                  !contactInfo.fullName ||
                  !isPhoneValid ||
                  (payType === "automatic" && payMethod === "card" && !validateCardData(cardData)) ||
                  (payType === "automatic" && payMethod !== "card" && (!payMethod || !payChannel))
                }
                className="w-full text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                {isCheckingOut || isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses Booking...
                  </>
                ) : payType === "manual" ? (
                  <>
                    <Upload className="w-5 h-5" />
                    Buat Booking (Transfer Manual)
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Lanjut ke Pembayaran Booking
                  </>
                )}
              </button>
              {cartItems.length > 1 && (
                 <p className="text-red-500 text-sm text-center mt-3">
                    Perhatian: Hanya properti pertama di keranjang yang akan diproses sebagai booking.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}