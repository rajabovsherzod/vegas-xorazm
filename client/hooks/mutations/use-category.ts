import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, CreateCategoryPayload } from "@/lib/services/category.service";
import type { UpdateCategoryPayload } from "@/types/api";
import { toast } from "sonner";

// Form values type (validation uchun)
export interface CreateCategoryFormValues {
  name: string;
  description?: string;
}

export interface UpdateCategoryFormValues {
  name?: string;
  description?: string;
}

/**
 * Yangi kategoriya yaratish hook
 */
export const useCreateCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryFormValues) => {
      // Form values'ni API payload'ga o'tkazish
      const payload: CreateCategoryPayload = {
        name: data.name,
        description: data.description || undefined,
      };
      return categoryService.create(payload);
    },
    onSuccess: () => {
      toast.success("Kategoriya muvaffaqiyatli qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });
};

/**
 * Kategoriyani yangilash hook
 */
export const useUpdateCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryFormValues }) => {
      // Form values'ni API payload'ga o'tkazish
      const payload: UpdateCategoryPayload = {
        name: data.name,
        description: data.description !== undefined ? data.description : undefined,
      };
      return categoryService.update(id, payload);
    },
    onSuccess: () => {
      toast.success("Kategoriya muvaffaqiyatli yangilandi");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });
};

/**
 * Kategoriyani o'chirish hook
 */
export const useDeleteCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      toast.success("Kategoriya muvaffaqiyatli o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });
};






