import { Link, useLocation } from "wouter";
import { useGetWallet, useListTransactions, getGetMeQueryKey } from "@workspace/api-client-react";
import { RootLayout } from "@/components/layout/root-layout";
import { useAuth } from "@/components/auth-provider";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpCircle, TrendingUp, TrendingDown, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  completed: { label: "مكتمل", variant: "default" },
  pending: { label: "قيد المعالجة", variant: "secondary" },
  failed: { label: "فشل", variant: "destructive" },
  rejected: { label: "مرفوض", variant: "destructive" },
};

const typeIcon: Record<string, React.ReactNode> = {
  recharge: <TrendingUp className="w-4 h-4 text-green-400" />,
  purchase: <TrendingDown className="w-4 h-4 text-red-400" />,
  refund: <RefreshCw className="w-4 h-4 text-blue-400" />,
};

export default function WalletPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: wallet, isLoading: loadingWallet } = useGetWallet();
  const { data: txData, isLoading: loadingTx } = useListTransactions({ limit: 20 });

  useEffect(() => {
    if (!user) setLocation("/login");
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl" dir="rtl">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/80 to-accent/60 p-8 mb-8 shadow-2xl shadow-primary/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-90" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-foreground/80 text-sm font-medium">رصيد المحفظة</span>
            </div>
            {loadingWallet ? (
              <Skeleton className="h-12 w-48 bg-white/20" />
            ) : (
              <p data-testid="text-wallet-balance" className="text-5xl font-bold text-white tracking-tight">
                ${Number(wallet?.balance || 0).toFixed(2)}
              </p>
            )}
            <p className="text-foreground/60 mt-2 text-sm">دولار أمريكي</p>
          </div>
        </motion.div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">سجل المعاملات</h2>
          <Link href="/wallet/recharge">
            <Button data-testid="button-recharge" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
              <ArrowUpCircle className="w-4 h-4 ml-2" />
              شحن المحفظة
            </Button>
          </Link>
        </div>

        {/* Transactions */}
        <div className="space-y-3">
          {loadingTx ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))
          ) : txData?.transactions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد معاملات بعد</p>
            </div>
          ) : (
            txData?.transactions.map((tx, i) => {
              const status = statusMap[tx.status] ?? { label: tx.status, variant: "secondary" as const };
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  data-testid={`row-transaction-${tx.id}`}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
                      {typeIcon[tx.type]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.description || tx.type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("ar-SA")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className={`font-bold ${tx.type === "purchase" ? "text-red-400" : "text-green-400"}`}>
                      {tx.type === "purchase" ? "-" : "+"}${Number(tx.amount).toFixed(2)}
                    </span>
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
