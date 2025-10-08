"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Combobox } from "@/components/ui/combo-box";

type Option = { value: string; label: string };

type ExtraSelect = {
  id: string;
  label: string;
  options: Option[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  value?: string;
};

type SellerLite = {
  id: number;
  name: string;
  email?: string;
  shop?: { name?: string } | null;
  shop_name?: string;
};

/** Tambahan: tipe minimal Supplier untuk combobox */
type SupplierLite = {
  id: number;
  name: string;
};

type Props = {
  openModal?: () => void;
  onSearchChange?: (q: string) => void;

  /** ===== Status filter (opsional) ===== */
  enableStatusFilter?: boolean;
  statusOptions?: Option[];
  initialStatus?: string;
  onStatusChange?: (status: string) => void;

  /** ===== Seller filter (opsional & hanya superadmin) ===== */
  enableSellerFilter?: boolean;
  isSuperAdmin?: boolean;
  sellers?: SellerLite[];
  selectedSellerId?: number | null;
  onSellerChange?: (sellerId: number | null) => void;
  isSellerLoading?: boolean;
  onSellerSearchChange?: (q: string) => void;

  /** ===== Supplier filter (opsional) ===== */
  enableSupplierFilter?: boolean;
  suppliers?: SupplierLite[];
  selectedSupplierId?: number | null; // null = Semua Supplier
  onSupplierChange?: (supplierId: number | null) => void;
  isSupplierLoading?: boolean;
  onSupplierSearchChange?: (q: string) => void;

  /** ===== Tambahan select (opsional) ===== */
  extraSelects?: ExtraSelect[];
  extraNodes?: ReactNode;

  /** ===== Button tambah (opsional) ===== */
  addButtonLabel?: string;

  /** ===== Excel actions (opsional) ===== */
  onImportExcel?: (file: File) => void;
  onExportExcel?: () => void;
  importAccept?: string;
  importLabel?: string;
  exportLabel?: string;
  exportDisabled?: boolean;

  /** ===== Date filter (opsional) ===== */
  enableDateFilter?: boolean;
  initialDateFrom?: Date;
  initialDateTo?: Date;
  onDateRangeChange?: (from?: Date, to?: Date) => void;

  /** ===== Reset (opsional) ===== */
  onResetAllFilters?: () => void;
};

const DEFAULT_STATUS_OPTIONS: Option[] = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "PENDING" },
  { value: "captured", label: "CAPTURED" },
  { value: "settlement", label: "SETTLEMENT" },
  { value: "deny", label: "DENY" },
  { value: "expired", label: "EXPIRED" },
  { value: "cancel", label: "CANCEL" },
];

export function ProdukToolbar({
  openModal,
  onSearchChange,

  // status
  enableStatusFilter = false,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  initialStatus,
  onStatusChange,

  // seller
  enableSellerFilter = false,
  isSuperAdmin = false,
  sellers = [],
  selectedSellerId = null,
  onSellerChange,
  isSellerLoading,
  onSellerSearchChange,

  // supplier (opsional)
  enableSupplierFilter = false,
  suppliers = [],
  selectedSupplierId = null,
  onSupplierChange,
  isSupplierLoading,
  onSupplierSearchChange,

  // extras
  extraSelects = [],
  extraNodes,
  addButtonLabel = "Data",

  // excel
  onImportExcel,
  onExportExcel,
  importAccept = ".xlsx,.xls,.csv",
  importLabel = "Import Excel",
  exportLabel = "Export Excel",
  exportDisabled,

  // date
  enableDateFilter = false,
  initialDateFrom,
  initialDateTo,
  onDateRangeChange,

  // reset
  onResetAllFilters,
}: Props) {
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>(
    initialStatus ?? statusOptions[0]?.value ?? "all"
  );

  const [uncontrolledExtraValues, setUncontrolledExtraValues] = useState<
    Record<string, string>
  >(() =>
    extraSelects.reduce<Record<string, string>>((acc, s) => {
      acc[s.id] = s.defaultValue ?? s.value ?? "";
      return acc;
    }, {})
  );

  // date states
  const [dateFrom, setDateFrom] = useState<Date | undefined>(initialDateFrom);
  const [dateTo, setDateTo] = useState<Date | undefined>(initialDateTo);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (onSearchChange) onSearchChange("");
    if (enableStatusFilter && onStatusChange) onStatusChange(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (enableDateFilter) onDateRangeChange?.(dateFrom, dateTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, enableDateFilter]);

  const getSellerLabel = (s: SellerLite) => {
    const shopName = s.shop?.name ?? s.shop_name;
    if (shopName) return `${shopName} (${s.email ?? s.name})`;
    return `${s.name}${s.email ? ` (${s.email})` : ""}`;
  };

  return (
    <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Kiri: filter */}
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <Input
            placeholder="Cari data..."
            value={search}
            onChange={(e) => {
              const q = e.target.value;
              setSearch(q);
              onSearchChange?.(q);
            }}
            className="w-full sm:max-w-xs h-10"
          />

          {/* Status (opsional) */}
          {enableStatusFilter && (
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                onStatusChange?.(val);
              }}
            >
              <SelectTrigger className="h-12 py-3 w-full sm:w-56">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Seller (opsional & hanya superadmin) */}
          {enableSellerFilter && isSuperAdmin && (
            <div className="w-full sm:w-72">
              <Combobox<SellerLite>
                value={selectedSellerId}
                onChange={(id) => onSellerChange?.(id)}
                onSearchChange={onSellerSearchChange}
                data={sellers}
                isLoading={isSellerLoading}
                placeholder="Pilih Seller"
                getOptionLabel={getSellerLabel}
                buttonClassName="h-10"
              />
            </div>
          )}

          {/* Supplier (opsional) */}
          {enableSupplierFilter && (
            <div className="w-full sm:w-72">
              <Combobox<SupplierLite>
                value={selectedSupplierId}
                onChange={(id) => onSupplierChange?.(id)}
                onSearchChange={onSupplierSearchChange}
                data={suppliers}
                isLoading={isSupplierLoading}
                placeholder="Semua Supplier"
                getOptionLabel={(s) => s.name}
                buttonClassName="h-10"
              />
            </div>
          )}

          {/* Extra selects (opsional) */}
          {extraSelects.map((s) => {
            const currentVal =
              s.value ?? uncontrolledExtraValues[s.id] ?? s.defaultValue ?? "";
            return (
              <Select
                key={s.id}
                value={currentVal}
                onValueChange={(val) => {
                  if (s.value === undefined) {
                    setUncontrolledExtraValues((prev) => ({
                      ...prev,
                      [s.id]: val,
                    }));
                  }
                  s.onChange?.(val);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={s.label} aria-label={s.label} />
                </SelectTrigger>
                <SelectContent>
                  {s.options.map((opt) => (
                    <SelectItem key={`${s.id}-${opt.value}`} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}

          {/* Date Range (opsional) */}
          {enableDateFilter && (
            <div className="flex flex-col gap-y-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 border border-gray-300 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? (
                      dateTo ? (
                        <>
                          {format(dateFrom, "LLL dd, y")} -{" "}
                          {format(dateTo, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateFrom, "LLL dd, y")
                      )
                    ) : (
                      <span>Pilih Rentang Tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateFrom}
                    selected={{ from: dateFrom, to: dateTo }}
                    onSelect={(val) => {
                      setDateFrom(val?.from);
                      setDateTo(val?.to);
                    }}
                    numberOfMonths={2}
                    required
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {extraNodes}
        </div>

        {/* Kanan: aksi */}
        <div className="shrink-0 flex flex-wrap items-center gap-2">
          {onResetAllFilters && (
            <Button
              className="h-10"
              variant="destructive"
              onClick={onResetAllFilters}
            >
              Reset Filter
            </Button>
          )}

          {onImportExcel && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={importAccept}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportExcel(file);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <Button
                variant="default"
                onClick={() => fileInputRef.current?.click()}
              >
                {importLabel}
              </Button>
            </>
          )}

          {onExportExcel && (
            <Button onClick={onExportExcel} disabled={exportDisabled}>
              {exportLabel}
            </Button>
          )}

          {openModal && (
            <Button
              onClick={openModal}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}