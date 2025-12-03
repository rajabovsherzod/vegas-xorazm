"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddCategoryDialog } from "@/components/categories/add-category-dialog";
import { EditCategoryDialog } from "@/components/categories/edit-category-dialog";
import { categoryService } from "@/lib/services/category.service";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useSearchParams } from "next/navigation";
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

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<any | null>(null);

  const handleEdit = (category: any) => {
    setEditingCategory(category);
  };

  const handleDelete = (category: any) => {
    setDeletingCategory(category);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      toast.success("Kategoriya o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeletingCategory(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });

  const columns = useMemo(() => getColumns(handleEdit, handleDelete), []);

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

      {/* Edit Dialog */}
      <EditCategoryDialog 
        category={editingCategory}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#1C2C30] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-bold text-[#212B36] dark:text-white">{deletingCategory?.name}</span> kategoriyasi o'chiriladi. Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
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
