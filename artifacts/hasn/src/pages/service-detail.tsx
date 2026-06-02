import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetService, useCreateOrder, getGetWalletQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { RootLayout } from "@/components/layout/root-layout";
import { useAuth } from "@/components/auth-provider";
import { motion } from "framer-motion";
import { ImageIcon, Minus, Plus, ShoppingCart, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [targetId, setTargetId] = useState("");

  const { data: service, isLoading } = useGetService(Number(id));

  const createOrder = useCreateOrder();

  const handleOrder = () => {
    if (!user) { setLocation("/login"); return; }
    if (!targetId.trim()) {
      toast({ variant: "destructive", title: "يرجى إدخال معرف الحساب أو الهاتف" });
      return;
    }

    createOrder.mutate(
      { data: { serviceId: Number(id), quantity, targetId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "تم تقديم الطلب بنجاح", description: "سيتم معالجة طلبك قريباً" });
          setLocation("/orders");
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "فشل تقديم الطلب",
            description: err?.response?.data?.error || "حدث خطأ أثناء تقديم الطلب",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <RootLayout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-64 rounded-2xl mb-8" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </RootLayout>
    );
  }

  if (!service) {
    return (
      <RootLayout>
        <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
          الخدمة غير موجودة
        </div>
      </RootLayout>
    );
  }

  const total = (Number(service.price) * quantity).toFixed(2);

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border">
              {service.imageUrl ? (
                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-white/10" />
                </div>
              )}
            </div>

            {/* Info & Order */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-3">{service.name}</h1>
                {service.description && (
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">${service.price}</span>
                <span className="text-muted-foreground">لكل وحدة</span>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div>
                  <Label className="text-foreground/80 mb-2 block">معرف الحساب / رقم الهاتف</Label>
                  <Input
                    data-testid="input-target-id"
                    value={targetId}
                    onChange={e => setTargetId(e.target.value)}
                    placeholder="أدخل معرف الحساب أو رقم الهاتف"
                    className="bg-black/5 border-border text-white placeholder:text-muted-foreground"
                    dir="ltr"
                  />
                </div>

                <div>
                  <Label className="text-foreground/80 mb-2 block">الكمية</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="icon"
                      data-testid="button-decrease-qty"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center text-xl font-bold text-white">{quantity}</span>
                    <Button
                      variant="secondary"
                      size="icon"
                      data-testid="button-increase-qty"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">الإجمالي</span>
                    <span className="text-2xl font-bold text-primary">${total}</span>
                  </div>

                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Wallet className="w-4 h-4" />
                        <span>رصيدك: ${Number(user.walletBalance || 0).toFixed(2)}</span>
                      </div>
                      <Button
                        data-testid="button-order"
                        className="w-full h-12 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/30"
                        onClick={handleOrder}
                        disabled={createOrder.isPending}
                      >
                        <ShoppingCart className="w-5 h-5 ml-2" />
                        {createOrder.isPending ? "جارٍ الطلب..." : "اطلب الآن"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      data-testid="button-login-to-order"
                      className="w-full h-12"
                      onClick={() => setLocation("/login")}
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                      سجل الدخول للطلب
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </RootLayout>
  );
}
