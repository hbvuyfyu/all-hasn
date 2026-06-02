import { useState } from "react";
import { useListRechargeRequests, useApproveRecharge, useRejectRecharge, getListRechargeRequestsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "معلق", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  approved: { label: "موافق عليه", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  rejected: { label: "مرفوض", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

export default function AdminRecharges() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | undefined>(undefined);
  const [approveId, setApproveId] = useState<number | null>(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListRechargeRequests({ status: statusFilter });
  const approve = useApproveRecharge();
  const reject = useRejectRecharge();

  const inv = () => qc.invalidateQueries({ queryKey: getListRechargeRequestsQueryKey() });

  const handleApprove = () => {
    if (!approveId || !approvedAmount) return;
    approve.mutate({ id: approveId, data: { approvedAmount: Number(approvedAmount) } }, {
      onSuccess: () => { inv(); setApproveId(null); toast({ title: "تم الموافقة وإضافة الرصيد" }); },
      onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
    });
  };

  const handleReject = (id: number) => {
    if (!confirm("رفض طلب الشحن؟")) return;
    reject.mutate({ id }, {
      onSuccess: () => { inv(); toast({ title: "تم رفض الطلب" }); },
      onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
    });
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">طلبات الشحن</h1>
          <p className="text-muted-foreground">مراجعة وموافقة طلبات شحن المحفظة</p>
        </div>

        <div className="flex gap-2 mb-6">
          {([undefined, "pending", "approved", "rejected"] as const).map(s => (
            <Button key={String(s)} variant={statusFilter === s ? "default" : "secondary"} size="sm"
              onClick={() => setStatusFilter(s as any)} className="rounded-full">
              {s === undefined ? "الكل" : statusMap[s]?.label}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />) : data?.requests.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border"><Clock className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>لا توجد طلبات</p></div>
          ) : data?.requests.map((req, i) => {
            const status = statusMap[req.status] ?? { label: req.status, color: "bg-black/10 text-white border-border" };
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                data-testid={`card-recharge-${req.id}`}
                className="flex items-center gap-5 p-5 bg-card border border-border rounded-2xl hover:border-border transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{req.userName || "مستخدم"} — <span className="text-muted-foreground text-sm font-normal">{req.userPhone}</span></p>
                  <p className="text-lg font-bold text-primary">${Number(req.amount).toFixed(2)}</p>
                  {req.transactionRef && <p className="text-xs text-muted-foreground mt-0.5">مرجع: {req.transactionRef}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString("ar-SA")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full border ${status.color}`}>{status.label}</span>
                  {req.status === "pending" && (
                    <>
                      <Button data-testid={`button-approve-${req.id}`} size="sm" onClick={() => { setApproveId(req.id); setApprovedAmount(String(req.amount)); }} className="bg-green-500 hover:bg-green-400 text-white">
                        <CheckCircle className="w-4 h-4 ml-1" />موافقة
                      </Button>
                      <Button data-testid={`button-reject-${req.id}`} size="sm" variant="ghost" onClick={() => handleReject(req.id)} className="text-red-400 hover:text-red-300">
                        <XCircle className="w-4 h-4 ml-1" />رفض
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!approveId} onOpenChange={() => setApproveId(null)}>
        <DialogContent className="bg-card border-border text-white max-w-sm" dir="rtl">
          <DialogHeader><DialogTitle>الموافقة على طلب الشحن</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label>المبلغ المعتمد (USD)</Label>
            <div className="relative mt-2">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input data-testid="input-approved-amount" type="number" value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)} className="pr-10 bg-black/5 border-border text-white" dir="ltr" />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="secondary" onClick={() => setApproveId(null)}>إلغاء</Button>
            <Button data-testid="button-confirm-approve" onClick={handleApprove} disabled={approve.isPending} className="bg-green-500 hover:bg-green-400">
              {approve.isPending ? "جارٍ الموافقة..." : "تأكيد الموافقة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
