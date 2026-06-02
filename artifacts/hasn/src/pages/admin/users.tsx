import { useState } from "react";
import { useListUsers, useBlockUser, useAdjustUserWallet } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListUsersQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { motion } from "framer-motion";
import { Search, ShieldCheck, ShieldX, User, Wallet, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const roleLabels: Record<string, string> = { user: "مستخدم", admin: "مشرف", super_admin: "مدير عام" };

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [walletDialog, setWalletDialog] = useState<{ id: number; name: string; balance: number } | null>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletNote, setWalletNote] = useState("");
  const { data, isLoading } = useListUsers({ search: search || undefined });
  const blockUser = useBlockUser();
  const adjustWallet = useAdjustUserWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleBlock = (id: number, isBlocked: boolean) => {
    blockUser.mutate(
      { id, data: { isBlocked: !isBlocked } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast({ title: isBlocked ? "تم إلغاء حظر المستخدم" : "تم حظر المستخدم" });
        },
        onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
      }
    );
  };

  const openWalletDialog = (user: any) => {
    setWalletDialog({ id: user.id, name: user.name, balance: Number(user.walletBalance) });
    setWalletAmount("");
    setWalletNote("");
  };

  const handleWalletAdjust = (type: "add" | "subtract") => {
    if (!walletDialog) return;
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "أدخل مبلغ صحيح" });
      return;
    }
    const finalAmount = type === "add" ? amount : -amount;
    adjustWallet.mutate(
      { id: walletDialog.id, data: { amount: finalAmount, note: walletNote || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          toast({ title: type === "add" ? `تم إضافة $${amount} للرصيد` : `تم خصم $${amount} من الرصيد` });
          setWalletDialog(null);
        },
        onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
      }
    );
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">المستخدمين</h1>
            <p className="text-muted-foreground">إدارة مستخدمي المنصة</p>
          </div>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم أو رقم الهاتف..."
            className="pr-10"
          />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border text-sm text-muted-foreground font-medium">
            <span>#</span>
            <span>المستخدم</span>
            <span>الرصيد</span>
            <span>الدور</span>
            <span>المحفظة</span>
            <span>الإجراء</span>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : data?.users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد نتائج</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data?.users.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  data-testid={`row-user-${user.id}`}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-black/3 transition-colors"
                >
                  <span className="text-muted-foreground text-sm">{user.id}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-primary">${Number(user.walletBalance).toFixed(2)}</span>
                  <Badge variant={user.role === "super_admin" ? "default" : user.role === "admin" ? "secondary" : "outline"}>
                    {roleLabels[user.role] ?? user.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openWalletDialog(user)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="تعديل الرصيد"
                  >
                    <Wallet className="w-4 h-4" />
                  </Button>
                  <Button
                    data-testid={`button-block-${user.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBlock(user.id, user.isBlocked)}
                    className={user.isBlocked ? "text-green-600 hover:text-green-700" : "text-red-500 hover:text-red-600"}
                    disabled={blockUser.isPending}
                  >
                    {user.isBlocked ? (
                      <><ShieldCheck className="w-4 h-4 ml-1" /> فك الحظر</>
                    ) : (
                      <><ShieldX className="w-4 h-4 ml-1" /> حظر</>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wallet Adjustment Dialog */}
      <Dialog open={!!walletDialog} onOpenChange={v => !v && setWalletDialog(null)}>
        <DialogContent className="max-w-sm w-[95vw]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              تعديل رصيد المحفظة
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-4">
            <div className="p-3 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground">{walletDialog?.name}</p>
              <p className="text-xl font-bold text-foreground mt-1">${walletDialog?.balance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">الرصيد الحالي</p>
            </div>
            <div>
              <Label>المبلغ *</Label>
              <Input
                type="number"
                value={walletAmount}
                onChange={e => setWalletAmount(e.target.value)}
                className="mt-1"
                dir="ltr"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>ملاحظة (اختياري)</Label>
              <Input
                value={walletNote}
                onChange={e => setWalletNote(e.target.value)}
                className="mt-1"
                placeholder="سبب التعديل"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="secondary" onClick={() => setWalletDialog(null)}>إلغاء</Button>
            <Button
              onClick={() => handleWalletAdjust("subtract")}
              disabled={adjustWallet.isPending}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Minus className="w-4 h-4 ml-1" />
              خصم
            </Button>
            <Button
              onClick={() => handleWalletAdjust("add")}
              disabled={adjustWallet.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 ml-1" />
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
