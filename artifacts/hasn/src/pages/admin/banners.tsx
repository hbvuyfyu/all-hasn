import { useState } from "react";
import { useListBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, getListBannersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload, MultiImageUpload } from "@/components/ui/image-upload";

type BannerForm = {
  images: string[];
  frameHeight: string;
  title: string;
  linkUrl: string;
  sortOrder: string;
  isActive: boolean;
};
const empty: BannerForm = { images: [], frameHeight: "400", title: "", linkUrl: "", sortOrder: "0", isActive: true };

export default function AdminBanners() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerForm>(empty);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: banners, isLoading } = useListBanners();
  const create = useCreateBanner();
  const update = useUpdateBanner();
  const del = useDeleteBanner();

  const inv = () => qc.invalidateQueries({ queryKey: getListBannersQueryKey() });

  const openCreate = () => { setEditId(null); setForm(empty); setOpen(true); };
  const openEdit = (b: any) => {
    setEditId(b.id);
    setForm({
      images: b.images || (b.imageUrl ? [b.imageUrl] : []),
      frameHeight: String(b.frameHeight || 400),
      title: b.title || "",
      linkUrl: b.linkUrl || "",
      sortOrder: String(b.sortOrder),
      isActive: b.isActive,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (form.images.length === 0) {
      toast({ variant: "destructive", title: "يرجى إضافة صورة واحدة على الأقل" });
      return;
    }
    const payload = {
      imageUrl: form.images[0] || "",
      images: form.images,
      frameHeight: Number(form.frameHeight) || 400,
      title: form.title || undefined,
      linkUrl: form.linkUrl || undefined,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    };
    const opts = {
      onSuccess: () => { inv(); setOpen(false); toast({ title: "تم الحفظ بنجاح" }); },
      onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
    };
    editId ? update.mutate({ id: editId, data: payload }, opts) : create.mutate({ data: payload as any }, opts);
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">البنرات</h1>
            <p className="text-muted-foreground text-sm">إدارة بنرات الصفحة الرئيسية</p>
          </div>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-sm">
            <Plus className="w-4 h-4 ml-1" />إضافة بنر
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
            : (banners?.length === 0
              ? <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
                  <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>لا توجد بنرات</p>
                </div>
              : banners?.map(banner => {
                const imgs = (banner as any).images?.length ? (banner as any).images : banner.imageUrl ? [banner.imageUrl] : [];
                return (
                  <div key={banner.id} className="flex items-center gap-3 md:gap-5 p-4 md:p-5 bg-card border border-border rounded-2xl hover:border-border transition-colors">
                    <div className="w-20 md:w-32 h-16 md:h-20 rounded-xl overflow-hidden bg-black/5 flex-shrink-0">
                      {imgs[0]
                        ? <img src={imgs[0]} alt={banner.title || "banner"} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-white/20" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{banner.title || "بنر بدون عنوان"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{imgs.length} صورة {(banner as any).frameHeight ? `• ارتفاع ${(banner as any).frameHeight}px` : ""}</p>
                      <span className={`mt-1 text-xs px-2 py-0.5 rounded-full inline-block ${banner.isActive ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
                        {banner.isActive ? "نشط" : "معطل"}
                      </span>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(banner)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("حذف هذا البنر؟")) del.mutate({ id: banner.id }, { onSuccess: inv }); }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                );
              })
            )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-white max-w-lg w-[95vw]" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? "تعديل البنر" : "إضافة بنر جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pl-1">
            <div>
              <Label className="mb-2 block">صور البنر * (يمكن إضافة أكثر من صورة للعرض التلقائي)</Label>
              <MultiImageUpload values={form.images} onChange={imgs => setForm(f => ({ ...f, images: imgs }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ارتفاع الإطار (px)</Label>
                <Input type="number" value={form.frameHeight} onChange={e => setForm(f => ({ ...f, frameHeight: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" dir="ltr" placeholder="400" />
              </div>
              <div>
                <Label>الترتيب</Label>
                <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" dir="ltr" />
              </div>
            </div>
            <div>
              <Label>العنوان (اختياري)</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" />
            </div>
            <div>
              <Label>رابط الوجهة (اختياري)</Label>
              <Input value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" dir="ltr" placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              <Label>نشط (يظهر في الصفحة الرئيسية)</Label>
            </div>
          </div>
          <DialogFooter className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={create.isPending || update.isPending} className="bg-primary hover:bg-primary/90">
              {editId ? "حفظ" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
