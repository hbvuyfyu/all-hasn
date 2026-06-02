import { useState } from "react";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";

type CatForm = { name: string; imageUrl: string; sortOrder: string; isVisible: boolean; };
const empty: CatForm = { name: "", imageUrl: "", sortOrder: "0", isVisible: true };

export default function AdminCategories() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CatForm>(empty);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: categories, isLoading } = useListCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const inv = () => qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });

  const openCreate = () => { setEditId(null); setForm(empty); setOpen(true); };
  const openEdit = (c: any) => { setEditId(c.id); setForm({ name: c.name, imageUrl: c.imageUrl || "", sortOrder: String(c.sortOrder), isVisible: c.isVisible }); setOpen(true); };

  const handleSave = () => {
    const payload = { name: form.name, imageUrl: form.imageUrl || undefined, sortOrder: Number(form.sortOrder), isVisible: form.isVisible };
    const opts = {
      onSuccess: () => { inv(); setOpen(false); toast({ title: editId ? "تم التحديث" : "تم الإضافة" }); },
      onError: () => toast({ variant: "destructive", title: "حدث خطأ" }),
    };
    editId ? update.mutate({ id: editId, data: payload }, opts) : create.mutate({ data: payload as any }, opts);
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold text-white mb-1">الأقسام</h1><p className="text-muted-foreground">إدارة أقسام الخدمات</p></div>
          <Button data-testid="button-add-category" onClick={openCreate} className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 ml-2" />إضافة قسم</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />) : categories?.map(cat => (
            <div key={cat.id} data-testid={`card-category-${cat.id}`} className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl hover:border-border transition-colors">
              {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" /> : <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold flex-shrink-0">{cat.name[0]}</div>}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.isVisible ? "مرئي" : "مخفي"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" data-testid={`button-edit-${cat.id}`} onClick={() => openEdit(cat)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" data-testid={`button-delete-${cat.id}`} onClick={() => { if (confirm("حذف؟")) del.mutate({ id: cat.id }, { onSuccess: inv }); }} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-white max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? "تعديل القسم" : "إضافة قسم جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>الاسم *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" />
            </div>
            <div>
              <Label className="mb-2 block">صورة القسم</Label>
              <ImageUpload value={form.imageUrl} onChange={url => setForm(f => ({ ...f, imageUrl: url }))} placeholder="رفع صورة القسم" />
            </div>
            <div>
              <Label>الترتيب</Label>
              <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="mt-1 bg-black/5 border-border text-white" dir="ltr" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isVisible} onCheckedChange={v => setForm(f => ({ ...f, isVisible: v }))} />
              <Label>مرئي</Label>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button data-testid="button-save-category" onClick={handleSave} disabled={create.isPending || update.isPending} className="bg-primary hover:bg-primary/90">{editId ? "حفظ" : "إضافة"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
