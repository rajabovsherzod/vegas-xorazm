import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, CreateCategoryData } from "@/lib/services/category.service";
import { toast } from "sonner";

export const useCreateCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoryService.create(data),
    onSuccess: () => {
      toast.success("Kategoriya muvaffaqiyatli qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Xatolik yuz berdi");
    },
  });
};

