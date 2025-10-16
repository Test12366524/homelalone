"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, CreditCard, ShoppingCart } from "lucide-react";
import {
  useGetDashboardHeadQuery,
  useGetTransactionChartQuery,
  useGetTopSellersQuery,
  useGetTopProductsQuery,
} from "@/services/dashboard-marketplace.service";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

/* ===================== Utils ===================== */
const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("IDR", "")
    .trim();

const formatNumber = (num: number): string =>
  new Intl.NumberFormat("id-ID").format(num);

const last12MonthLabels = (): string[] => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString("id-ID", { month: "short", year: "2-digit" }));
  }
  return labels;
};

export default function MarketplaceDashboardPage() {
  // Get current year for API call
  const currentYear = new Date().getFullYear();

  // API calls
  const { data: dashboardHead, isLoading: isLoadingHead } = useGetDashboardHeadQuery();
  const { data: transactionChart, isLoading: isLoadingChart } = useGetTransactionChartQuery({ year: currentYear });
  const { data: topProducts, isLoading: isLoadingProducts } = useGetTopProductsQuery();

  // Labels 12 bulan
  const labels = useMemo(last12MonthLabels, []);

  // Process transaction chart data
  const monthlyGMV = useMemo(() => {
    if (!transactionChart) return Array(12).fill(0);
    return transactionChart.map(item => item.total_transaction);
  }, [transactionChart]);

  const monthlyOrders = useMemo(() => {
    if (!transactionChart) return Array(12).fill(0);
    return transactionChart.map(item => item.total_order);
  }, [transactionChart]);


  // Process top products data (limit to 5)
  const top5Product = useMemo(() => {
    if (!topProducts) return [];
    return topProducts.slice(0, 5);
  }, [topProducts]);

  // Ringkasan from API
  const totalCustomer = dashboardHead?.total_customer || 0;
  const totalSeller = dashboardHead?.total_seller || 0;
  const totalTransaksi = dashboardHead?.total_transaction || 0;
  const totalOrder = dashboardHead?.total_order || 0;

  const cards = [
    {
      title: "Total Customer",
      value: formatNumber(totalCustomer),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Transaksi",
      value: formatRupiah(totalTransaksi),
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Total Order",
      value: formatNumber(totalOrder),
      icon: ShoppingCart,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ] as const;

  /* ===================== Chart.js datasets & options (typed) ===================== */
  // Line: GMV & Orders (dual axis)
  const transaksiData: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "GMV (Rp)",
        data: monthlyGMV,
        borderColor: "rgba(59,130,246,1)", // blue-500
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.35,
        pointRadius: 2,
        fill: true,
        yAxisID: "y", // rupiah
      },
      {
        label: "Order (Qty)",
        data: monthlyOrders,
        borderColor: "rgba(16,185,129,1)", // emerald-500
        backgroundColor: "rgba(16,185,129,0.15)",
        tension: 0.35,
        pointRadius: 2,
        fill: false,
        yAxisID: "y1", // quantity
      },
    ],
  };

  const transaksiOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">): string => {
            const v = ctx.parsed.y ?? 0;
            const label = ctx.dataset.label ?? "Data";
            if (ctx.dataset.yAxisID === "y") {
              return `${label}: Rp ${formatNumber(v)}`;
            }
            return `${label}: ${formatNumber(v)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: "left",
        ticks: {
          callback: (tickValue: string | number): string =>
            `Rp ${formatNumber(Number(tickValue))}`,
        },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (tickValue: string | number): string =>
            `${formatNumber(Number(tickValue))}`,
        },
      },
    },
  };

  const topSellerOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">): string =>
            `Rp ${formatNumber(Number(ctx.parsed.x))}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (tickValue: string | number): string =>
            `Rp ${formatNumber(Number(tickValue))}`,
        },
      },
    },
  };

  // Bar: Top 5 Produk (horizontal)
  const topProdukData: ChartData<"bar"> = {
    labels: top5Product.map((p) => p.name),
    datasets: [
      {
        label: "GMV (Rp)",
        data: top5Product.map((p) => p.amount),
        backgroundColor: "rgba(234,88,12,0.6)", // orange-600
        borderColor: "rgba(234,88,12,1)",
        borderWidth: 1,
      },
    ],
  };

  const topProdukOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">): string =>
            `Rp ${formatNumber(Number(ctx.parsed.x))}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (tickValue: string | number): string =>
            `Rp ${formatNumber(Number(tickValue))}`,
        },
      },
    },
  };

  // Loading state
  const isLoading = isLoadingHead || isLoadingChart || isLoadingProducts;

  /* ===================== Render ===================== */
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Informasi dan Grafik
          </h1>
          <p className="text-sm text-gray-500">
            Ringkasan customer, seller, transaksi, dan order
          </p>
        </div>
        
        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gray-200">
                    <div className="h-4 w-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-6 w-16 bg-gray-200 rounded mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
          <Card className="h-80 2xl:col-span-3">
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="h-[260px]">
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>

          <Card className="h-80">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="h-[260px]">
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>

          <Card className="h-80">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="h-[260px]">
              <div className="h-full bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Informasi dan Grafik
        </h1>
        <p className="text-sm text-gray-500">
          Ringkasan customer, seller, transaksi, dan order
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card
              key={i}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${c.bg}`}>
                    <Icon className={`h-4 w-4 ${c.color}`} />
                  </div>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {c.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900 mt-[-25px] text-center">
                  {c.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <Card className="h-80 2xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Grafik Transaksi (12 bulan berjalan)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <Line data={transaksiData} options={transaksiOptions} />
          </CardContent>
        </Card>

        <Card className="h-80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Grafik Top 5 Produk
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            {top5Product.length > 0 ? (
              <Bar data={topProdukData} options={topProdukOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Tidak ada data produk</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}