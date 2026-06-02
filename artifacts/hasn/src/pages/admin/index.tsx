import { useGetAdminStats } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { motion } from "framer-motion";
import { Users, Package, DollarSign, Clock, TrendingUp, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const stats = [
  { key: "totalUsers", label: "إجمالي المستخدمين", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
  { key: "totalOrders", label: "إجمالي الطلبات", icon: Package, color: "text-green-400", bg: "bg-green-400/10" },
  { key: "totalServices", label: "الخدمات المتاحة", icon: Layers, color: "text-purple-400", bg: "bg-purple-400/10" },
  { key: "pendingRecharges", label: "طلبات شحن معلقة", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
];

const orderStatusMap: Record<string, string> = {
  pending: "قيد الانتظار",
  processing: "جارٍ المعالجة",
  completed: "مكتمل",
  failed: "فشل",
  cancelled: "ملغي",
};

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminStats();

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">لوحة القيادة</h1>
        <p className="text-muted-foreground mb-8">نظرة عامة على منصة حصن</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              data-testid={`stat-${stat.key}`}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <p className="text-3xl font-bold text-white mb-1">
                  {(data as any)?.[stat.key] ?? 0}
                </p>
              )}
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">أحدث الطلبات</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : (data?.recentOrders?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground text-center py-8">لا توجد طلبات بعد</p>
          ) : (
            <div className="space-y-3">
              {data?.recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-black/3 rounded-xl hover:bg-black/5 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">{order.serviceName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("ar-SA")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">${Number(order.amount).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground bg-black/5 px-2 py-0.5 rounded">
                      {orderStatusMap[order.status] ?? order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
