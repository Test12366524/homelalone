"use client";

import SearchableSelect, { type Option } from "./searchable-select";

type Props = {
  mode: "automatic" | "manual";
  value: string | undefined;
  onChange: (v: string) => void;
  disabled?: boolean;
};

export function PaymentMethodSelect({
  mode,
  value,
  onChange,
  disabled,
}: Props) {
  const base: Option[] =
    mode === "automatic"
      ? [
          { value: "bank_transfer", label: "Bank Transfer (VA)" },
          { value: "qris", label: "QRIS" },
          { value: "card", label: "Kartu Kredit/Debit" },
        ]
      : [
          { value: "bank_transfer", label: "Bank Transfer (VA)" },
          { value: "qris", label: "QRIS" },
          { value: "tunai", label: "Tunai" },
        ];

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={base}
      placeholder="Pilih metode"
      disabled={disabled}
      allowCustom={true} // tetap bisa klik hasil pencarian untuk nilai custom
      emptyHint="Metode tidak ditemukan."
    />
  );
}