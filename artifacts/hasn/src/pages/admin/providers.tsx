import { useState } from "react";
import {
  useListProviders, useCreateProvider, useUpdateProvider, useDeleteProvider, useSyncProviderServices,
  useListProviderServices, useUpdateProviderServicesVisibility,
  useListCategories, getListProvidersQueryKey, getListServicesQueryKey, getListProviderServicesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Plus, Pencil, Trash2, RefreshCw, Server, Eye, EyeOff, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type ProvForm = {
  name: string;
  apiUrl: string;
  apiKey: string;
  defaultProfitMargin: string;
  defaultCategoryId: string;
  isActive: boolean;
};
const empty: ProvForm = { name: "", apiUrl: "", apiKey: "", defaultProfitMargin: "20", defaultCategoryId: "", isActive: true };

export default function AdminProviders() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProvForm>(empty);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [servicesBrowserId, setServicesBrowserId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [specificId, setSpecificId] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: providers, isLoading } = useListProviders();
  const { data: categories } = useListCategories();
  const create = useCreateProvider();
  const update = useUpdateProvider();
  const del = useDeleteProvider();
  const sync = useSyncProviderServices();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: browserServices, isLoading: loadingServices } = useListProviderServices(
    servicesBrowserId ?? 0,
    { query: { enabled: !!servicesBrowserId } as any }
  );
  const updateVisibility = useUpdateProviderServicesVisibility();

  const inv = () => qc.invalidateQueries({ queryKey: getListProvidersQueryKey() });

  const openCreate = () => { setEditId(null); setForm(empty); setOpen(true); };
  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      apiUrl: p.apiUrl || "",
      apiKey: "",
      defaultProfitMargin: String(p.defaultProfitMargin || 20),
      defaultCategoryId: p.defaultCategoryId ? String(p.defaultCategoryId) : "",
      isActive: p.isActive,
    });
    setOpen(true);
  };

  const handleSave = () => {
    const payload = {
      name: form.name,
      apiUrl: form.apiUrl || undefined,
      apiKey: form.apiKey || undefined,
      defaultProfitMargin: Number(form.defaultProfitMargin),
      defaultCategoryId: form.defaultCategoryId ? Number(form.defaultCategoryId) : undefined,
      isActive: form.isActive,
    };
    const opts = {
      onSuccess: () => { inv(); setOpen(false); toast({ title: "تم الحفظ بنجاح" }); },
      onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
    };
    editId ? update.mutate({ id: editId, data: payload }, opts) : create.mutate({ data: payload as any }, opts);
  };

  const handleSync = (id: number) => {
    setSyncingId(id);
    sync.mutate({ id }, {
      onSuccess: (data: any) => {
        toast({ title: data.message || `تم المزامنة: ${data.synced} خدمة` });
        setSyncingId(null);
        qc.invalidateQueries({ queryKey: getListServicesQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "حدث خطأ في المزامنة" });
        setSyncingId(null);
      },
    });
  };

  const openServicesBrowser = (id: number) => {
    setServicesBrowserId(id);
    setSelectedIds(new Set());
    setSpecificId("");
  };

  const allServices = browserServices?.services ?? [];
  const allIds = allServices.map(s => s.id);

  const selectAll = () => setSelectedIds(new Set(allIds));
  const deselectAll = () => setSelectedIds(new Set());

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkVisibility = (visible: boolean) => {
    if (selectedIds.size === 0) { toast({ variant: "destructive", title: "اختر خدمات أولاً" }); return; }
    updateVisibility.mutate(
      { id: servicesBrowserId!, data: { serviceIds: Array.from(selectedIds), isVisible: visible } },
      {
        onSuccess: (data: any) => {
          toast({ title: `تم تحديث ${data.updated} خدمة` });
          qc.invalidateQueries({ queryKey: getListServicesQueryKey() });
          if (servicesBrowserId) qc.invalidateQueries({ queryKey: getListProviderServicesQueryKey(servicesBrowserId) });
        },
        onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
      }
    );
  };

  const handleSpecificIdAdd = () => {
    if (!specificId.trim()) return;
    const ids = specificId.split(",").map(s => s.trim()).filter(Boolean);
    const matching = allServices.filter(s => ids.includes(String(s.providerServiceId)));
    if (matching.length === 0) { toast({ variant: "destructive", title: "لم يتم العثور على خدمات بهذه المعرّفات" }); return; }
    setSelectedIds(new Set(matching.map(s => s.id)));
    toast({ title: `تم تحديد ${matching.length} خدمة` });
    setSpecificId("");
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">مزودو الخدمة</h1>
            <p className="text-muted-foreground text-sm">إدارة مزودي الخدمات وخدماتهم</p>
          </div>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-sm">
            <Plus className="w-4 h-4 ml-1" />إضافة مزود
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
            : providers?.length === 0
              ? <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
                  <Server className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>لا توجد مزودون بعد</p>
                </div>
              : providers?.map(provider => {
                const cat = categories?.find(c => c.id === (provider as any).defaultCategoryId);
                return (
                  <div key={provider.id} className="flex items-start gap-3 md:gap-5 p-4 md:p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Server className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{provider.name}</p>
                      {provider.apiUrl && <p className="text-xs text-muted-foreground mt-0.5 truncate" dir="ltr">{provider.apiUrl}</p>}
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${provider.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {provider.isActive ? "نشط" : "معطل"}
                        </span>
                        {cat && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">الفئة: {cat.name}</span>}
                        {provider.lastSyncedAt && <span className="text-xs text-muted-foreground">آخر مزامنة: {new Date(provider.lastSyncedAt).toLocaleDateString("ar-SA")}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openServicesBrowser(provider.id)} className="text-purple-600 hover:text-purple-700 hover:bg-purple-50" title="إدارة خدمات المزود">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleSync(provider.id)} disabled={syncingId === provider.id} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="مزامنة الخدمات">
                        <RefreshCw className={`w-4 h-4 ${syncingId === provider.id ? "animate-spin" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(provider)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("حذف هذا المزود؟")) del.mutate({ id: provider.id }, { onSuccess: inv }); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Provider Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-[95vw]" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? "تعديل المزود" : "إضافة مزود جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>اسم المزود *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" placeholder="اسم المزود" />
            </div>
            <div>
              <Label>رابط الـ API (اختياري - للمزامنة التلقائية)</Label>
              <Input value={form.apiUrl} onChange={e => setForm(f => ({ ...f, apiUrl: e.target.value }))} className="mt-1" dir="ltr" placeholder="https://api.provider.com" />
            </div>
            <div>
              <Label>مفتاح الـ API (اختياري)</Label>
              <Input type="password" value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))} className="mt-1" dir="ltr" placeholder="أدخل المفتاح للتحديث" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>هامش الربح الافتراضي (%)</Label>
                <Input type="number" value={form.defaultProfitMargin} onChange={e => setForm(f => ({ ...f, defaultProfitMargin: e.target.value }))} className="mt-1" dir="ltr" />
              </div>
              <div>
                <Label>الفئة الافتراضية للخدمات</Label>
                <Select value={form.defaultCategoryId} onValueChange={v => setForm(f => ({ ...f, defaultCategoryId: v === "none" ? "" : v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر فئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون فئة</SelectItem>
                    {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              <Label>نشط</Label>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 leading-relaxed">
              💡 يمكنك إضافة مزود بدون API وإضافة خدماته يدوياً من صفحة الخدمات. إذا أضفت رابط API، يمكنك مزامنة الخدمات تلقائياً بضغطة زر.
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={create.isPending || update.isPending} className="bg-primary hover:bg-primary/90">
              {editId ? "حفظ" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Services Browser Dialog */}
      <Dialog open={!!servicesBrowserId} onOpenChange={v => !v && setServicesBrowserId(null)}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle>إدارة خدمات المزود</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Select all / deselect all + specific ID */}
            <div className="flex flex-wrap gap-2 items-center">
              <Button variant="outline" size="sm" onClick={selectAll} className="text-xs">
                <CheckSquare className="w-3.5 h-3.5 ml-1" />
                تحديد الكل ({allIds.length})
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll} className="text-xs">
                <Square className="w-3.5 h-3.5 ml-1" />
                إلغاء الكل
              </Button>
              <span className="text-xs text-muted-foreground">محدد: {selectedIds.size}</span>
            </div>

            {/* Enter specific provider service ID */}
            <div className="flex gap-2">
              <Input
                value={specificId}
                onChange={e => setSpecificId(e.target.value)}
                placeholder="أدخل معرّف الخدمة أو عدة معرّفات مفصولة بفواصل"
                className="text-sm"
                dir="ltr"
              />
              <Button variant="outline" size="sm" onClick={handleSpecificIdAdd} className="whitespace-nowrap text-xs">
                تحديد
              </Button>
            </div>

            {/* Visibility actions */}
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkVisibility(true)} disabled={updateVisibility.isPending} className="bg-green-600 hover:bg-green-700 text-white text-xs">
                  <Eye className="w-3.5 h-3.5 ml-1" />
                  إظهار المحددة ({selectedIds.size})
                </Button>
                <Button size="sm" onClick={() => handleBulkVisibility(false)} disabled={updateVisibility.isPending} variant="outline" className="border-gray-300 text-gray-600 text-xs">
                  <EyeOff className="w-3.5 h-3.5 ml-1" />
                  إخفاء المحددة
                </Button>
              </div>
            )}
          </div>

          {/* Services list */}
          <div className="flex-1 overflow-y-auto border border-border rounded-xl min-h-0">
            {loadingServices ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : allServices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">لا توجد خدمات لهذا المزود</p>
                <p className="text-xs mt-1">قم بالمزامنة أولاً لاستيراد الخدمات</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {allServices.map(svc => (
                  <div
                    key={svc.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-black/3 transition-colors ${selectedIds.has(svc.id) ? "bg-primary/5" : ""}`}
                    onClick={() => toggleSelect(svc.id)}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selectedIds.has(svc.id) ? "bg-primary border-primary" : "border-border"}`}>
                      {selectedIds.has(svc.id) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{svc.name}</p>
                      {svc.providerServiceId && (
                        <p className="text-xs text-muted-foreground font-mono" dir="ltr">ID: {svc.providerServiceId}</p>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-primary">${svc.price}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${svc.isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {svc.isVisible ? "مرئي" : "مخفي"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setServicesBrowserId(null)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
