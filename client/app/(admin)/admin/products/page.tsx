"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { AddStockDialog } from "@/components/products/add-stock-dialog";
import { EditProductDialog } from "@/components/products/edit-product-dialog";
import { productService } from "@/lib/services/product.service";
import { categoryService } from "@/lib/services/category.service";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useSearchParams } from "next/navigation";
import { useUsdRate } from "@/providers/usd-rate-provider";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const usdRate = useUsdRate();
  const usdRateNum = parseFloat(usdRate);
  
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  
  const handleEdit = (product: any) => {
    setEditingProduct(product);
  };
  
  const handleDelete = (product: any) => {
    setDeletingProduct(product);
  };
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      toast.success("Mahsulot o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeletingProduct(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });
  
  const columns = useMemo(() => getColumns(usdRateNum, handleEdit, handleDelete), [usdRateNum]);

  const { data: products = [], isLoading: productsLoading, isFetching } = useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      const res: any = await productService.getAll({ search });
      if (res?.products && Array.isArray(res.products)) return res.products;
      if (Array.isArray(res)) return res;
      return [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryService.getAll();
      if (Array.isArray(res)) return res;
      return [];
    },
  });

  return (
    <div className="space-y-6">
      {/* PageHeader DOIM ko'rsatiladi */}
      <PageHeader
        title="Mahsulotlar"
        description="Omborda mavjud barcha mahsulotlar ro'yxati"
        searchPlaceholder="Mahsulot nomi yoki barkod..."
      >
        <div className="flex gap-2">
          <AddStockDialog products={products} />
          <AddProductDialog categories={categories} />
        </div>
      </PageHeader>

      {/* Faqat Table qismi loading bo'ladi */}
      {productsLoading ? (
        <TableSkeleton columnCount={6} rowCount={10} />
      ) : (
        <DataTable columns={columns} data={products} />
      )}

      {/* Edit Dialog */}
      <EditProductDialog 
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        categories={categories}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#1C2C30] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Mahsulotni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-bold text-[#212B36] dark:text-white">{deletingProduct?.name}</span> mahsuloti o'chiriladi. Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingProduct && deleteMutation.mutate(deletingProduct.id)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
