import { useState } from "react";
import { useLocation } from "wouter";
import { useListPaymentMethods, useRequestRecharge, getListTransactionsQueryKey, getGetWalletQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { RootLayout } from "@/components/layout/root-layout";
import { useAuth } from "@/components/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, CreditCard, DollarSign, Hash, ChevronLeft } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function WalletRecharge() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"method" | "form" | "success">("method");
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [txRef, setTxRef] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const { data: methods } = useListPaymentMethods();
  const requestRecharge = useRequestRecharge();

  const selectedMethodData = methods?.find(m => m.id === selectedMethod);

  useEffect(() => {
    if (!user) setLocation("/login");
  }, [user, setLocation]);

  const handleSubmit = () => {
    if (!selectedMethod || !amount || Number(amount) <= 0) {
      toast({ variant: "destructive", title: "يرجى تعبئة جميع الحقول المطلوبة" });
      return;
    }
    requestRecharge.mutate(
      {
        data: {
          amount: Number(amount),
          paymentMethodId: selectedMethod,
          transactionRef: txRef || undefined,
          proofImageUrl: proofUrl || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          setStep("success");
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "فشل إرسال الطلب",
            description: err?.response?.data?.error || "حدث خطأ",
          });
        },
      }
    );
  };

  if (!user) return null;

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-12 max-w-xl" dir="rtl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">شحن المحفظة</h1>
          <p className="text-muted-foreground">أضف رصيداً لمحفظتك لشراء الخدمات</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "method" && (
            <motion.div key="method" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-lg font-semibold text-white mb-4">اختر طريقة الدفع</h2>
              {!methods || methods.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>لا توجد طرق دفع متاحة حالياً</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {methods.map(method => (
                    <button
                      key={method.id}
                      data-testid={`card-payment-method-${method.id}`}
                      onClick={() => { setSelectedMethod(method.id); setStep("form"); }}
                      className={`w-full p-5 rounded-2xl border text-right transition-all hover:border-primary/50 ${
                        selectedMethod === method.id ? "bg-primary/10 border-primary" : "bg-card border-border hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{method.name}</p>
                          {method.details && <p className="text-sm text-muted-foreground">{method.details}</p>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === "form" && selectedMethodData && (
            <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <button onClick={() => setStep("method")} className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors text-sm">
                <ChevronLeft className="w-4 h-4 rotate-180" />
                تغيير طريقة الدفع
              </button>

              {/* Payment details */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-white mb-4">{selectedMethodData.name}</h3>
                {selectedMethodData.accountNumber && (
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">رقم الحساب:</span>
                    <span className="text-white font-mono">{selectedMethodData.accountNumber}</span>
                  </div>
                )}
                {selectedMethodData.instructions && (
                  <div className="bg-black/5 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
                    {selectedMethodData.instructions}
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="space-y-5">
                <div>
                  <Label className="text-foreground/80 mb-2 block">المبلغ (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      data-testid="input-amount"
                      type="number"
                      min="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="pr-10 bg-black/5 border-border text-white placeholder:text-muted-foreground"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-foreground/80 mb-2 block">رقم العملية (اختياري)</Label>
                  <div className="relative">
                    <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      data-testid="input-tx-ref"
                      value={txRef}
                      onChange={e => setTxRef(e.target.value)}
                      placeholder="أدخل رقم العملية"
                      className="pr-10 bg-black/5 border-border text-white placeholder:text-muted-foreground"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-foreground/80 mb-2 block">صورة إثبات الدفع (اختياري)</Label>
                  <ImageUpload
                    value={proofUrl}
                    onChange={setProofUrl}
                    placeholder="ارفع صورة إثبات الدفع من هاتفك"
                  />
                </div>

                <Button
                  data-testid="button-submit-recharge"
                  onClick={handleSubmit}
                  disabled={requestRecharge.isPending}
                  className="w-full h-12 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/30"
                >
                  {requestRecharge.isPending ? "جارٍ الإرسال..." : "تحقق من الدفع وأرسل الطلب"}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">طلبك قيد المعالجة</h2>
              <p className="text-muted-foreground mb-8">يرجى الانتظار دقائق قليلة حتى تتم مراجعة طلبك وإضافة الرصيد.</p>
              <Button data-testid="button-go-wallet" onClick={() => setLocation("/wallet")} className="bg-primary hover:bg-primary/90">
                العودة للمحفظة
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RootLayout>
  );
}
