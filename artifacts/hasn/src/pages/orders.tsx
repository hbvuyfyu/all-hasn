import { useLocation } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { RootLayout } from "@/components/layout/root-layout";
import { useAuth } from "@/components/auth-provider";
import { motion } from "framer-motion";
import { Package, ImageIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  processing: { label: "جارٍ المعالجة", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  completed: { label: "مكتمل", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  failed: { label: "فشل", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  cancelled: { label: "ملغي", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
};

export default function Orders() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: ordersData, isLoading } = useListOrders({ page: 1 });

  useEffect(() => {
    if (!user) setLocation("/login");
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl" dir="rtl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">طلباتي</h1>
          <p className="text-muted-foreground">تتبع جميع طلباتك وحالتها</p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))
          ) : ordersData?.orders.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground bg-card rounded-2xl border border-border">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">لا توجد طلبات بعد</p>
              <p className="text-sm">ابدأ بطلب خدمة من صفحة الخدمات</p>
            </div>
          ) : (
            ordersData?.orders.map((order, i) => {
              const status = statusMap[order.status] ?? { label: order.status, color: "bg-black/10 text-white" };
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-testid={`card-order-${order.id}`}
                  className="flex items-center gap-5 p-5 bg-card border border-border rounded-2xl hover:border-border transition-colors"
                >
                  <div className="w-14 h-14 bg-black/5 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                    {order.serviceImage ? (
                      <img src={order.serviceImage} alt={order.serviceName} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{order.serviceName}</p>
                    <p className="text-sm text-muted-foreground">{order.targetId && `للحساب: ${order.targetId}`}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString("ar-SA")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-white">${Number(order.amount).toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${status.color}`}>{status.label}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </RootLayout>
  );
}
