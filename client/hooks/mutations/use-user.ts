import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/services/user.service";
import { CreateUserFormValues } from "@/lib/validations/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useCreateUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateUserFormValues) => userService.create(data),
    onSuccess: () => {
      // Avval query invalidate qilamiz (client-side data yangilash uchun)
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      // 🔥 MUHIM: Server Componentni yangilash uchun router.refresh()
      router.refresh();

      // Keyin callback va toastni chiqaramiz
      if (onSuccess) onSuccess();
      toast.success("Yangi xodim muvaffaqiyatli qo'shildi!");
    },
    onError: (error: any) => {
      console.error("User creation error:", error);
      // Error toastni faqat shu yerda chiqaramiz
      const message = error.message || "Xatolik yuz berdi";
      toast.error(message);
    },
  });
};

