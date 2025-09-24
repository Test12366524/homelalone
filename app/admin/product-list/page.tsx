"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetProductListQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/services/admin/product.service";
import { useGetProductMerkListQuery } from "@/services/master/product-merk.service";
import { Product } from "@/types/admin/product";
import FormProduct from "@/components/form-modal/admin/product-form";
import { Badge } from "@/components/ui/badge";

export default function ProductPage() {
  const [form, setForm] = useState<Partial<Product>>({
    status: true,
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, refetch } = useGetProductListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const { data: merkData } = useGetProductMerkListQuery({
    page: 1,
    paginate: 100,
  });

  const categoryList = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);
  const merkList = useMemo(() => merkData?.data || [], [merkData]);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleSubmit = async () => {
    try {
      const payload = new FormData();

      // === VALIDATION ===
      if (!form.name || form.name.trim() === "") {
        throw new Error("Nama produk wajib diisi");
      }
      if (!form.product_category_id) {
        throw new Error("Kategori produk wajib dipilih");
      }
      if (!form.product_merk_id) {
        throw new Error("Merk produk wajib dipilih");
      }
      
      // Check if selected merk is "Jasa" for additional validation
      const selectedMerk = merkList?.find((m) => m.id === form.product_merk_id);
      const isJasaMerk = selectedMerk?.name?.toLowerCase() === "jasa";
      
      if (isJasaMerk) {
        // For Jasa products, price is required and must be > 0
        if (!form.price || form.price <= 0) {
          throw new Error("Harga wajib diisi dan harus lebih dari 0 untuk layanan Jasa");
        }
      }

      // === REQUIRED FIELDS ===
      // Hardcoded shop_id as requested by backend team
      payload.append("shop_id", "1");

      // Numeric fields - handle price properly
      const priceValue = form.price !== undefined && form.price !== null ? form.price : 0;
      payload.append("price", priceValue ? `${priceValue}` : "0");
      payload.append("price", form.price ? `${form.price}` : "0");
      payload.append("duration", form.duration ? `${form.duration}` : "0");
      payload.append("weight", form.weight ? `${form.weight}` : "0");
      payload.append("length", form.length ? `${form.length}` : "0");
      payload.append("width", form.width ? `${form.width}` : "0");
      payload.append("height", form.height ? `${form.height}` : "0");
      
      if (isJasaMerk) {
        // For Jasa, send duration field (which maps to duration in our form)
        const durationValue = form.duration ? `${form.duration}` : "0";
        payload.append("duration", durationValue);
      } else {
        // For non-Jasa products, hardcode duration to 1 (required but not needed)
        payload.append("duration", "1");
      }

      // === OPTIONAL FIELDS ===
      if (form.name) payload.append("name", form.name);
      if (form.description) payload.append("description", form.description);
      if (form.product_category_id)
        payload.append("product_category_id", `${form.product_category_id}`);
      if (form.product_merk_id)
        payload.append("product_merk_id", `${form.product_merk_id}`);
      if (typeof form.status === "boolean") {
        payload.append("status", form.status ? "1" : "0");
      }

      // === IMAGE HANDLING ===
      const imageFields = [
        'image', 'image_2', 'image_3', 'image_4', 
        'image_5', 'image_6', 'image_7'
      ];

      if (editingSlug) {
        // === MODE EDIT ===
        // Kirim method override untuk PATCH/PUT
        payload.append("_method", "PUT"); // atau "PATCH"
        
        imageFields.forEach((fieldName) => {
          const imageValue = form[fieldName as keyof Product];
          
          if (imageValue instanceof File) {
            // Upload gambar baru
            payload.append(fieldName, imageValue);
          } else if (typeof imageValue === "string" && imageValue) {
            // Pertahankan gambar lama dengan mengirim URL-nya
            payload.append(`${fieldName}`, imageValue);
          }
          // Jika undefined/null = hapus gambar
        });

        await updateProduct({ slug: editingSlug, payload }).unwrap();
        Swal.fire("Sukses", "Produk diperbarui", "success");
        
      } else {
        // === MODE CREATE ===
        // Validasi minimal 1 gambar untuk create
        if (!(form.image instanceof File)) {
          throw new Error("Minimal 1 gambar wajib diisi untuk produk baru");
        }

        imageFields.forEach((fieldName) => {
          const imageValue = form[fieldName as keyof Product];
          if (imageValue instanceof File) {
            payload.append(fieldName, imageValue);
          }
        });

        await createProduct(payload).unwrap();
        Swal.fire("Sukses", "Produk ditambahkan", "success");
      }

      setForm({ status: true });
      setEditingSlug(null);
      await refetch();
      closeModal();
      
    } catch (error) {
      console.error("Submit error:", error);
      
      Swal.fire("Gagal", error instanceof Error ? error.message : "Terjadi kesalahan", "error");
    }
  };  

  const handleEdit = (item: Product) => {
    setForm({ ...item, status: item.status === true || item.status === 1 });
    setEditingSlug(item.slug);
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: Product) => {
    setForm(item);
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: Product) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Produk?",
      text: item.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteProduct(item.slug.toString()).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Produk dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Produk", "error");
        console.error(error);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Data Produk</h1>
        <Button onClick={() => openModal()}>Tambah Produk</Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Kategori</th>
                <th className="px-4 py-2">Merk</th>
                <th className="px-4 py-2">Produk</th>
                <th className="px-4 py-2">Harga</th>
                <th className="px-4 py-2">Stok</th>
                <th className="px-4 py-2">Rating</th>
                <th className="px-4 py-2 whitespace-nowrap">T. Views</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : categoryList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                categoryList.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleDetail(item)}>
                          Detail
                        </Button>
                        <Button size="sm" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.category_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.merk_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.price}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.duration}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.rating}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.total_reviews}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Badge variant={item.status ? "success" : "destructive"}>
                        {item.status ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        <div className="p-4 flex items-center justify-between bg-muted">
          <div className="text-sm">
            Halaman <strong>{currentPage}</strong> dari{" "}
            <strong>{lastPage}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= lastPage}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <FormProduct
            form={form}
            setForm={setForm}
            onCancel={() => {
              setForm({ status: true });
              setEditingSlug(null);
              setReadonly(false);
              closeModal();
            }}
            onSubmit={handleSubmit}
            readonly={readonly}
            isLoading={isCreating || isUpdating}
          />
        </div>
      )}
    </div>
  );
}
