"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck, // Icon untuk kepercayaan/verifikasi
  Heart,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  ArrowLeft,
  Home, // Icon untuk Properti
  Briefcase, // Icon untuk Agen Profesional
  MapPin, // Icon untuk lokasi/cakupan
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRegisterMutation } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import PolicyModal from "@/components/modals/PolicyModal";
import { useSession, signOut } from "next-auth/react";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

interface ForgotPasswordData {
  email: string;
}

interface OtpFormData {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

// Warna NESTAR Properti
const PRIMARY_COLOR = "#003366"; // Biru Gelap
const ACCENT_COLOR = "#00BFFF"; // Biru Muda

// Konten Kebijakan & Syarat disesuaikan untuk Properti
const TERMS_CONTENT = {
  title: "Syarat & Ketentuan Penggunaan Platform",
  content: (
    <>
      <h3>1. Penerimaan Persyaratan</h3>
      <p>
        Dengan mendaftar dan menggunakan layanan NESTAR (Layanan), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini (Syarat). Layanan ini berfokus pada **jual beli properti, listing terverifikasi, dan layanan agen.**
      </p>

      <h3>2. Verifikasi Properti</h3>
      <p>
        Semua listing properti di NESTAR telah melalui proses verifikasi legalitas dasar. Namun, pembeli tetap diwajibkan melakukan due diligence tambahan. NESTAR tidak bertanggung jawab atas kerugian yang timbul dari kesalahan informasi yang disediakan oleh penjual/agen.
      </p>

      <h3>3. Kewajiban Pengguna</h3>
      <ul>
        <li>Memberikan informasi pribadi yang akurat saat pendaftaran.</li>
        <li>Menjaga kerahasiaan password dan keamanan akun.</li>
        <li>Melakukan komunikasi profesional dan etis dengan agen properti.</li>
        <li>Mematuhi semua hukum dan peraturan yang berlaku terkait transaksi properti.</li>
      </ul>

      <h3>4. Transaksi & KPR</h3>
      <p>
        NESTAR menyediakan simulasi KPR sebagai alat bantu estimasi. Keputusan akhir, suku bunga, dan persetujuan pinjaman sepenuhnya berada di tangan bank mitra yang bersangkutan.
      </p>
    </>
  ),
};

const PRIVACY_POLICY_CONTENT = {
  title: "Kebijakan Privasi Data Properti",
  content: (
    <>
      <h3>1. Informasi yang Kami Kumpulkan</h3>
      <p>
        Kami mengumpulkan informasi yang Anda berikan saat pendaftaran (nama, email, telepon) dan data transaksi (properti yang dicari, preferensi KPR). Kami juga mengumpulkan data listing properti (alamat, spesifikasi) dari agen dan developer.
      </p>

      <h3>2. Bagaimana Kami Menggunakan Informasi Anda</h3>
      <p>
        Informasi Anda digunakan untuk:
      </p>
      <ul>
        <li>Memverifikasi identitas pembeli dan legalitas listing properti.</li>
        <li>Menghubungkan Anda dengan agen properti yang relevan.</li>
        <li>Memproses permohonan simulasi KPR awal.</li>
        <li>Meningkatkan akurasi rekomendasi properti kami.</li>
      </ul>

      <h3>3. Keamanan Data</h3>
      <p>
        Kami menerapkan langkah-langkah keamanan digital standar industri untuk melindungi data sensitif properti dan informasi pribadi Anda dari akses tidak sah.
      </p>
    </>
  ),
};

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const sessionId = (session?.user as { id?: number } | undefined)?.id;

  if (sessionId) {
    router.replace("/me");
  }

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [showOtpForm, setShowOtpForm] = useState<boolean>(false);

  const [modalContent, setModalContent] = useState<{
    title: string;
    content: React.ReactNode;
  } | null>(null);

  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [forgotPasswordData, setForgotPasswordData] =
    useState<ForgotPasswordData>({
      email: "",
    });

  const [otpFormData, setOtpFormData] = useState<OtpFormData>({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [isSendingResetLink, setIsSendingResetLink] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [registerMutation, { isLoading: isRegistering }] =
    useRegisterMutation();

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // ===== Handlers (Logika dipertahankan, hanya pesan error/sukses disesuaikan)
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg(null);

    const newErrors: string[] = [];
    if (!loginData.email) newErrors.push("Email wajib diisi");
    if (!loginData.password) newErrors.push("Password wajib diisi");
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoggingIn(true);
      const res = await signIn("credentials", {
        redirect: false,
        email: loginData.email,
        password: loginData.password,
      });

      if (res?.ok) {
        setSuccessMsg("Berhasil masuk. Mengarahkan ke dashboard properti…");
        router.push("/me");
      } else {
        setErrors(["Gagal masuk. Email atau password tidak cocok."]);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors(["Login gagal. Terjadi masalah koneksi."]);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg(null);

    const newErrors: string[] = [];
    if (!registerData.fullName) newErrors.push("Nama lengkap wajib diisi");
    if (!registerData.email) newErrors.push("Email wajib diisi");
    if (!registerData.phone) newErrors.push("Nomor telepon wajib diisi");
    if (!registerData.password) newErrors.push("Password wajib diisi");
    if (registerData.password !== registerData.confirmPassword)
      newErrors.push("Konfirmasi password tidak sesuai");
    if (!registerData.agreeToTerms)
      newErrors.push("Anda harus menyetujui syarat dan ketentuan properti");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: RegisterPayload = {
      name: registerData.fullName,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password,
      password_confirmation: registerData.confirmPassword,
    };

    try {
      await registerMutation(payload).unwrap();
      setSuccessMsg("Registrasi berhasil! Silakan masuk dan mulai cari rumah.");
      setLoginData((p) => ({ ...p, email: registerData.email }));
      setIsLogin(true);
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } }).data?.message ??
        "Registrasi gagal. Coba lagi.";
      setErrors([msg]);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg(null);

    if (!forgotPasswordData.email) {
      setErrors(["Email wajib diisi"]);
      return;
    }

    // ... (Logika fetch API dipertahankan) ...
    setIsSendingResetLink(true);
    try {
        // GANTI URL API INI jika URL backend properti Anda berbeda
      const response = await fetch(
        "https://cms.yameiyashop.com/api/v1/password/reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgotPasswordData.email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(
          "Kode reset password telah dikirimkan ke email Anda. Silakan periksa inbox dan masukkan kode di bawah."
        );
        setOtpFormData((prev) => ({
          ...prev,
          email: forgotPasswordData.email,
        }));
        setShowForgotPassword(false);
        setShowOtpForm(true);
      } else {
        const message =
          data.message ||
          "Gagal mengirim kode reset. Silakan coba lagi.";
        setErrors([message]);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setErrors(["Terjadi kesalahan saat mengirim permintaan."]);
    } finally {
      setIsSendingResetLink(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg(null);

    const { email, otp, password, confirmPassword } = otpFormData;

    const newErrors: string[] = [];
    if (!otp) newErrors.push("Kode OTP wajib diisi");
    if (!password) newErrors.push("Password baru wajib diisi");
    if (password.length < 8) newErrors.push("Password minimal 8 karakter");
    if (password !== confirmPassword)
      newErrors.push("Konfirmasi password tidak sesuai");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsVerifyingOtp(true);
    try {
        // GANTI URL API INI jika URL backend properti Anda berbeda
      const response = await fetch(
        "https://cms.yameiyashop.com/api/v1/password/reset/validate-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            password,
            password_confirmation: confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(
          "Password berhasil diubah. Silakan masuk dengan password baru Anda."
        );
        setShowOtpForm(false);
        setIsLogin(true);
        setLoginData((prev) => ({ ...prev, email }));
      } else {
        const message =
          data.message || "Gagal mengubah password. Pastikan kode OTP benar.";
        setErrors([message]);
      }
    } catch (err) {
      console.error("OTP validation error:", err);
      setErrors(["Terjadi kesalahan saat memvalidasi OTP."]);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ===== UI Login/Register/Forgot Password (Warna dan Konten Disesuaikan)

  if (showForgotPassword || showOtpForm) {
    // Shared template for Forgot Password and OTP forms
    const title = showForgotPassword ? "Lupa Password?" : "Verifikasi & Atur Ulang Password";
    const subtitle = showForgotPassword 
        ? "Masukkan email Anda untuk mengirimkan kode reset password."
        : "Masukkan kode OTP yang dikirimkan ke email Anda, lalu buat password baru.";

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundImage: `linear-gradient(to br, ${ACCENT_COLOR}20, #FFFFFF20, ${PRIMARY_COLOR}20)` }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: PRIMARY_COLOR }}>
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-gray-600">
              {subtitle}
            </p>
          </div>

          {/* Error/Success Messages (dipertahankan) */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                {/* ... */}
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">
                    Terjadi Kesalahan:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error) => (
                      <li key={error}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800">
              {successMsg}
            </div>
          )}
          
          {/* Form Content (Disambung ke handler yang sama) */}
          <form onSubmit={showForgotPassword ? handleForgotPassword : handleOtpSubmit} className="space-y-6">
            {showForgotPassword ? (
              // Forgot Password Form
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={forgotPasswordData.email}
                    onChange={(e) =>
                      setForgotPasswordData({ email: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                    placeholder="Masukkan email Anda"
                    required
                  />
                </div>
              </div>
            ) : (
              // OTP Form
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Kode OTP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={otpFormData.otp}
                      onChange={(e) =>
                        setOtpFormData((prev) => ({ ...prev, otp: e.target.value }))
                      }
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent text-center font-bold text-lg tracking-[0.25em]"
                      placeholder="------"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={otpFormData.password}
                      onChange={(e) =>
                        setOtpFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="Minimal 8 karakter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={otpFormData.confirmPassword}
                      onChange={(e) =>
                        setOtpFormData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="Ulangi password baru"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                    if (showOtpForm) {
                        setShowOtpForm(false);
                        setShowForgotPassword(true);
                    } else {
                        setShowForgotPassword(false);
                        setErrors([]);
                        setSuccessMsg(null);
                    }
                }}
                className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
              >
                {showOtpForm ? "Kembali (Ganti Email)" : "Batal"}
              </button>
              <button
                type="submit"
                disabled={isSendingResetLink || isVerifyingOtp}
                className="flex-1 text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                {isSendingResetLink ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : isVerifyingOtp ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                  showForgotPassword ? "Kirim Kode Reset" : "Ubah Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Login / Register Form
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundImage: `linear-gradient(to br, ${ACCENT_COLOR}20, #FFFFFF20, ${PRIMARY_COLOR}20)` }}>
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-60 animate-pulse" style={{ backgroundColor: `${ACCENT_COLOR}90` }} />
      <div className="absolute bottom-32 right-16 w-16 h-16 rounded-full opacity-60 animate-pulse delay-1000" style={{ backgroundColor: `${PRIMARY_COLOR}90` }}/>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full opacity-40 animate-pulse delay-500" style={{ backgroundColor: `${ACCENT_COLOR}50` }}/>
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* === Left Panel (Brand Info) === */}
        <div className="p-8 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden" style={{ backgroundColor: PRIMARY_COLOR }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full" style={{ backgroundColor: ACCENT_COLOR }}/>
            <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full" style={{ backgroundColor: ACCENT_COLOR }}/>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full" style={{ backgroundColor: ACCENT_COLOR }}/>
          </div>

          <div className="relative z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="text-white cursor-pointer shadow-lg border-white/20 hover:opacity-90 bg-white/20 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                {/* Ganti src ke logo properti biru */}
                <Image
                  src="/nestar.webp" 
                  alt="NESTAR Properti"
                  width={50}
                  height={50}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  NESTAR
                </h1>
                <p className="text-white/80 text-sm">
                  Jembatan Nyaman Menuju Hunian Impian Anda
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight text-white">
                {isLogin
                  ? "Selamat Datang Kembali!"
                  : "Bergabung dengan Portal Properti"}
              </h2>
              <p className="text-white/80 text-lg">
                {isLogin
                  ? "Masuk untuk melanjutkan pencarian rumah, kelola wishlist, dan hubungi agen."
                  : "Daftar sekarang untuk mendapatkan akses ke ribuan listing terverifikasi dan simulasi KPR akurat."}
              </p>
            </div>

            {/* Benefit Icons Properti */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Home className="w-6 h-6 text-white" />
                <span className="text-white/80">Listing Properti Terverifikasi</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-white" />
                <span className="text-white/80">Akses Agen Profesional</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-white" />
                <span className="text-white/80">Simulasi KPR & Lokasi Akurat</span>
              </div>
            </div>

            {/* Stats Properti */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-white/50 text-sm">Listing Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">250+</div>
                <div className="text-white/50 text-sm">Agen Berlisensi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">9</div>
                <div className="text-white/50 text-sm">Kota Besar</div>
              </div>
            </div>
          </div>
        </div>

        {/* === Right Panel (Form) === */}
        <div className="p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: `${PRIMARY_COLOR}10` }}>
                <ShieldCheck className="w-4 h-4" style={{ color: PRIMARY_COLOR }}/>
                <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
                  {isLogin ? "Masuk Portal" : "Daftar Akun Baru"}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? "Masuk ke Akun Anda" : "Buat Akun Pencari Properti"}
              </h3>
              <p className="text-gray-600">
                {isLogin
                  ? "Akses dashboard properti dan mulai pencarian Anda"
                  : "Lengkapi data di bawah untuk terhubung dengan agen kami"}
              </p>
            </div>

            {/* Error/Success Messages (dipertahankan) */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">
                      Terjadi Kesalahan:
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error) => (
                        <li key={error}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800">
                {successMsg}
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 border-gray-300 rounded focus:ring-blue-600"
                      style={{ color: PRIMARY_COLOR }}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Ingat saya
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setErrors([]);
                      setSuccessMsg(null);
                      setForgotPasswordData({ email: loginData.email });
                    }}
                    className="text-sm hover:underline"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    Lupa password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk ke Portal
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={registerData.fullName}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="Ulangi password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={registerData.agreeToTerms}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        agreeToTerms: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 border-gray-300 rounded focus:ring-blue-600 mt-1"
                    style={{ color: PRIMARY_COLOR }}
                  />
                  <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                      Saya setuju dengan{" "}
                      <button
                        type="button"
                        onClick={() => setModalContent(TERMS_CONTENT)}
                        className="hover:underline font-medium"
                        style={{ color: PRIMARY_COLOR }}
                      >
                        Syarat & Ketentuan
                      </button>{" "}
                      dan{" "}
                      <button
                        type="button"
                        onClick={() => setModalContent(PRIVACY_POLICY_CONTENT)}
                        className="hover:underline font-medium"
                        style={{ color: PRIMARY_COLOR }}
                      >
                        Kebijakan Privasi
                      </button>
                    </label>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  {isRegistering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Daftar Akun Properti
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin((v) => !v);
                    setErrors([]);
                    setSuccessMsg(null);
                  }}
                  className="font-semibold hover:underline"
                  style={{ color: PRIMARY_COLOR }}
                >
                  {isLogin ? "Daftar di sini" : "Masuk di sini"}
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                  <span>Data Terjamin Aman</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                  <span>Listing Terverifikasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PolicyModal
        isOpen={modalContent !== null}
        onClose={() => setModalContent(null)}
        title={modalContent?.title || ""}
      >
        {modalContent?.content}
      </PolicyModal>
    </div>
  );
}