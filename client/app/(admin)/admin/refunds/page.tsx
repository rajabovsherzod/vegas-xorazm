import { PageHeader } from "@/components/layout/page-header";

export default function AdminRefundsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Qaytarishlar Tarixi"
        description="Bekor qilingan va qaytarilgan buyurtmalar ro'yxati"
      />
      
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02]">
        <p className="text-muted-foreground">Hozircha tarix bo'sh</p>
      </div>
    </div>
  );
}