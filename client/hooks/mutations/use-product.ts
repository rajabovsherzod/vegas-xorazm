import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services/product.service";
import { CreateProductFormValues } from "@/lib/validations/product";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useCreateProduct = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateProductFormValues) => productService.create(data),
    onSuccess: () => {
      toast.success("Mahsulot muvaffaqiyatli qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.refresh();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Xatolik yuz berdi");
    },
  });
};













