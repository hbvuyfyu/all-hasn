import { useState, useEffect } from "react";
import {
  useGetSettings, useUpdateSettings, useListPaymentMethods, useCreatePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod,
  getGetSettingsQueryKey, getListPaymentMethodsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Plus, Pencil, Trash2, CreditCard, Globe, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type PayForm = { name: string; details: string; instructions: string; accountNumber: string; isActive: boolean; sortOrder: string };
const emptyPay: PayForm = { name: "", details: "", instructions: "", accountNumber: "", isActive: true, sortOrder: "0" };

export default function AdminSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading: loadingSettings } = useGetSettings();
  const { data: payMethods } = useListPaymentMethods();
  const updateSettings = useUpdateSettings();
  const createPay = useCreatePaymentMethod();
  const updatePay = useUpdatePaymentMethod();
  const deletePay = useDeletePaymentMethod();

  const [siteForm, setSiteForm] = useState({
    siteName: "", logoUrl: "", instagramUrl: "", whatsappUrl: "", facebookUrl: "", telegramUrl: "", maintenanceMode: false,
  });

  useEffect(() => {
    if (settings) setSiteForm({
      siteName: settings.siteName || "", logoUrl: settings.logoUrl || "",
      instagramUrl: settings.instagramUrl || "", whatsappUrl: settings.whatsappUrl || "",
      facebookUrl: settings.facebookUrl || "", telegramUrl: settings.telegramUrl || "",
      maintenanceMode: settings.maintenanceMode || false,
    });
  }, [settings]);

  const [payOpen, setPayOpen] = useState(false);
  const [payEditId, setPayEditId] = useState<number | null>(null);
  const [payForm, setPayForm] = useState<PayForm>(emptyPay);

  const handleSaveSite = () => {
    updateSettings.mutate({ data: siteForm as any }, {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() }); toast({ title: "تم حفظ الإعدادات" }); },
      onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
    });
  };

  const openPayCreate = () => { setPayEditId(null); setPayForm(emptyPay); setPayOpen(true); };
  const openPayEdit = (p: any) => { setPayEditId(p.id); setPayForm({ name: p.name, details: p.details || "", instructions: p.instructions || "", accountNumber: p.accountNumber || "", isActive: p.isActive, sortOrder: String(p.sortOrder) }); setPayOpen(true); };

  const handleSavePay = () => {
    const payload = { name: payForm.name, details: payForm.details || undefined, instructions: payForm.instructions || undefined, accountNumber: payForm.accountNumber || undefined, isActive: payForm.isActive, sortOrder: Number(payForm.sortOrder) };
    const inv = () => qc.invalidateQueries({ queryKey: getListPaymentMethodsQueryKey() });
    const opts = { onSuccess: () => { inv(); setPayOpen(false); toast({ title: "تم الحفظ" }); }, onError: () => toast({ variant: "destructive", title: "حدث خطأ" }) };
    payEditId ? updatePay.mutate({ id: payEditId, data: payload }, opts) : createPay.mutate({ data: payload as any }, opts);
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">الإعدادات</h1>
          <p className="text-muted-foreground">إعدادات المنصة وطرق الدفع</p>
        </div>

        <Tabs defaultValue="site" dir="rtl">
          <TabsList className="mb-6 bg-black/5">
            <TabsTrigger value="site"><Globe className="w-4 h-4 ml-1" />إعدادات الموقع</TabsTrigger>
            <TabsTrigger value="payments"><CreditCard className="w-4 h-4 ml-1" />طرق الدفع</TabsTrigger>
            <TabsTrigger value="social"><Share2 className="w-4 h-4 ml-1" />التواصل الاجتماعي</TabsTrigger>
          </TabsList>

          <TabsContent value="site">
            {loadingSettings ? <Skeleton className="h-48 rounded-2xl" /> : (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5 max-w-lg">
                <div><Label>اسم الموقع</Label><Input data-testid="input-site-name" value={siteForm.siteName} onChange={e => setSiteForm(f => ({ ...f, siteName: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" /></div>
                <div><Label>رابط الشعار</Label><Input data-testid="input-logo-url" value={siteForm.logoUrl} onChange={e => setSiteForm(f => ({ ...f, logoUrl: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" dir="ltr" /></div>
                <div className="flex items-center gap-3">
                  <Switch data-testid="switch-maintenance" checked={siteForm.maintenanceMode} onCheckedChange={v => setSiteForm(f => ({ ...f, maintenanceMode: v }))} />
                  <Label>وضع الصيانة</Label>
                </div>
                <Button data-testid="button-save-settings" onClick={handleSaveSite} disabled={updateSettings.isPending} className="bg-primary hover:bg-primary/90">{updateSettings.isPending ? "جارٍ الحفظ..." : "حفظ الإعدادات"}</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">طرق الدفع</h2>
              <Button data-testid="button-add-payment-method" onClick={openPayCreate} size="sm" className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 ml-1" />إضافة</Button>
            </div>
            <div className="space-y-3">
              {payMethods?.map(pm => (
                <div key={pm.id} data-testid={`card-payment-method-${pm.id}`} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-border transition-colors">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0"><CreditCard className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{pm.name}</p>
                    {pm.accountNumber && <p className="text-xs text-muted-foreground font-mono" dir="ltr">{pm.accountNumber}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${pm.isActive ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>{pm.isActive ? "نشط" : "معطل"}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" data-testid={`button-edit-pm-${pm.id}`} onClick={() => openPayEdit(pm)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" data-testid={`button-delete-pm-${pm.id}`} onClick={() => { if (confirm("حذف؟")) deletePay.mutate({ id: pm.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListPaymentMethodsQueryKey() }) }); }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="social">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 max-w-lg">
              {["instagramUrl", "whatsappUrl", "facebookUrl", "telegramUrl"].map(key => (
                <div key={key}>
                  <Label>{key.replace("Url", "").replace("instagram", "Instagram").replace("whatsapp", "WhatsApp").replace("facebook", "Facebook").replace("telegram", "Telegram")}</Label>
                  <Input data-testid={`input-${key}`} value={(siteForm as any)[key]} onChange={e => setSiteForm(f => ({ ...f, [key]: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" dir="ltr" placeholder="https://..." />
                </div>
              ))}
              <Button data-testid="button-save-social" onClick={handleSaveSite} disabled={updateSettings.isPending} className="bg-primary hover:bg-primary/90">{updateSettings.isPending ? "جارٍ الحفظ..." : "حفظ"}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="bg-card border-border text-white max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>{payEditId ? "تعديل طريقة الدفع" : "إضافة طريقة دفع"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>الاسم *</Label><Input data-testid="input-pm-name" value={payForm.name} onChange={e => setPayForm(f => ({ ...f, name: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" /></div>
            <div><Label>رقم الحساب</Label><Input data-testid="input-pm-account" value={payForm.accountNumber} onChange={e => setPayForm(f => ({ ...f, accountNumber: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" dir="ltr" /></div>
            <div><Label>التفاصيل</Label><Input data-testid="input-pm-details" value={payForm.details} onChange={e => setPayForm(f => ({ ...f, details: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" /></div>
            <div><Label>تعليمات الدفع</Label><Input data-testid="input-pm-instructions" value={payForm.instructions} onChange={e => setPayForm(f => ({ ...f, instructions: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" /></div>
            <div className="flex items-center gap-2"><Switch data-testid="switch-pm-active" checked={payForm.isActive} onCheckedChange={v => setPayForm(f => ({ ...f, isActive: v }))} /><Label>نشط</Label></div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="secondary" onClick={() => setPayOpen(false)}>إلغاء</Button>
            <Button data-testid="button-save-pm" onClick={handleSavePay} disabled={createPay.isPending || updatePay.isPending} className="bg-primary hover:bg-primary/90">{payEditId ? "حفظ" : "إضافة"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
