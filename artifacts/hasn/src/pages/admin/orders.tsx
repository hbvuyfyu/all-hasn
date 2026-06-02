import { useListOrders } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { motion } from "framer-motion";
import { Package, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-500/20 text-yellow-300" },
  processing: { label: "جارٍ المعالجة", color: "bg-blue-500/20 text-blue-300" },
  completed: { label: "مكتمل", color: "bg-green-500/20 text-green-300" },
  failed: { label: "فشل", color: "bg-red-500/20 text-red-300" },
  cancelled: { label: "ملغي", color: "bg-gray-500/20 text-gray-400" },
};

export default function AdminOrders() {
  const { data, isLoading } = useListOrders({ page: 1 });

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">الطلبات</h1>
          <p className="text-muted-foreground">جميع طلبات المنصة</p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border text-sm text-muted-foreground font-medium">
            <span>#</span><span>الخدمة</span><span>الحساب</span><span>المبلغ</span><span>الحالة</span>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : data?.orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Package className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>لا توجد طلبات</p></div>
          ) : (
            <div className="divide-y divide-white/5">
              {data?.orders.map((order, i) => {
                const status = statusMap[order.status] ?? { label: order.status, color: "bg-black/10 text-white" };
                return (
                  <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    data-testid={`row-order-${order.id}`}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-black/3 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground font-mono">#{order.id}</span>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-black/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {order.serviceImage ? <img src={order.serviceImage} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-white/20" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{order.serviceName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("ar-SA")}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{order.targetId || "—"}</span>
                    <span className="text-sm font-bold text-white">${Number(order.amount).toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
