"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  ShoppingCart, // Mengganti MapPin
  Eye,
  Star,
  Search,
  Grid3X3,
  List,
  ShieldCheck,
  Home, 
  Phone, // Mengganti Phone di detail dengan ShoppingCart
} from "lucide-react";
import Image from "next/image";
import { Product } from "@/types/admin/product";
import {
  useGetProductListPublicQuery,
  useGetProductBySlugQuery,
} from "@/services/product.service";
import DotdLoader from "@/components/loader/3dot";

// ==== Mengaktifkan kembali Cart
import useCart from "@/hooks/use-cart"; // Diaktifkan kembali

import { useGetPublicProductCategoryListQuery } from "@/services/public/public-category.service";
import { useGetSellerListQuery } from "@/services/admin/seller.service";
import { Combobox } from "@/components/ui/combo-box";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

type ViewMode = "grid" | "list";

// Warna NESTAR Properti
const PRIMARY_COLOR = "#003366"; // Biru Gelap
const ACCENT_COLOR = "#00BFFF"; // Biru Muda
const SECONDARY_TEXT_COLOR = "#4A5568"; // Abu-abu gelap

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const [filter, setFilter] = useState({
    category: "all",
    ageGroup: "all",
    priceRange: "all",
    sort: "featured",
    sellerId: null as number | null,
  });

  const { data: session } = useSession();
  const userRole = session?.user?.roles[0]?.name ?? "";

  // Ambil kategori publik (diinterpretasikan sebagai Tipe Properti/Area)
  const {
    data: categoryResp,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
  } = useGetPublicProductCategoryListQuery({
    page: 1,
    paginate: 100,
  });

  // Ambil data seller (diinterpretasikan sebagai Agen/Developer)
  const { data: sellerResp, isLoading: isSellerLoading } =
    useGetSellerListQuery({ page: 1, paginate: 100 });

  const [sellerQuery, setSellerQuery] = useState("");

  const sellers = useMemo(() => sellerResp?.data ?? [], [sellerResp]);

  const filteredSellers = useMemo(() => {
    const q = sellerQuery.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter((s) => {
      // Mengubah fokus dari Shop Name ke Nama Agen/Developer
      const shopName = s.shop?.name?.toLowerCase() ?? "";
      const name = s.name?.toLowerCase() ?? "";
      const email = s.email?.toLowerCase() ?? "";
      return (
        shopName.includes(q) || name.includes(q) || email.includes(q)
      );
    });
  }, [sellers, sellerQuery]);

  // helper: seller terpilih (Agen/Developer)
  const selectedSeller = useMemo(
    () => sellers.find((s) => s.id === filter.sellerId) ?? null,
    [sellers, filter.sellerId]
  );

  const categoryOptions = useMemo(
    () => categoryResp?.data ?? [],
    [categoryResp]
  );

  // Cart actions diaktifkan kembali
  const { addItem } = useCart();

  // === Pagination from API ===
  const ITEMS_PER_PAGE = 9;

  const {
    data: listResp,
    isLoading,
    isError,
    refetch,
  } = useGetProductListPublicQuery({
    page: currentPage,
    paginate: ITEMS_PER_PAGE,
  });

  const totalPages = useMemo(() => listResp?.last_page ?? 1, [listResp]);
  const products = useMemo(() => listResp?.data ?? [], [listResp]);

  // === Detail by slug (modal) ===
  const {
    data: detailProduct,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGetProductBySlugQuery(selectedSlug ?? "", {
    skip: !selectedSlug,
  });

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // === Add to cart via zustand (digunakan untuk menyimpan properti di keranjang)
  const addToCart = (product: Product) => {
    addItem(product);
    if (typeof window !== "undefined") {
      alert(`Properti "${product.name}" ditambahkan ke keranjang (keranjang properti).`);
      // window.dispatchEvent(new CustomEvent("cartUpdated")); // kompatibel dgn logic globalmu
    }
  };

  const openProductModal = (p: Product) => {
    setSelectedSlug(p.slug);
    setIsModalOpen(true);
  };

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Helpers (dipertahankan)
  const getImageUrl = (p: Product): string => {
    if (typeof p.image === "string" && p.image) return p.image;
    const media = (p as unknown as { media?: Array<{ original_url: string }> })
      .media;
    if (Array.isArray(media) && media.length > 0 && media[0]?.original_url) {
      return media[0].original_url;
    }
    return "/api/placeholder/400/400";
  };

  const toNumber = (val: number | string): number => {
    if (typeof val === "number") return val;
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Logika filter (dipertahankan)
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const selectedShopName = selectedSeller?.shop?.name ?? "";

    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(term) ||
        p.category_name.toLowerCase().includes(term);

      const matchCategory =
        filter.category === "all" || p.category_name === filter.category;

      const price = p.price;
      const matchPrice =
        filter.priceRange === "all" ||
        (filter.priceRange === "under-500jt" && price < 500_000_000) ||
        (filter.priceRange === "500jt-1m" &&
          price >= 500_000_000 &&
          price <= 1_000_000_000) ||
        (filter.priceRange === "above-1m" && price > 1_000_000_000);

      const matchSeller =
        !filter.sellerId ||
        (selectedShopName &&
          p.merk_name &&
          p.merk_name.toLowerCase() === selectedShopName.toLowerCase());

      return matchSearch && matchCategory && matchPrice && matchSeller;
    });
  }, [
    products,
    searchTerm,
    filter.category,
    filter.priceRange,
    filter.sellerId,
    selectedSeller,
  ]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (filter.sort) {
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      case "rating":
        return arr.sort((a, b) => toNumber(b.rating) - toNumber(a.rating));
      case "newest":
        return arr.sort((a, b) => b.id - a.id); 
      default:
        return arr;
    }
  }, [filteredProducts, filter.sort]);

  // === Loading & Error states sederhana (UI tetap) ===
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-3">
            Gagal memuat daftar properti.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl border"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#00336610]">
      {/* ===================== Header / Hero ===================== */}
      <section className="relative pt-24 pb-12 px-6 lg:px-12 overflow-hidden bg-white">
        {/* background aksen (Biru) */}
        <div className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-50" style={{ backgroundColor: `${ACCENT_COLOR}15` }} />
        <div className="absolute top-1/3 right-[-10%] w-[28rem] h-[28rem] rounded-full blur-3xl opacity-40" style={{ backgroundColor: `${PRIMARY_COLOR}10` }} />

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${ACCENT_COLOR}15` }}>
            <ShieldCheck className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
              Properti Terverifikasi
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6">
            Jelajahi Listing{" "}
            <span className="block" style={{ color: PRIMARY_COLOR }}>
              Hunian Impian Anda
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Temukan rumah, apartemen, atau tanah dengan jaminan legalitas dan
            dukungan agen profesional NESTAR.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIMARY_COLOR }} />
              <span>Jaminan Legalitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
              <span>Simulasi KPR Akurat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-black" />
              <span>Agen Berlisensi</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Filters & Search (Properti Theme) ===================== */}
      <section className="px-6 lg:px-12 mb-8">
        <div className="container mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari lokasi, tipe properti, atau developer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              {/* Filters (dipertahankan) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Category (Tipe Properti/Area) */}
                <select
                  value={filter.category}
                  onChange={(e) =>
                    setFilter({ ...filter, category: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 bg-white"
                  style={{ color: SECONDARY_TEXT_COLOR }}
                  disabled={isCategoryLoading}
                >
                  <option value="all">Semua Tipe Properti</option>

                  {isCategoryLoading && (
                    <option value="" disabled>
                      Memuat tipe...
                    </option>
                  )}

                  {!isCategoryLoading &&
                    !isCategoryError &&
                    categoryOptions.map((cat) => (
                      <option key={cat.slug} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                </select>

                {/* Price (Rentang Harga Properti) */}
                <select
                  value={filter.priceRange}
                  onChange={(e) =>
                    setFilter({ ...filter, priceRange: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 bg-white"
                  style={{ color: SECONDARY_TEXT_COLOR }}
                >
                  <option value="all">Semua Harga</option>
                  <option value="under-500jt">Di bawah Rp500 Juta</option>
                  <option value="500jt-1m">Rp500 Juta - Rp1 Miliar</option>
                  <option value="1m-3m">Rp1 Miliar - Rp3 Miliar</option>
                  <option value="above-3m">Di atas Rp3 Miliar</option>
                </select>

                {/* Sort */}
                <select
                  value={filter.sort}
                  onChange={(e) =>
                    setFilter({ ...filter, sort: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 bg-white"
                  style={{ color: SECONDARY_TEXT_COLOR }}
                >
                  <option value="featured">Unggulan (Direkomendasikan)</option>
                  <option value="newest">Listing Terbaru</option>
                  <option value="price-low">Harga: Rendah - Tinggi</option>
                  <option value="price-high">Harga: Tinggi - Rendah</option>
                  <option value="rating">Ulasan Tertinggi</option>
                </select>

                {/* Seller (Agen/Developer Combobox) */}
                <div className="w-72 lg:w-40">
                  <Combobox
                    value={filter.sellerId}
                    onChange={(id) => setFilter({ ...filter, sellerId: id })}
                    onSearchChange={(q) => setSellerQuery(q)}
                    data={filteredSellers}
                    isLoading={isSellerLoading}
                    placeholder="Pilih Agen/Developer"
                    getOptionLabel={(s) =>
                      s.shop?.name
                        ? `${s.shop.name} (ID: ${s.id})`
                        : `${s.name} (Agen)`
                    }
                    buttonClassName="h-12 rounded-xl"
                  />
                </div>

                {/* Reset semua filter */}
                <Button
                  className="h-12"
                  size="lg"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                    setFilter({
                      category: "all",
                      ageGroup: "all",
                      priceRange: "all",
                      sort: "featured",
                      sellerId: null,
                    });
                  }}
                  style={{ backgroundColor: ACCENT_COLOR }} // Biru Muda untuk Reset
                >
                  Reset Filter
                </Button>
              </div>

              {/* View Mode (dipertahankan) */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-xl transition-colors ${
                    viewMode === "grid"
                      ? "text-white shadow-sm"
                      : `text-gray-600 hover:text-gray-800`
                  }`}
                  style={{ backgroundColor: viewMode === "grid" ? PRIMARY_COLOR : 'transparent' }}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-xl transition-colors ${
                    viewMode === "list"
                      ? "text-white shadow-sm"
                      : `text-gray-600 hover:text-gray-800`
                  }`}
                  style={{ backgroundColor: viewMode === "list" ? PRIMARY_COLOR : 'transparent' }}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid / List */}
      <section className="px-6 lg:px-12 pb-12">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            {isLoading ? (
              <div className="w-full flex justify-center items-center min-h-48">
                <DotdLoader />
              </div>
            ) : (
              <p className="text-gray-600">
                Menampilkan {sortedProducts?.length ?? 0} dari{" "}
                {products?.length ?? 0} properti
              </p>
            )}
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {sortedProducts.map((product) => {
                const img = getImageUrl(product);
                const ratingNum = toNumber(product.rating);
                const reviews = product.total_reviews;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
                  >
                    <div className="relative">
                      <Image
                        src={img}
                        alt={product.name}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`p-2 rounded-full shadow-lg transition-colors ${
                            wishlist.includes(product.id)
                              ? "text-white fill-current"
                              : "bg-white text-gray-600 hover:text-gray-800"
                          }`}
                          style={{ backgroundColor: wishlist.includes(product.id) ? PRIMARY_COLOR : 'white' }}
                        >
                          <Heart className={`w-5 h-5`} />
                        </button>
                        <button
                          onClick={() => openProductModal(product)}
                          className="p-2 bg-white text-gray-600 hover:text-gray-800 rounded-full shadow-lg transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <span className="text-xs text-gray-600 font-medium">
                          {product.category_name}
                        </span>
                        <h3 className="text-lg font-bold text-gray-800 mt-1 line-clamp-2">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(ratingNum)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({reviews} ulasan)
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-bold text-gray-800">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {/* PERUBAHAN: Hubungi Agen -> Tambah ke Keranjang */}
                        <button
                          onClick={() => addToCart(product)}
                          className="flex-1 text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                          style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Tambah ke Keranjang
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedProducts.map((product) => {
                const img = getImageUrl(product);
                const ratingNum = toNumber(product.rating);
                const reviews = product.total_reviews;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-80">
                        <Image
                          src={img}
                          alt={product.name}
                          width={400}
                          height={300}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <span className="text-sm text-gray-600 font-medium">
                                {product.category_name}
                              </span>
                              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                {product.name}
                              </h3>
                            </div>
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className={`p-2 rounded-full transition-colors ${
                                wishlist.includes(product.id)
                                  ? "text-white fill-current"
                                  : "bg-gray-100 text-gray-600 hover:text-gray-800"
                              }`}
                              style={{ backgroundColor: wishlist.includes(product.id) ? PRIMARY_COLOR : 'white' }}
                            >
                              <Heart className={`w-5 h-5`} />
                            </button>
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {product.description}
                          </p>

                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.round(ratingNum)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({reviews} ulasan)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-gray-800">
                              Rp {product.price.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => openProductModal(product)}
                              className="px-6 py-3 border border-gray-400 text-gray-600 rounded-2xl hover:bg-gray-400 hover:text-white transition-colors"
                            >
                              Detail Properti
                            </button>
                            {/* PERUBAHAN: Hubungi Agen -> Tambah ke Keranjang */}
                            <button
                              onClick={() => addToCart(product)}
                              className="px-6 py-3 text-white rounded-2xl hover:opacity-90 transition-colors flex items-center gap-2"
                              style={{ backgroundColor: PRIMARY_COLOR }}
                            >
                              <ShoppingCart className="w-5 h-5" />
                              Tambah ke Keranjang
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State (dipertahankan) */}
          {!isLoading && sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Properti tidak ditemukan
              </h3>
              <p className="text-gray-600 mb-6">
                Coba ubah filter atau kata kunci pencarian Anda.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilter({
                    category: "all",
                    ageGroup: "all",
                    priceRange: "all",
                    sort: "featured",
                    sellerId: null,
                  });
                }}
                className="text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-colors"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Pagination (dipertahankan) */}
      {totalPages > 1 && (
        <section className="px-6 lg:px-12 pb-4">
          <div className="container mx-auto">
            <div className="flex justify-center items-center gap-4">
              {/* Previous Button */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-6 py-3 border border-gray-400 text-gray-600 rounded-2xl 
                     hover:text-white transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-12 h-12 rounded-2xl font-semibold transition-colors ${
                        currentPage === page
                          ? "text-white"
                          : "border border-gray-400 text-gray-600 hover:text-white"
                      }`}
                      style={{
                        backgroundColor: currentPage === page ? PRIMARY_COLOR : 'transparent',
                        borderColor: currentPage !== page ? SECONDARY_TEXT_COLOR : PRIMARY_COLOR
                      }}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              {/* Next Button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-6 py-3 border border-gray-400 text-gray-600 rounded-2xl 
                     hover:text-white transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Product Detail Modal (by slug) */}
      {isModalOpen && selectedSlug && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header (dipertahankan) */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Detail Properti
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedSlug(null);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Error/Loading State (dipertahankan) */}
              {isDetailError && (
                <div className="text-red-600">
                  Gagal memuat detail properti.
                </div>
              )}
              {isDetailLoading && (
                <div className="w-full flex justify-center items-center min-h-32">
                  <DotdLoader />
                </div>
              )}

              {/* Content */}
              {detailProduct && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Product Image (dipertahankan) */}
                  <div className="relative">
                    <Image
                      src={getImageUrl(detailProduct)}
                      alt={detailProduct.name}
                      width={500}
                      height={400}
                      className="w-full h-96 object-cover rounded-2xl"
                    />
                  </div>

                  {/* Product Info (dipertahankan) */}
                  <div>
                    <span className="text-sm text-gray-600 font-medium">
                      {detailProduct.category_name}
                    </span>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2 mb-4">
                      {detailProduct.name}
                    </h3>

                    {/* Rating (dipertahankan) */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(toNumber(detailProduct.rating))
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600">
                        ({detailProduct.total_reviews} ulasan)
                      </span>
                    </div>

                    {/* Description (dipertahankan) */}
                    <p className="text-gray-600 mb-6">
                      {detailProduct.description}
                    </p>

                    {/* Meta Info (dipertahankan) */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium">Tipe Properti:</span>
                        <span>{detailProduct.category_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium">Developer/Agen:</span>
                        <span>{detailProduct.merk_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium">Status Legalitas:</span>
                        <span className="font-bold text-green-600">
                            Terverifikasi
                        </span>
                      </div>
                    </div>

                    {/* Price (dipertahankan) */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl font-bold" style={{ color: PRIMARY_COLOR }}>
                        Rp {detailProduct.price.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-3">
                      {/* PERUBAHAN: Hubungi Agen Sekarang -> Tambah ke Keranjang */}
                      <button
                        onClick={() => {
                          addToCart(detailProduct);
                          setIsModalOpen(false);
                          setSelectedSlug(null);
                        }}
                        className="flex-1 text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Tambah ke Keranjang
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}