// Header.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo } from "react";
import {
  Menu,
  X,
  User,
  Globe,
  MessageSquare,
  ShoppingBag,
  Home, // Mengganti ShoppingCart dengan Home/Properti
  Calculator, // Mengganti ikon PPOB/Service dengan Kalkulator
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useCart from "@/hooks/use-cart"; // Tetap pertahankan, meskipun tidak digunakan, agar kode mudah dikembalikan
import Image from "next/image";

interface TranslationContent {
  home: string;
  about: string;
  listings: string;
  kpr: string;
  news: string;
  tagline: string;
  switchLanguage: string;
}

interface Translations {
  id: TranslationContent;
  en: TranslationContent;
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { switchLang } = useLanguage();
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Warna NESTAR Properti
  const PRIMARY_COLOR = "#003366"; // Biru Gelap
  const ACCENT_COLOR = "#00BFFF"; // Biru Muda

  // Hapus semua logika dan state Cart karena tidak relevan
  // const cartItems = useCart((s) => s.cartItems);
  // const cartCount = useMemo(() => cartItems.reduce((t, item) => t + item.quantity, 0), [cartItems]);

  const translations: Translations = {
    id: {
      home: "Beranda",
      listings: "Properti Dijual", // Mengganti Products
      kpr: "Simulasi KPR", // Mengganti Service/PPOB
      about: "Tentang Kami",
      news: "Artikel",
      tagline: "NESTAR Properti",
      switchLanguage: "Ganti ke English",
    },
    en: {
      home: "Home",
      listings: "Property Listings",
      kpr: "KPR Simulation",
      about: "About Us",
      news: "Articles",
      tagline: "NESTAR Property",
      switchLanguage: "Switch to Bahasa",
    },
  };

  const t = translations[language];

  // Menu Properti yang Relevan
  const menuItems = [
    { name: t.listings, href: "/product" },
    { name: t.kpr, href: "/kpr-simulation" },
    { name: t.about, href: "/about" },
    { name: t.news, href: "/news" },
  ];

  const menuItemColors = [
    {
      name: t.listings,
      href: "/product",
      hoverBg: "hover:bg-blue-100/50",
      activeBg: "bg-blue-100",
    },
    {
      name: t.kpr,
      href: "/kpr-simulation",
      hoverBg: "hover:bg-blue-100/50",
      activeBg: "bg-blue-100",
    },
    {
      name: t.about,
      href: "/about",
      hoverBg: "hover:bg-blue-100/50",
      activeBg: "bg-blue-100",
    },
    {
      name: t.news,
      href: "/news",
      hoverBg: "hover:bg-blue-100/50",
      activeBg: "bg-blue-100",
    },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("yameiya-language");
      if (savedLanguage === "id" || savedLanguage === "en") {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  const toggleLanguage = () => {
    const newLang = language === "id" ? "en" : "id";
    setLanguage(newLang);
    switchLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("yameiya-language", newLang);
      window.dispatchEvent(
        new CustomEvent("languageChanged", { detail: newLang })
      );
    }
  };

  // Fungsi Cart tidak diperlukan, tapi diubah agar tidak error jika dipanggil
  const handleCartClick = () => {
    router.push("/cart"); // Ganti ke halaman cart
  };

  const handleUserClick = () => {
    if (status === "loading") return;
    if (session?.user) {
      router.push("/me");
    } else {
      router.push("/login");
    }
  };

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-100"
            : "bg-white/90 backdrop-blur-sm shadow-md"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="flex items-center gap-1">
                  {/* Ganti src ke logo properti biru */}
                  <Image
                    src="/nestar.webp"
                    alt="NESTAR Properti"
                    width={50}
                    height={50}
                    className="flex-shrink-0 object-contain"
                  />
                  <div className="hidden sm:flex flex-col leading-tight">
                    <h2 className="text-lg font-semibold text-gray-800">
                      NESTAR
                    </h2>
                    <p className="text-xs text-gray-600 mt-[-5px]">
                      Jembatan Nyaman Menuju Hunian Impian Anda.
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative font-semibold transition-all duration-300 py-3 px-4 rounded-xl ${
                    isActiveLink(item.href)
                      ? "shadow-sm" // Hanya shadow
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  // Terapkan warna Biru Gelap/Muda
                  style={{
                    backgroundColor: isActiveLink(item.href)
                      ? `${ACCENT_COLOR}15`
                      : "",
                    color: isActiveLink(item.href) ? PRIMARY_COLOR : "",
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Language Toggle - Desktop */}
              <button
                onClick={toggleLanguage}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm"
                style={{
                  backgroundColor: `${PRIMARY_COLOR}10`,
                  color: PRIMARY_COLOR,
                }}
                title={t.switchLanguage}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {language.toUpperCase()}
                </span>
              </button>

              {/* User Icon */}
              <button
                onClick={handleUserClick}
                className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-300"
                aria-label="User"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>

              {/* Cart diganti Home/Properti */}
              <button
                onClick={handleCartClick} // Tetap gunakan fungsi ini, isinya sudah diubah
                className="relative p-3 rounded-xl hover:bg-gray-100 transition-all duration-300"
                aria-label="Lihat Properti"
              >
                {/* Mengganti ShoppingCart dengan ikon Home */}
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                {/* Menghilangkan badge cartCount */}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-300"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleMobileMenu}
      >
        <div
          className={`fixed top-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Header */}
          <div
            className="p-6 border-b border-gray-200/50"
            style={{ backgroundImage: `linear-gradient(to right, ${ACCENT_COLOR}10, #FFFFFF10)` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PRIMARY_COLOR }}>
                  <span className="text-white font-bold">N</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">
                    NESTAR
                  </h2>
                  <p className="text-xs text-gray-600/70">{t.tagline}</p>
                </div>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg transition-colors"
                style={{ color: PRIMARY_COLOR }}
                aria-label="Close mobile menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Items */}
          <div className="p-6 space-y-2 flex-1 overflow-y-auto">
            {menuItemColors.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={toggleMobileMenu}
                className={`flex items-center gap-4 p-4 rounded-2xl font-semibold transition-all duration-300 group ${
                  isActiveLink(item.href)
                    ? `${item.activeBg} text-gray-700 border-2 border-gray-300 shadow-md`
                    : `${item.hoverBg} text-gray-700 hover:shadow-sm`
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isMobileMenuOpen
                    ? "slideInRight 0.3s ease-out forwards"
                    : "none",
                }}
              >
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                    isActiveLink(item.href)
                      ? "bg-gray-600"
                      : "bg-gray-300 group-hover:bg-gray-500"
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {isActiveLink(item.href) && (
                  <div className="w-1 h-6 rounded-full shadow-sm" style={{ backgroundColor: PRIMARY_COLOR }} />
                )}
              </Link>
            ))}

            {/* Language Toggle - Mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-4 p-4 w-full rounded-2xl text-gray-700 font-semibold transition-all duration-300 mt-6 border-2 border-gray-300/50"
              style={{ backgroundColor: `${PRIMARY_COLOR}10` }}
            >
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left">{t.switchLanguage}</span>
              <span className="text-sm font-bold text-white px-3 py-1 rounded-lg shadow-md" style={{ backgroundColor: ACCENT_COLOR }}>
                {language === "id" ? "EN" : "ID"}
              </span>
            </button>
          </div>

          {/* Mobile Footer */}
          <div
            className="p-6 border-t border-gray-200/50"
            style={{ backgroundImage: `linear-gradient(to right, ${ACCENT_COLOR}10, #FFFFFF10)` }}
          >
            <div className="flex items-center justify-center gap-4">
              <button
                className="flex-1 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all duration-300 shadow-lg transform hover:scale-[1.02]"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Mulai Cari Properti
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}