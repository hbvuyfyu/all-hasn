import { useListAuditLogs } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { motion } from "framer-motion";
import { History, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const actionLabels: Record<string, string> = {
  user_register: "تسجيل مستخدم", user_login: "دخول", user_logout: "خروج",
  user_block: "حظر مستخدم", user_unblock: "إلغاء حظر", user_update: "تحديث مستخدم",
  category_create: "إضافة قسم", category_update: "تعديل قسم", category_delete: "حذف قسم",
  service_create: "إضافة خدمة", service_update: "تعديل خدمة", service_delete: "حذف خدمة",
  banner_create: "إضافة بنر", banner_update: "تعديل بنر", banner_delete: "حذف بنر",
  provider_create: "إضافة مزود", provider_update: "تعديل مزود", provider_delete: "حذف مزود", provider_sync: "مزامنة مزود",
  order_create: "طلب جديد", recharge_request: "طلب شحن",
  recharge_approve: "موافقة شحن", recharge_reject: "رفض شحن",
  settings_update: "تحديث الإعدادات", payment_method_create: "إضافة طريقة دفع",
};

const actionColors: Record<string, string> = {
  user_block: "text-red-400", user_unblock: "text-green-400",
  recharge_approve: "text-green-400", recharge_reject: "text-red-400",
  order_create: "text-blue-400",
};

export default function AdminAuditLogs() {
  const { data, isLoading } = useListAuditLogs({ limit: 50 });

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">سجل العمليات</h1>
          <p className="text-muted-foreground">سجل كامل بجميع عمليات المنصة</p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : data?.logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><History className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>لا توجد سجلات</p></div>
          ) : (
            <div className="divide-y divide-white/5">
              {data?.logs.map((log, i) => (
                <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  data-testid={`row-log-${log.id}`}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-black/3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <History className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${actionColors[log.action] || "text-white"}`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                    {log.details && <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.details}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {log.userName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />{log.userName}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString("ar-SA")}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
