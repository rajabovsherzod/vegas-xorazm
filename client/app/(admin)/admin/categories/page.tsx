"use client";

import { useQuery } from "@tanstack/react-query";
import { AddCategoryDialog } from "@/components/categories/add-category-dialog";
import { categoryService } from "@/lib/services/category.service";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useSearchParams } from "next/navigation";

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories", search],
    queryFn: async () => {
      const res = await categoryService.getAll({ search });
      if (Array.isArray(res)) return res;
      return [];
    },
  });

  return (
    <div className="space-y-6">
      {/* PageHeader DOIM ko'rsatiladi */}
      <PageHeader
        title="Kategoriyalar"
        description="Mahsulotlar uchun kategoriyalar ro'yxati"
        searchPlaceholder="Kategoriya nomi..."
      >
        <AddCategoryDialog />
      </PageHeader>

      {/* Faqat Table qismi loading bo'ladi */}
      {isLoading ? (
        <TableSkeleton columnCount={5} rowCount={8} />
      ) : (
        <DataTable columns={columns} data={categories} />
      )}
    </div>
  );
}
