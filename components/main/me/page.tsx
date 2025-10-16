"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  MapPin,
  Package,
  BarChart3,
  LogOut,
  Edit3,
  Plus,
  Trash2,
  Eye,
  Star,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  Camera,
  CreditCard,
  Truck,
  Download,
  Home, // Icon untuk Dashboard/Properti
  Heart, // Icon untuk Wishlist
  ShieldCheck, // Icon untuk Verifikasi
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import {
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from "@/services/auth.service";

import {
  useGetUserAddressListQuery,
  useGetUserAddressByIdQuery,
  useCreateUserAddressMutation,
  useUpdateUserAddressMutation,
  useDeleteUserAddressMutation,
} from "@/services/address.service";

import {
  useGetProvincesQuery,
  useGetCitiesQuery,
  useGetDistrictsQuery,
} from "@/services/shop/open-shop/open-shop.service";

import {
  useGetTransactionListQuery,
  useGetTransactionByIdQuery,
} from "@/services/admin/transaction.service";

import Swal from "sweetalert2";
import { mapTxnStatusToOrderStatus } from "@/lib/status-order";
import type { Address as UserAddress } from "@/types/address";
import { ROResponse, toList, findName } from "@/types/geo";
import type { Region } from "@/types/shop";

import ProfileEditModal from "../profile-page/edit-modal";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import OrderDetailModal from "./order-detail-modal";
// import DaftarAnggotaModal from "./daftar-anggota-modal"; // DIHAPUS
// import DaftarSellerModal from "./daftar-seller-modal"; // DIHAPUS
import PaymentProofModal from "./payment-proof-modal";

import {
  ApiTransaction,
  ApiTransactionDetail,
  Order,
  OrderItem,
  UserProfile,
  pickImageUrl,
  DEFAULT_AVATAR,
  normalizeUrl,
  getStatusColor,
  getStatusText,
} from "./types";

import useUploadPaymentProofMutation from "./use-upload-payment-proof";
import {
  ApiEnvelope,
  ApiTransactionByIdData,
  isApiEnvelope,
  isTxnByIdData,
} from "./transaction-by-id";
import { Button } from "@/components/ui/button";

// import PPOBOrdersTab from "./ppob/ppob-orders-tab"; // DIHAPUS
// import BankAccountsTab from "./user-bank/bank-accounts-tab"; // DIHAPUS

// Warna NESTAR Properti
const PRIMARY_COLOR = "#003366"; // Biru Gelap
const ACCENT_COLOR = "#00BFFF"; // Biru Muda
const SECONDARY_TEXT_COLOR = "#4A5568"; // Abu-abu gelap

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [logoutReq, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [updateCurrentUser, { isLoading: isUpdatingProfile }] =
    useUpdateCurrentUserMutation();
  const [isPrefillingProfile, setIsPrefillingProfile] = useState(false);

  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    imageFile: File | null;
  }>({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    imageFile: null,
  });

  // Order detail & payment proof modals
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [paymentProofModalOpen, setPaymentProofModalOpen] = useState(false);

  // Tabs - Menghilangkan tab Koperasi/Marketplace/Bank/PPOB
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "profile" | "addresses" | "orders" | "wishlist"
  >("dashboard");

  // Session basics
  const sessionName = useMemo(() => session?.user?.name ?? "User", [session]);
  const sessionEmail = useMemo(
    () => session?.user?.email ?? "user@email.com",
    [session]
  );
  const sessionId = (session?.user as { id?: number } | undefined)?.id;

  // Upload payment proof (manual)
  const { uploadPaymentProof, isLoading: isUploadingProof } =
    useUploadPaymentProofMutation();

  /** ---------------------------------- Transaksi (Booking Properti) ---------------------------------- */
  const { data: txnResp, refetch: refetchTransactions } =
    useGetTransactionListQuery(
      { page: 1, paginate: 10, user_id: sessionId },
      { skip: !sessionId }
    );

  const transactions: ApiTransaction[] = useMemo(
    () => (txnResp?.data as ApiTransaction[]) || [],
    [txnResp]
  );

  const orders: Order[] = useMemo(() => {
    // Interpretasi: Transaction = Booking Properti
    return transactions.map((t) => {
      const items: OrderItem[] = (t.details || []).map((det, idx) => ({
        id: String(det.id ?? `${t.id}-${idx}`),
        name: det.product?.name ?? det.product_name ?? "Properti",
        // Gunakan pickImageUrl, tetapi asumsikan gambar properti
        image: pickImageUrl(det as ApiTransactionDetail),
        quantity: det.quantity ?? 1,
        price: det.price ?? 0,
      }));
      return {
        id: String(t.id),
        orderNumber: t.reference || `BOOK-${String(t.id)}`,
        date: t.created_at || new Date().toISOString(),
        status: mapTxnStatusToOrderStatus(t.status),
        total: t.total ?? 0,
        grand_total: t.grand_total ?? 0,
        items,
        trackingNumber: (t as { tracking_number?: string }).tracking_number,
        payment_method: t.payment_method,
        payment_proof: t.payment_proof,
        shipment_cost: t.shipment_cost,
        cod: t.cod,
        discount_total: t.discount_total,
        address_line_1: t.address_line_1,
        postal_code: t.postal_code,
      };
    });
  }, [transactions]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((o) => o.id === selectedOrderId) ?? null;
  }, [selectedOrderId, orders]);

  const { data: orderDetailResp, isFetching: isDetailFetching } =
    useGetTransactionByIdQuery(selectedOrderId ?? "", {
      skip: !selectedOrderId,
    });

  type DetailResp =
    | ApiEnvelope<ApiTransactionByIdData>
    | ApiTransactionByIdData
    | undefined;

  const selectedDetail: ApiTransactionByIdData | undefined = useMemo(() => {
    const resp = orderDetailResp as DetailResp;
    if (!resp) return undefined;
    if (isApiEnvelope<ApiTransactionByIdData>(resp)) return resp.data;
    if (isTxnByIdData(resp)) return resp;
    return undefined;
  }, [orderDetailResp]);

  /** ---------------------------------- Address (dipertahankan) ---------------------------------- */
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrEditId, setAddrEditId] = useState<number | null>(null);

  type AddrForm = Partial<Omit<UserAddress, "id">>;
  const [addrForm, setAddrForm] = useState<AddrForm>({
    user_id: sessionId || undefined,
    rajaongkir_province_id: null,
    rajaongkir_city_id: null,
    rajaongkir_district_id: null,
    address_line_1: "",
    address_line_2: "",
    postal_code: "",
    is_primary: false,
  });

  const [createUserAddress, { isLoading: isCreatingAddr }] =
    useCreateUserAddressMutation();
  const [updateUserAddress, { isLoading: isUpdatingAddr }] =
    useUpdateUserAddressMutation();
  const [deleteUserAddress, { isLoading: isDeletingAddr }] =
    useDeleteUserAddressMutation();

  const {
    data: userAddressList,
    refetch: refetchUserAddressList,
    isFetching: isFetchingAddressList,
  } = useGetUserAddressListQuery(
    { page: 1, paginate: 100 },
    { skip: !sessionId }
  );

  const { data: addrDetail } = useGetUserAddressByIdQuery(addrEditId ?? 0, {
    skip: !addrEditId,
  });

  // RO lists
  const { data: provinces } = useGetProvincesQuery();
  const provinceList = toList<Region>(provinces as ROResponse<Region>);

  const provinceIdForAddr = addrForm.rajaongkir_province_id ?? 0;
  const { data: cities } = useGetCitiesQuery(provinceIdForAddr, {
    skip: !addrForm.rajaongkir_province_id,
  });
  const cityList = toList<Region>(cities as ROResponse<Region>);

  const cityIdForAddr = addrForm.rajaongkir_city_id ?? 0;
  const { data: districts } = useGetDistrictsQuery(cityIdForAddr, {
    skip: !addrForm.rajaongkir_city_id,
  });
  const districtList = toList<Region>(districts as ROResponse<Region>);

  // Prefill edit address
  useEffect(() => {
    if (!addrDetail) return;
    setAddrForm({
      user_id: sessionId || undefined,
      rajaongkir_province_id: addrDetail.rajaongkir_province_id ?? null,
      rajaongkir_city_id: addrDetail.rajaongkir_city_id ?? null,
      rajaongkir_district_id: addrDetail.rajaongkir_district_id ?? null,
      address_line_1: addrDetail.address_line_1 ?? "",
      address_line_2: addrDetail.address_line_2 ?? "",
      postal_code: addrDetail.postal_code ?? "",
      is_primary: Boolean(addrDetail.is_primary),
    });
  }, [addrDetail, sessionId]);

  const openCreateAddress = () => {
    setAddrEditId(null);
    setAddrForm({
      user_id: sessionId || undefined,
      rajaongkir_province_id: null,
      rajaongkir_city_id: null,
      rajaongkir_district_id: null,
      address_line_1: "",
      address_line_2: "",
      postal_code: "",
      is_primary: false,
    });
    setAddrModalOpen(true);
  };

  const openEditAddress = (id: number) => {
    setAddrEditId(id);
    setAddrModalOpen(true);
  };

  const handleDeleteAddressApi = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus address ini?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: PRIMARY_COLOR,
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          await deleteUserAddress(id).unwrap();
          await refetchUserAddressList();
        } catch (e) {
          console.error(e);
          Swal.showValidationMessage("Gagal menghapus address.");
          throw e;
        }
      },
    });

    if (result.isConfirmed) {
      await Swal.fire("Terhapus!", "Alamat berhasil dihapus.", "success");
    }
  };

  const handleSubmitAddress = async () => {
    if (!addrForm.user_id) {
      Swal.fire("Info", "Session user belum tersedia.", "info");
      return;
    }
    try {
      if (addrEditId) {
        await updateUserAddress({ id: addrEditId, payload: addrForm }).unwrap();
      } else {
        await createUserAddress(addrForm).unwrap();
      }
      setAddrModalOpen(false);
      setAddrEditId(null);
      await refetchUserAddressList();
    } catch (e) {
      console.error(e);
      Swal.fire("Gagal", "Tidak dapat menyimpan address.", "error");
    }
  };

  /** ---------------------------------- Profile/User ---------------------------------- */
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id:
      (session?.user as { id?: number } | undefined)?.id?.toString?.() ??
      "user-id",
    anggota: { reference: "" },
    shop: "",
    email_verified_at: "",
    fullName: sessionName,
    email: sessionEmail,
    phone: "",
    birthDate: "1990-05-15",
    image: session?.user?.image || DEFAULT_AVATAR,
    joinDate: "",
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
  });

  useEffect(() => {
    setUserProfile((prev) => ({
      ...prev,
      id:
        (session?.user as { id?: number } | undefined)?.id?.toString?.() ??
        prev.id,
      fullName: sessionName,
      email: sessionEmail,
      image: session?.user?.image || prev.image,
    }));
  }, [sessionName, sessionEmail, session]);

  useEffect(() => {
    if (!transactions.length) return;
    const totalOrders = transactions.length;
    const totalSpent = transactions.reduce(
      (acc, t) => acc + (t.grand_total ?? 0),
      0
    );
    setUserProfile((prev) => ({ ...prev, totalOrders, totalSpent }));
  }, [transactions]);

  const { data: currentUserResp, refetch: refetchCurrentUser } =
    useGetCurrentUserQuery(undefined, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  // ---- Derive anggota status (0=PENDING, 1=APPROVED, 2=REJECTED) ----
  // DIHILANGKAN karena Anggota/Koperasi dihapus
  const isAnggotaApproved = true; // Dianggap selalu true/relevan untuk user properti

  // ---- Update Profile State dari API ----
  useEffect(() => {
    const u = currentUserResp;
    if (!u) return;

    const apiImage =
      (u as { image?: string }).image ||
      (u as { media?: Array<{ original_url?: string }> }).media?.[0]
        ?.original_url ||
      "";

    setUserProfile((prev) => ({
      ...prev,
      id: String(u.id ?? prev.id),
      fullName: u.name ?? prev.fullName,
      email: u.email ?? prev.email,
      phone: u.phone ?? prev.phone,
      joinDate: u.created_at ?? prev.joinDate,
      image: apiImage || prev.image,
    }));
  }, [currentUserResp]);

  const openEditProfileModal = async () => {
    setIsPrefillingProfile(true);
    try {
      const result = await refetchCurrentUser();
      const u = result.data ?? currentUserResp;

      setProfileForm({
        name: u?.name ?? userProfile.fullName ?? "",
        email: u?.email ?? userProfile.email ?? "",
        phone: u?.phone ?? userProfile.phone ?? "",
        password: "",
        password_confirmation: "",
        imageFile: null,
      });

      setProfileModalOpen(true);
    } finally {
      setIsPrefillingProfile(false);
    }
  };

  const handleSubmitProfile = async () => {
    try {
      const fd = new FormData();
      fd.append("name", profileForm.name ?? "");
      fd.append("email", profileForm.email ?? "");
      fd.append("phone", profileForm.phone ?? "");

      if (profileForm.password) {
        fd.append("password", profileForm.password);
        fd.append(
          "password_confirmation",
          profileForm.password_confirmation || ""
        );
      }
      if (profileForm.imageFile) {
        fd.append("image", profileForm.imageFile);
      }

      await updateCurrentUser(fd).unwrap();
      await refetchCurrentUser();

      setUserProfile((prev) => ({
        ...prev,
        fullName: profileForm.name || prev.fullName,
        email: profileForm.email || prev.email,
        phone: profileForm.phone || prev.phone,
      }));

      setProfileModalOpen(false);
      await Swal.fire("Berhasil", "Profil berhasil diperbarui.", "success");
    } catch (err: unknown) {
      const e = err as FetchBaseQueryError;
      const data = e.data as { message?: string } | undefined;
      const msg = data?.message || "Terjadi kesalahan saat menyimpan profil.";
      Swal.fire("Gagal", msg, "error");
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar dari portal NESTAR Properti?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: PRIMARY_COLOR,
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await logoutReq().unwrap();
      await Swal.fire("Berhasil!", "Anda telah keluar.", "success");
    } catch (e) {
      console.error("Logout API error:", e);
      await Swal.fire("Gagal!", "Terjadi kesalahan saat logout.", "error");
    } finally {
      await signOut({ callbackUrl: "/login" });
    }
  };

  // Avatar handling (fallback)
  const rawAvatar = (userProfile.image ?? "").trim();
  const wantedAvatar = normalizeUrl(rawAvatar);
  const [imgSrc, setImgSrc] = useState<string>(
    wantedAvatar ? wantedAvatar : DEFAULT_AVATAR
  );
  useEffect(() => {
    setImgSrc(wantedAvatar ? wantedAvatar : DEFAULT_AVATAR);
  }, [wantedAvatar]);

  // Helpers for order detail modal
  const openOrderDetailModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setOrderDetailModalOpen(true);
  };
  const closeOrderDetailModal = () => {
    setOrderDetailModalOpen(false);
    setSelectedOrderId(null);
  };

  // Payment proof (manual)
  const openPaymentProofModal = () => setPaymentProofModalOpen(true);
  const closePaymentProofModal = () => setPaymentProofModalOpen(false);

  // Stats Properti yang disesuaikan
  const totalBookings = userProfile.totalOrders;
  const totalWishlistItems = 15; // Placeholder stat

  return (
    <div className="min-h-screen pt-24" style={{ backgroundImage: `linear-gradient(to br, #FFFFFF, ${ACCENT_COLOR}10)` }}>
      <div className="container mx-auto px-6 lg:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image
                    src={imgSrc}
                    alt={userProfile.fullName || "Avatar"}
                    fill
                    className="object-cover rounded-full"
                    onError={() => setImgSrc(DEFAULT_AVATAR)}
                    unoptimized
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: PRIMARY_COLOR }}>
                    <Camera
                      onClick={openEditProfileModal}
                      className="w-3 h-3 text-white cursor-pointer"
                    />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900">
                  {userProfile.fullName}
                </h3>
                <p className="text-sm text-gray-600">{userProfile.email}</p>
              </div>

              {/* Navigasi Profil Properti */}
              <nav className="space-y-2 mb-6">
                {[
                  {
                    id: "dashboard",
                    label: "Dashboard",
                    icon: <BarChart3 className="w-5 h-5" />,
                  },
                  {
                    id: "profile",
                    label: "Profil Akun",
                    icon: <UserIcon className="w-5 h-5" />,
                  },
                  {
                    id: "addresses",
                    label: "Alamat Kontak", // Diubah menjadi Alamat Kontak
                    icon: <MapPin className="w-5 h-5" />,
                  },
                   {
                    id: "wishlist",
                    label: "Wishlist Properti",
                    icon: <Heart className="w-5 h-5" />,
                  },
                  {
                    id: "orders",
                    label: "Riwayat Booking", // Diubah menjadi Riwayat Booking
                    icon: <Home className="w-5 h-5" />,
                  },
                ].map((tab) => {
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`w-full flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-300
                      ${
                        activeTab === tab.id
                          ? "text-white shadow-lg"
                          : "text-gray-700 hover:text-white hover:bg-opacity-80"
                      }`}
                      style={{
                        backgroundColor: activeTab === tab.id ? PRIMARY_COLOR : 'transparent',
                        color: activeTab === tab.id ? 'white' : SECONDARY_TEXT_COLOR
                      }}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                title={isLoggingOut ? "Sedang keluar..." : "Keluar"}
              >
                <LogOut className="w-5 h-5" />
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              
              {/* Dashboard Properti */}
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Ringkasan Properti Anda</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Stat 1: Total Booking */}
                    <div className="rounded-2xl p-6 text-white shadow-lg border" style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Home className="w-6 h-6 text-white" />
                        <span className="font-semibold">Riwayat Booking</span>
                      </div>
                      <div className="text-3xl font-bold">
                        {totalBookings} Transaksi
                      </div>
                      <div className="text-white/80 text-sm">
                        Total properti yang di-booking
                      </div>
                    </div>

                    {/* Stat 2: Total Wishlist */}
                    <div className="rounded-2xl p-6 text-gray-800 shadow-lg border" style={{ backgroundColor: ACCENT_COLOR + '20', borderColor: ACCENT_COLOR }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Heart className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
                        <span className="font-semibold" style={{ color: PRIMARY_COLOR }}>Wishlist</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {totalWishlistItems} Properti
                      </div>
                      <div className="text-gray-600 text-sm">
                        Properti yang tersimpan di daftar favorit
                      </div>
                    </div>
                    
                     {/* Stat 3: Total Pengeluaran / Booking Fee */}
                    <div className="rounded-2xl p-6 text-gray-800 shadow-lg border" style={{ backgroundColor: PRIMARY_COLOR + '10', borderColor: PRIMARY_COLOR + '30' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <CreditCard className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
                        <span className="font-semibold" style={{ color: PRIMARY_COLOR }}>Total Pembayaran</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                         {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(userProfile.totalSpent)}
                      </div>
                      <div className="text-gray-600 text-sm">
                        Total biaya (booking fee & Dp awal)
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Booking Terbaru
                      </h3>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="font-semibold hover:underline"
                        style={{ color: PRIMARY_COLOR }}
                      >
                        Lihat Semua
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Mengubah tampilan Pesanan Terbaru menjadi Booking */}
                      {(orders || []).slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-2xl p-4 hover:border-gray-400 transition-colors cursor-pointer"
                          onClick={() => openOrderDetailModal(order.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                #BOOK-{order.orderNumber}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(order.date).toLocaleDateString(
                                  "id-ID"
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold" style={{ color: PRIMARY_COLOR }}>
                                Rp {order.grand_total.toLocaleString("id-ID")}
                              </div>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">
                             Properti: {order.items[0]?.name ?? 'Nama Properti Tidak Diketahui'}
                          </p>
                        </div>
                      ))}
                      {orders.length === 0 && (
                          <p className="text-gray-500 text-center py-4 border border-dashed rounded-xl">Belum ada riwayat booking properti.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile (dipertahankan, hanya warna disesuaikan) */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Informasi Profil
                      </h2>
                    </div>
                    <button
                      onClick={openEditProfileModal}
                      disabled={isPrefillingProfile}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-2xl font-semibold hover:opacity-90 transition-colors disabled:opacity-60"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      <Edit3 className="w-4 h-4" />
                      {isPrefillingProfile ? "Memuat..." : "Edit"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LabeledInput
                      label="Nama Lengkap"
                      icon={<UserIcon className="w-5 h-5 text-gray-400" />}
                      value={userProfile.fullName}
                      onChange={(v) =>
                        setUserProfile((p) => ({ ...p, fullName: v }))
                      }
                    />
                    <LabeledInput
                      label="Email"
                      type="email"
                      icon={<Mail className="w-5 h-5 text-gray-400" />}
                      value={userProfile.email}
                      onChange={(v) =>
                        setUserProfile((p) => ({ ...p, email: v }))
                      }
                    />
                    <LabeledInput
                      label="Nomor Telepon"
                      type="tel"
                      icon={<Phone className="w-5 h-5 text-gray-400" />}
                      value={userProfile.phone}
                      onChange={(v) =>
                        setUserProfile((p) => ({ ...p, phone: v }))
                      }
                    />
                    <LabeledInput
                      label="Tanggal Lahir"
                      type="date"
                      icon={<Calendar className="w-5 h-5 text-gray-400" />}
                      value={userProfile.birthDate}
                      onChange={(v) =>
                        setUserProfile((p) => ({ ...p, birthDate: v }))
                      }
                    />
                  </div>

                  <div className="rounded-2xl p-6" style={{ backgroundColor: ACCENT_COLOR + '10' }}>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Informasi Akun
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Bergabung sejak:</span>
                        <div className="font-semibold text-gray-900">
                          {userProfile.joinDate
                            ? new Date(userProfile.joinDate).toLocaleDateString(
                                "id-ID",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Status Akun:</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            Terverifikasi
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses (Alamat Kontak) - Warna disesuaikan, logika tetap */}
              {activeTab === "addresses" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Alamat Kontak & Tujuan
                      </h2>
                    </div>
                    <button
                      onClick={openCreateAddress}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-2xl font-semibold hover:opacity-90 transition-colors"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Alamat
                    </button>
                  </div>

                  {isFetchingAddressList ? (
                    <div className="text-gray-600">Memuat address...</div>
                  ) : (
                    (() => {
                      const addressData: ReadonlyArray<UserAddress> =
                        userAddressList?.data ?? [];
                      if (addressData.length === 0) {
                        return (
                          <div className="text-gray-600">
                            Belum ada address tersimpan.
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {addressData.map((a) => {
                            const provName = findName(
                              provinceList,
                              a.rajaongkir_province_id
                            );
                            const cityName = findName(
                              cityList,
                              a.rajaongkir_city_id
                            );
                            const distName = findName(
                              districtList,
                              a.rajaongkir_district_id
                            );
                            return (
                              <div
                                key={a.id}
                                className={`border-2 rounded-2xl p-6 transition-all ${
                                  a.is_primary
                                    ? "border-gray-400 bg-gray-100"
                                    : "border-gray-200 hover:border-gray-400/50"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="font-bold text-gray-900">
                                        Alamat
                                      </h3>
                                      {a.is_primary && (
                                        <span className="px-2 py-1 text-white text-xs font-semibold rounded-full" style={{ backgroundColor: PRIMARY_COLOR }}>
                                          Utama
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        openEditAddress(Number(a.id))
                                      }
                                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                      title="Edit address"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteAddressApi(Number(a.id))
                                      }
                                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                      title={
                                        isDeletingAddr
                                          ? "Menghapus..."
                                          : "Hapus address"
                                      }
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="text-sm text-gray-600 mb-4">
                                  <p className="text-gray-800 font-medium">
                                    {a.address_line_1}
                                  </p>
                                  {a.address_line_2 && (
                                    <p>{a.address_line_2}</p>
                                  )}
                                  <p>
                                    {distName ? `${distName}, ` : ""}
                                    {cityName ? `${cityName}, ` : ""}
                                    {provName
                                      ? provName
                                      : `Prov ID ${a.rajaongkir_province_id}`}
                                    {a.postal_code ? `, ${a.postal_code}` : ""}
                                  </p>
                                </div>

                                {!a.is_primary && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await updateUserAddress({
                                          id: Number(a.id),
                                          payload: { is_primary: true },
                                        }).unwrap();
                                        await refetchUserAddressList();
                                      } catch {
                                        Swal.fire(
                                          "Gagal",
                                          "Tidak dapat menjadikan default.",
                                          "error"
                                        );
                                      }
                                    }}
                                    className="text-sm font-semibold hover:underline"
                                    style={{ color: PRIMARY_COLOR }}
                                  >
                                    Jadikan Utama
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}

                  {/* Modal Create / Edit - Warna disesuaikan */}
                  {addrModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => {
                          setAddrModalOpen(false);
                          setAddrEditId(null);
                        }}
                      />
                      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">
                            {addrEditId ? "Edit Alamat" : "Tambah Alamat"}
                          </h3>
                          <button
                            onClick={() => {
                              setAddrModalOpen(false);
                              setAddrEditId(null);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-4">
                          {/* ... Form input fields (dipertahankan, styling fokus di LabeledInput) */}
                           {/* Province */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Provinsi
                                </label>
                                <select
                                    className="w-full border border-gray-200 rounded-2xl px-3 py-2"
                                    value={addrForm.rajaongkir_province_id ?? ""}
                                    onChange={(e) => {
                                        const v = e.target.value
                                            ? Number(e.target.value)
                                            : null;
                                        setAddrForm((p) => ({
                                            ...p,
                                            rajaongkir_province_id: v,
                                            rajaongkir_city_id: null,
                                            rajaongkir_district_id: null,
                                        }));
                                    }}
                                >
                                    <option value="">-- Pilih Provinsi --</option>
                                    {provinceList.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text sm font-semibold text-gray-900 mb-2">
                                    Kota/Kabupaten
                                </label>
                                <select
                                    className="w-full border border-gray-200 rounded-2xl px-3 py-2"
                                    value={addrForm.rajaongkir_city_id ?? ""}
                                    onChange={(e) => {
                                        const v = e.target.value
                                            ? Number(e.target.value)
                                            : null;
                                        setAddrForm((p) => ({
                                            ...p,
                                            rajaongkir_city_id: v,
                                            rajaongkir_district_id: null,
                                        }));
                                    }}
                                    disabled={!addrForm.rajaongkir_province_id}
                                >
                                    <option value="">
                                        -- Pilih Kota/Kabupaten --
                                    </option>
                                    {cityList.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* District */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Kecamatan
                                </label>
                                <select
                                    className="w-full border border-gray-200 rounded-2xl px-3 py-2"
                                    value={addrForm.rajaongkir_district_id ?? ""}
                                    onChange={(e) =>
                                        setAddrForm((p) => ({
                                            ...p,
                                            rajaongkir_district_id: e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        }))
                                    }
                                    disabled={!addrForm.rajaongkir_city_id}
                                >
                                    <option value="">-- Pilih Kecamatan --</option>
                                    {districtList.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Address line 1 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Alamat (Baris 1)
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-2xl px-3 py-2"
                                    value={addrForm.address_line_1 ?? ""}
                                    onChange={(e) =>
                                        setAddrForm((p) => ({
                                            ...p,
                                            address_line_1: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Address line 2 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Alamat (Baris 2) – opsional
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-2xl px-3 py-2"
                                    value={addrForm.address_line_2 ?? ""}
                                    onChange={(e) =>
                                        setAddrForm((p) => ({
                                            ...p,
                                            address_line_2: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Postal code */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Kode Pos
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-2xl px-3 py-2"
                                    value={addrForm.postal_code ?? ""}
                                    onChange={(e) =>
                                        setAddrForm((p) => ({
                                            ...p,
                                            postal_code: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Default */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="is_primary"
                                    type="checkbox"
                                    className="w-4 h-4"
                                    checked={Boolean(addrForm.is_primary)}
                                    onChange={(e) =>
                                        setAddrForm((p) => ({
                                            ...p,
                                            is_primary: e.target.checked,
                                        }))
                                    }
                                />
                                <label
                                    htmlFor="is_primary"
                                    className="text-sm text-gray-800"
                                >
                                    Jadikan address default
                                </label>
                            </div>
                         
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setAddrModalOpen(false);
                              setAddrEditId(null);
                            }}
                            className="px-4 py-2 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            Batal
                          </button>
                          <button
                            onClick={handleSubmitAddress}
                            disabled={isCreatingAddr || isUpdatingAddr}
                            className="px-4 py-2 rounded-2xl text-white font-semibold hover:opacity-90 disabled:opacity-60"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                          >
                            {addrEditId
                              ? isUpdatingAddr
                                ? "Menyimpan..."
                                : "Simpan Perubahan"
                              : isCreatingAddr
                              ? "Menyimpan..."
                              : "Simpan"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Properti (NEW TAB) */}
              {activeTab === "wishlist" && (
                <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
                        <Heart className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Wishlist Properti Favorit
                      </h2>
                    </div>
                    
                    {/* Placeholder Wishlist Content */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                        <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Kelola Properti Impian Anda</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-4">
                            Semua properti yang Anda tandai sebagai favorit akan muncul di sini. Cepat akses, dan pantau perubahan harga atau ketersediaan.
                        </p>
                        <Button className="font-semibold" style={{ backgroundColor: PRIMARY_COLOR }} onClick={() => router.push('/listings')}>
                            <Home className="w-4 h-4 mr-2" />
                            Cari Properti Sekarang
                        </Button>
                    </div>
                </div>
              )}


              {/* Orders (Riwayat Booking) - Warna disesuaikan */}
              {activeTab === "orders" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
                      <Home className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Riwayat Booking Properti
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {(orders || []).map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-2xl p-6 hover:border-gray-400 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              #BOOK-{order.orderNumber}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(order.date).toLocaleDateString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                            <div className="text-right">
                              <div className="font-bold text-xl" style={{ color: PRIMARY_COLOR }}>
                                Rp {order.grand_total.toLocaleString("id-ID")}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4"
                            >
                              <div className="w-16 h-16 relative rounded-xl overflow-hidden">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {/* Qty dihilangkan karena properti biasanya 1 */}
                                  Booking Fee
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">
                                  Rp{" "}
                                  {(item.price * item.quantity).toLocaleString(
                                    "id-ID"
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @Rp {item.price.toLocaleString("id-ID")}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => openOrderDetailModal(order.id)}
                            className="flex items-center gap-2 px-4 py-2 border rounded-2xl hover:bg-gray-100 transition-colors"
                            style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
                          >
                            <Eye className="w-4 h-4" />
                            Detail & Pembayaran
                          </button>
                          {order.status === "delivered" && (
                            <button className="flex items-center gap-2 px-4 py-2 text-white rounded-2xl hover:opacity-90 transition-colors" style={{ backgroundColor: PRIMARY_COLOR }}>
                              <Download className="w-4 h-4" />
                              Dokumen Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {orders.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: PRIMARY_COLOR + '10' }}>
                        <Home className="w-12 h-12" style={{ color: PRIMARY_COLOR }} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Belum Ada Riwayat Booking
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Properti yang Anda tambahkan ke keranjang dan proses pembayarannya akan muncul di sini.
                      </p>
                      <button
                        onClick={() => router.push("/listings")}
                        className="text-white px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition-colors"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                      >
                        Mulai Cari Properti
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setProfileModalOpen(false)}
          />
          <ProfileEditModal
            open={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            values={profileForm}
            onChange={(patch) =>
              setProfileForm((prev) => ({ ...prev, ...patch }))
            }
            onSubmit={handleSubmitProfile}
            isSubmitting={isUpdatingProfile}
          />
        </div>
      )}

      {/* Order Detail Modal (dipertahankan) */}
      {orderDetailModalOpen && selectedOrder && (
        <OrderDetailModal
          open={orderDetailModalOpen}
          onClose={closeOrderDetailModal}
          order={selectedOrder}
          detail={selectedDetail}
          detailLoading={isDetailFetching}
          onOpenUploadProof={openPaymentProofModal}
        />
      )}

      {/* Payment Proof Upload (dipertahankan) */}
      <PaymentProofModal
        open={paymentProofModalOpen}
        onClose={closePaymentProofModal}
        transactionId={selectedOrderId}
        onUploaded={async () => {
          closePaymentProofModal();
          closeOrderDetailModal();
          await refetchTransactions();
        }}
        uploadFn={uploadPaymentProof}
        isUploading={isUploadingProof}
      />
    </div>
  );
}

/* --------------------------------- tiny UI helper (styling disesuaikan) --------------------------------- */
function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "tel" | "date";
  icon: React.ReactNode;
}) {
    const PRIMARY_COLOR = "#003366"; // Pastikan warna terdefinisi
    
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
        />
      </div>
    </div>
  );
}