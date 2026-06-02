import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json() as { url: string };
  return data.url;
}

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, placeholder = "رفع صورة", className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch {
      alert("فشل رفع الصورة، حاول مجدداً");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {value && (
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black/5 group">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 left-2 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <label className="flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl bg-black/5 border border-dashed border-border hover:bg-black/10 hover:border-primary/50 transition-all">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4 text-primary" />}
        <span className="text-sm text-foreground/70">{uploading ? "جارٍ الرفع..." : placeholder}</span>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
      </label>
    </div>
  );
}

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
}

export function MultiImageUpload({ values, onChange }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        newUrls.push(url);
      }
      onChange([...values, ...newUrls]);
    } catch {
      alert("فشل رفع الصور، حاول مجدداً");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {values.map((url, i) => (
            <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-black/5 group">
              <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 left-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {values.length === 0 && (
        <div className="flex items-center justify-center h-20 rounded-xl bg-black/3 border border-dashed border-border">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xs">لا توجد صور</p>
          </div>
        </div>
      )}
      <label className="flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl bg-black/5 border border-dashed border-border hover:bg-black/10 hover:border-primary/50 transition-all">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4 text-primary" />}
        <span className="text-sm text-foreground/70">{uploading ? "جارٍ الرفع..." : "رفع صور (يمكن اختيار أكثر من صورة)"}</span>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFile} className="hidden" disabled={uploading} />
      </label>
    </div>
  );
}
