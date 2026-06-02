import { useState } from "react";
import {
  useListServices, useCreateService, useUpdateService, useDeleteService,
  useListCategories, useListProviders,
  getListServicesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Plus, Pencil, Trash2, ImageIcon, Search, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";

type ServiceForm = {
  name: string; description: string; imageUrl: string; price: string;
  categoryId: string; providerId: string; providerServiceId: string;
  isFeatured: boolean; isVisible: boolean;
};
const emptyForm: ServiceForm = {
  name: "", description: "", imageUrl: "", price: "",
  categoryId: "", providerId: "", providerServiceId: "",
  isFeatured: false, isVisible: true,
};

export default function AdminServices() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListServices({ search: search || undefined, limit: 50 });
  const { data: categories } = useListCategories();
  const { data: providers } = useListProviders();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });

  const openCreate = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (s: any) => {
    setEditId(s.id);
    setForm({
      name: s.name,
      description: s.description || "",
      imageUrl: s.imageUrl || "",
      price: String(s.price),
      categoryId: s.categoryId ? String(s.categoryId) : "",
      providerId: s.providerId ? String(s.providerId) : "",
      providerServiceId: s.providerServiceId || "",
      isFeatured: s.isFeatured,
      isVisible: s.isVisible,
    });
    setOpen(true);
  };

  const handleSave = () => {
    const payload: any = {
      name: form.name,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      price: Number(form.price),
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      providerId: form.providerId ? Number(form.providerId) : undefined,
      providerServiceId: form.providerServiceId || undefined,
      isFeatured: form.isFeatured,
      isVisible: form.isVisible,
    };
    if (editId) {
      updateService.mutate({ id: editId, data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "تم تحديث الخدمة" }); },
        onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
      });
    } else {
      createService.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "تم إضافة الخدمة" }); },
        onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
      });
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">الخدمات</h1>
            <p className="text-muted-foreground text-sm">إدارة خدمات المنصة</p>
          </div>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-sm">
            <Plus className="w-4 h-4 ml-1" />إضافة خدمة
          </Button>
        </div>

        <div className="relative mb-5 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="pr-10" />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {isLoading
            ? <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            : <div className="divide-y divide-border">
                {data?.services.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">لا توجد خدمات</div>
                )}
                {data?.services.map(svc => (
                  <div key={svc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-black/3 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                      {svc.imageUrl ? <img src={svc.imageUrl} alt={svc.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{svc.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground truncate">{svc.description?.slice(0, 40)}</p>
                        {svc.providerServiceId && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 flex items-center gap-1 flex-shrink-0">
                            <Link2 className="w-3 h-3" />
                            {svc.providerServiceId}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary hidden sm:block">${svc.price}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full hidden md:block ${svc.isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {svc.isVisible ? "مرئي" : "مخفي"}
                    </span>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(svc)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("حذف هذه الخدمة؟")) deleteService.mutate({ id: svc.id }, { onSuccess: invalidate }); }} className="text-red-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-[95vw]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pl-1">
            <div>
              <Label>اسم الخدمة *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>الوصف</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="mb-2 block">صورة الخدمة</Label>
              <ImageUpload value={form.imageUrl} onChange={url => setForm(f => ({ ...f, imageUrl: url }))} placeholder="رفع صورة الخدمة" />
            </div>
            <div>
              <Label>السعر *</Label>
              <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="mt-1" dir="ltr" />
            </div>
            <div>
              <Label>القسم</Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v === "none" ? "" : v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر قسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون قسم</SelectItem>
                  {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="border border-border rounded-xl p-3 space-y-3 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground">إعدادات التنفيذ التلقائي (اختياري)</p>
              <div>
                <Label>مزود الخدمة</Label>
                <Select value={form.providerId} onValueChange={v => setForm(f => ({ ...f, providerId: v === "none" ? "" : v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر مزود الخدمة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون مزود</SelectItem>
                    {providers?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {form.providerId && (
                <div>
                  <Label>معرف الخدمة عند المزود (Service ID)</Label>
                  <Input
                    value={form.providerServiceId}
                    onChange={e => setForm(f => ({ ...f, providerServiceId: e.target.value }))}
                    className="mt-1 font-mono"
                    dir="ltr"
                    placeholder="مثال: 1234"
                  />
                  <p className="text-xs text-muted-foreground mt-1">هذا الرقم يُستخدم لتنفيذ الطلبات تلقائياً عبر API المزود</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))} />
                <Label>مميزة</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isVisible} onCheckedChange={v => setForm(f => ({ ...f, isVisible: v }))} />
                <Label>مرئية</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={createService.isPending || updateService.isPending} className="bg-primary hover:bg-primary/90">
              {editId ? "حفظ التعديلات" : "إضافة الخدمة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
