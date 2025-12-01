"use client";

import { useQuery } from "@tanstack/react-query";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { productService } from "@/lib/services/product.service";
import { categoryService } from "@/lib/services/category.service";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useSearchParams } from "next/navigation";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

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
        <AddProductDialog categories={categories} />
      </PageHeader>

      {/* Faqat Table qismi loading bo'ladi */}
      {productsLoading ? (
        <TableSkeleton columnCount={6} rowCount={10} />
      ) : (
        <DataTable columns={columns} data={products} />
      )}
    </div>
  );
}
