"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  ShoppingCart,
  Users,
  Package,
  Tag,
  BookDashed,
  Landmark,
  FileText,
  LineChart,
  ClipboardList,
  Settings,
  UserCheck,
  GalleryVertical,
  Newspaper,
  BookUser,
  CreditCard,
  Building,
  Webhook,
  FileStack,
  SmartphoneNfc,
} from "lucide-react";
import Header from "@/components/admin-components/header";
import Sidebar from "@/components/admin-components/sidebar";
import { AdminLayoutProps, MenuItem } from "@/types";
import { FaMoneyBillWave, FaCoins } from "react-icons/fa";
import { useSession } from "next-auth/react";
import type { User } from "@/types/user";
import ClientAuthGuard from "@/components/client-guards";

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user as User | undefined;

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ============
  // SOURCE OF TRUTH: Semua menu lengkap (superadmin)
  // ============
  const superadminMenuItems: MenuItem[] = [
    // --- Koperasi ---
    {
      id: "dashboard-marketplace",
      label: "Dashboard",
      icon: <BookDashed className="h-5 w-5" />,
      href: "/admin/dashboard-marketplace",
    },
    // {
    //   id: "seller",
    //   label: "Seller",
    //   icon: <UserCheck className="h-5 w-5" />,
    //   href: "/admin/seller",
    // },
    {
      id: "product-marketplace",
      label: "Produk",
      icon: <Package className="h-5 w-5" />,
      href: "/admin/product-list",
    },
    {
      id: "transaction-marketplace",
      label: "Transaksi",
      icon: <ShoppingCart className="h-5 w-5" />,
      href: "/admin/transaction",
    },
    // {
    //   id: "ppob",
    //   label: "PPOB",
    //   icon: <SmartphoneNfc className="h-5 w-5" />,
    //   href: "#",
    //   children: [
    //     {
    //       id: "ppob/transaksi",
    //       label: "Transaksi",
    //       href: "/admin/ppob/transaksi",
    //     },
    //     {
    //       id: "ppob/deposit",
    //       label: "Deposit Saldo",
    //       href: "/admin/ppob/deposit",
    //     },
    //     {
    //       id: "ppob/product",
    //       label: "Produk PPOB",
    //       href: "/admin/ppob/product",
    //     },
    //     {
    //       id: "ppob/category",
    //       label: "Kategori Produk PPOB",
    //       href: "/admin/ppob/category",
    //     },
    //   ],
    // },
    // {
    //   id: "stock-opname",
    //   label: "Stock Opname",
    //   icon: <Package className="h-5 w-5" />,
    //   href: "/admin/stock-opname",
    // },
    // {
    //   id: "pengadaan",
    //   label: "Pengadaan",
    //   icon: <Package className="h-5 w-5" />,
    //   href: "/admin/pengadaan",
    // },
    // {
    //   id: "pos-kasir",
    //   label: "Pos Kasir",
    //   icon: <CreditCard className="h-5 w-5" />,
    //   href: "#",
    //   children: [
    //     {
    //       id: "pos-kasir/kasir",
    //       label: "Kasir",
    //       href: "/admin/pos-kasir/kasir",
    //     },
    //     {
    //       id: "pos-kasir/history",
    //       label: "History",
    //       href: "/admin/pos-kasir/history",
    //     },
    //   ],
    // },
    {
      id: "customer-marketplace",
      label: "Data Customer",
      icon: <BookUser className="h-5 w-5" />,
      href: "/admin/customer",
    },
    {
      id: "voucher",
      label: "Voucher",
      icon: <Tag className="h-5 w-5" />,
      href: "/admin/voucher",
    },
    {
      id: "master-marketplace",
      label: "Master",
      icon: <Database className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "master-product-category-marketplace",
          label: "Kategori Produk",
          href: "/admin/product-category",
        },
        {
          id: "master-product-merk-marketplace",
          label: "Tipe Produk",
          href: "/admin/product-merk",
        },
        // {
        //   id: "master-supplier-marketplace",
        //   label: "Supplier",
        //   href: "/admin/master/supplier",
        // },
      ],
    },
    // {
    //   id: "profile-toko",
    //   label: "Profile Toko",
    //   icon: <Building className="h-5 w-5" />,
    //   href: "/admin/profile-toko",
    // },

    // --- Konten Website ---
    {
      id: "pemisah-konten-website",
      label: "Konten Website",
      isSeparator: true,
      href: "#",
    },
    {
      id: "home",
      label: "Home",
      icon: <Webhook className="h-5 w-5" />,
      href: "/admin/home",
    },
    {
      id: "tentang-kami",
      label: "Tentang Kami",
      icon: <FileStack className="h-5 w-5" />,
      href: "/admin/tentang-kami",
    },
    {
      id: "gallery",
      label: "Galeri",
      icon: <GalleryVertical className="h-5 w-5" />,
      href: "/admin/gallery",
    },
    {
      id: "news",
      label: "Berita",
      icon: <Newspaper className="h-5 w-5" />,
      href: "/admin/news",
    },
  ];

  // ============
  // Helpers filtering
  // ============
  const byId = new Map<string, MenuItem>(
    superadminMenuItems.map((i) => [i.id, i])
  );

  const cloneWithFilteredChildren = (
    item: MenuItem,
    excludeChildIds: Set<string>
  ): MenuItem => {
    const cloned: MenuItem = { ...item };
    if (item.children && item.children.length) {
      cloned.children = item.children.filter((c) => !excludeChildIds.has(c.id));
    }
    return cloned;
  };

  const filterByExclude = (
    excludeRootIds: Set<string>,
    excludeChildIds: Set<string>
  ): MenuItem[] => {
    return superadminMenuItems
      .filter((it) => !excludeRootIds.has(it.id))
      .map((it) => cloneWithFilteredChildren(it, excludeChildIds));
  };

  const pickByInclude = (
    includeRootIds: string[],
    excludeChildIds: Set<string>
  ): MenuItem[] => {
    const result: MenuItem[] = [];
    for (const id of includeRootIds) {
      const base = byId.get(id);
      if (!base) continue;
      result.push(cloneWithFilteredChildren(base, excludeChildIds));
    }
    return result;
  };

  // Child "master-ish" yang harus disembunyikan untuk role tertentu
  const MASTERISH_CHILD_IDS = new Set<string>([
    "simpanan/kategori",
    "pinjaman/kategori",
    // tambahkan child lain yang kamu anggap master-ish bila perlu
  ]);

  // ============
  // Role resolving
  // ============
  const roleNames =
    (user?.roles ?? []).map((r) => r.name?.toLowerCase?.()) ?? [];
  const hasRole = (name: string) => roleNames.includes(name);

  // Prioritas role (ambil yang paling kuat)
  let effectiveRole:
    | "superadmin"
    | "ketua"
    | "sekretaris"
    | "bendahara"
    | "staff"
    | "anggota_seller"
    | "anggota"
    | "user"
    | "none" = "none";

  if (hasRole("superadmin")) effectiveRole = "superadmin";
  else if (hasRole("ketua")) effectiveRole = "ketua";
  else if (hasRole("sekretaris")) effectiveRole = "sekretaris";
  else if (hasRole("bendahara")) effectiveRole = "bendahara";
  else if (hasRole("staff")) effectiveRole = "staff"; // Admin Input
  else if (hasRole("anggota_seller")) effectiveRole = "anggota_seller";
  else if (hasRole("anggota")) effectiveRole = "anggota";
  else if (hasRole("user")) effectiveRole = "user";
  else effectiveRole = user ? "user" : "none";

  // ============
  // Build menu per role
  // ============
  let menuItems: MenuItem[] = [];

  switch (effectiveRole) {
    case "superadmin": {
      menuItems = superadminMenuItems;
      break;
    }

    // Ketua / Sekretaris / Bendahara: semua akses kecuali master & konfigurasi
    case "ketua":
    case "sekretaris":
    case "bendahara": {
      const excludeRoot = new Set<string>([
        "konfigurasi",
        "master",
        "master-marketplace",
      ]);
      menuItems = filterByExclude(excludeRoot, MASTERISH_CHILD_IDS);
      break;
    }

    // Admin Input (staff): semua akses kecuali master/konfigurasi + tidak bisa lihat akuntansi & laporan
    case "staff": {
      const excludeRoot = new Set<string>([
        "konfigurasi",
        "master",
        "master-marketplace",
        "akuntansi",
        "laporan",
      ]);
      menuItems = filterByExclude(excludeRoot, MASTERISH_CHILD_IDS);
      break;
    }

    // Anggota: semua akses koperasi (lihat data), tidak bisa lihat marketplace
    case "anggota":
    case "user": {
      menuItems = pickByInclude(
        [
          "dashboard",
          "anggota",
          "simpanan",
          "pinjaman",
          "data-keuangan",
          "anggota-meninggal",
          "akuntansi",
          "laporan",
        ],
        MASTERISH_CHILD_IDS
      );
      break;
    }

    // Anggota + Seller: koperasi (lihat data) + marketplace terbatas (toko sendiri)
    case "anggota_seller": {
      menuItems = pickByInclude(
        [
          // koperasi
          "dashboard",
          "anggota",
          "simpanan",
          "pinjaman",
          "data-keuangan",
          "anggota-meninggal",
          "akuntansi",
          "laporan",

          // marketplace terbatas
          "pemisah-marketplace",
          "dashboard-marketplace",
          "product-marketplace",
          "transaction-marketplace",
          "profile-toko",
        ],
        MASTERISH_CHILD_IDS
      );
      break;
    }

    // Tidak ada user: kosongin menu
    case "none":
    default: {
      menuItems = [];
      break;
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={menuItems}
      />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-2">
            <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-2">
              <ClientAuthGuard
                excludedRoutes={["/auth", "/auth/login", "/public", "/"]}
                excludedFetchPrefixes={["/api/auth/", "/auth/"]}
                loginPath="/auth/login"
              />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;