"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Maximize2, Minimize2 } from "lucide-react";
import { useGetProductListQuery } from "@/services/product.service";
import {
  useGetPosAnggotaQuery,
  useCreatePosTransactionMutation,
  useGetPosTransactionByIdQuery, // ⬅️ tambahkan
} from "@/services/pos-kasir.service";
import type {
  CreatePosTransactionRequest,
  PaymentChannel,
  PaymentMethod,
  PosTransaction,
} from "@/types/admin/pos-kasir";
import ProductGrid from "@/components/pos-kasir/product-grid";
import CartPanel from "@/components/pos-kasir/cart-panel";
import PaymentForm from "@/components/pos-kasir/payment-form";
import { showPaymentInstruction } from "@/lib/show-payment-instructions";

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  category_name: string;
  quantity: number;
}

export default function KasirPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [formData, setFormData] = useState({
    payment_type: "manual" as "automatic" | "manual" | "saldo",
    payment_method: undefined as PaymentMethod | undefined,
    payment_channel: undefined as PaymentChannel | undefined,

    user_id: "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    wallet_id: "",
    status: 0,
    voucher: [] as number[],
  });

  // ⬇️ state untuk follow-up GET by id
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [hasShownInstruction, setHasShownInstruction] = useState(false);

  // API
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductListQuery({ page: 1, paginate: 100 });
  const { data: anggotaData } = useGetPosAnggotaQuery({
    page: 1,
    paginate: 100,
  });
  const [createTransaction, { isLoading: isCreating }] =
    useCreatePosTransactionMutation();

  // GET detail transaksi untuk menangkap payment yang muncul belakangan
  const { data: createdDetail } = useGetPosTransactionByIdQuery(
    createdId as number,
    {
      skip: createdId === null,
      pollingInterval: createdId ? 1200 : 0,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    }
  );

  // guard: hentikan polling otomatis setelah 15s
  useEffect(() => {
    if (!createdId) return;
    const t = setTimeout(() => setCreatedId(null), 15000);
    return () => clearTimeout(t);
  }, [createdId]);

  // jika payment sudah ada di GET by id → tampilkan instruksi sekali
  useEffect(() => {
    if (!createdId) return;
    const payment = createdDetail?.data?.payment;
    if (payment && !hasShownInstruction) {
      (async () => {
        await showPaymentInstruction(payment);
        setHasShownInstruction(true);
        setCreatedId(null); // stop polling
      })();
    }
  }, [createdDetail?.data?.payment, createdId, hasShownInstruction]);

  const products = useMemo(
    () => (Array.isArray(productsData?.data) ? productsData!.data : []),
    [productsData?.data]
  );
  const anggota = useMemo(
    () =>
      Array.isArray(anggotaData?.data?.data) ? anggotaData!.data.data : [],
    [anggotaData?.data?.data]
  );

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (searchTerm)
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (selectedCategory && selectedCategory !== "all")
      filtered = filtered.filter((p) => p.category_name === selectedCategory);
    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category_name).filter(Boolean))),
    [products]
  );

  const addToCart = (product: {
    id: number;
    name: string;
    price: number;
    category_name: string;
  }) => {
    setCartItems((prev) => {
      const exists = prev.find((x) => x.product_id === product.id);
      if (exists) {
        return prev.map((x) =>
          x.product_id === product.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          category_name: product.category_name,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: number) =>
    setCartItems((prev) => prev.filter((x) => x.product_id !== productId));

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCartItems((prev) =>
      prev.map((x) => (x.product_id === productId ? { ...x, quantity } : x))
    );
  };

  const getTotalAmount = () =>
    cartItems.reduce((t, x) => t + x.price * x.quantity, 0);

  const toggleFullscreen = useCallback(() => setIsFullscreen((s) => !s), []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [toggleFullscreen]);

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      void Swal.fire("Error", "Tidak ada produk yang ditambahkan", "error");
      return;
    }

    try {
      const payload: CreatePosTransactionRequest = {
        user_id: formData.user_id || undefined,
        guest_name: formData.guest_name || undefined,
        guest_email: formData.guest_email || undefined,
        guest_phone: formData.guest_phone || undefined,
        payment_type: formData.payment_type,
        payment_method:
          formData.payment_type === "automatic"
            ? formData.payment_method
            : undefined,
        payment_channel:
          formData.payment_type === "automatic"
            ? formData.payment_channel
            : undefined,
        wallet_id:
          formData.payment_type === "saldo" && formData.wallet_id
            ? parseInt(formData.wallet_id)
            : undefined,
        status: formData.status,
        data: [
          {
            shop_id: 1,
            details: cartItems.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
            })),
          },
        ],
        voucher: formData.voucher.length ? formData.voucher : undefined,
      };

      const resp = await createTransaction(payload).unwrap();
      const created: PosTransaction = resp.data;

      if (formData.payment_type === "automatic") {
        if (created.payment) {
          // ⚠️ Tunggu modal instruksi selesai tampil
          await showPaymentInstruction(created.payment);
        } else {
          // payment belum ada → GET by id sampai ada
          setHasShownInstruction(false);
          setCreatedId(created.id);
        }
        // ⛔ Jangan tampilkan Swal "Berhasil" di sini, biar tidak menimpa modal instruksi
      } else {
        // manual / saldo → aman tampilkan success sekarang
        await Swal.fire("Berhasil", "Transaksi berhasil dibuat", "success");
      }

      // reset setelah modal selesai / state diset
      setCartItems([]);
      setFormData({
        payment_type: "manual",
        payment_method: undefined,
        payment_channel: undefined,
        user_id: "",
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        wallet_id: "",
        status: 0,
        voucher: [],
      });
    } catch (error) {
      console.error(error);
      void Swal.fire("Gagal", "Gagal membuat transaksi", "error");
    }
  };

  return (
    <div
      className={`${
        isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"
      } bg-gray-50 transition-all duration-300`}
    >
      {/* Header */}
      <div
        className={`bg-white shadow-sm border-b ${
          isFullscreen ? "sticky top-0 z-10" : ""
        }`}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                POS Kasir
                {isFullscreen && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Fullscreen Mode
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Sistem Point of Sale NESTAR
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-lg font-semibold text-blue-600">
                  {cartItems.reduce((t, i) => t + i.quantity, 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-semibold text-green-600">
                  Rp {getTotalAmount().toLocaleString("id-ID")}
                </p>
              </div>
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    Minimize
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    Fullscreen
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        className={`${
          isFullscreen ? "p-4 h-[calc(100vh-80px)] overflow-y-auto" : "p-6"
        }`}
      >
        <div
          className={`grid grid-cols-1 xl:grid-cols-12 gap-6 ${
            isFullscreen ? "min-h-full" : ""
          }`}
        >
          <div className="xl:col-span-7">
            <Card className="shadow-lg">
              <CardContent className="p-6 h-full flex flex-col">
                <ProductGrid
                  isLoading={isLoadingProducts}
                  products={filteredProducts}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onAdd={addToCart}
                  totalVisible={filteredProducts.length}
                />
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-5 space-y-6">
            <CartPanel
              cartItems={cartItems}
              onRemove={removeFromCart}
              onUpdateQty={updateQuantity}
              total={getTotalAmount()}
            />
            <PaymentForm
              formData={formData}
              setFormData={setFormData}
              anggota={anggota}
              disabled={isCreating || cartItems.length === 0}
              onSubmit={handleOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}