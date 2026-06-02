import { useState, useEffect, useCallback } from "react";
import { RootLayout } from "@/components/layout/root-layout";
import { Link } from "wouter";
import { useListServices, useListCategories, useListBanners } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Search, Zap, Shield, Clock, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function BannerCarousel({ banners }: { banners: Array<{ id: number; imageUrl: string; images: string[]; frameHeight: number; title: string | null; linkUrl: string | null }> }) {
  const [current, setCurrent] = useState(0);

  const allBanners = banners.filter(b => {
    const imgs = b.images?.length ? b.images : b.imageUrl ? [b.imageUrl] : [];
    return imgs.length > 0;
  });

  const allSlides = allBanners.flatMap(b =>
    (b.images?.length ? b.images : b.imageUrl ? [b.imageUrl] : []).map(img => ({
      img,
      title: b.title,
      linkUrl: b.linkUrl,
      frameHeight: b.frameHeight || 400,
    }))
  );

  const next = useCallback(() => setCurrent(c => (c + 1) % allSlides.length), [allSlides.length]);
  const prev = () => setCurrent(c => (c - 1 + allSlides.length) % allSlides.length);

  useEffect(() => {
    if (allSlides.length <= 1) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [allSlides.length, next]);

  if (allSlides.length === 0) return null;

  const slide = allSlides[current];
  const height = slide.frameHeight;

  return (
    <div className="w-full relative overflow-hidden rounded-2xl mx-auto" style={{ maxHeight: height }}>
      <div className="relative w-full" style={{ height }}>
        {allSlides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {s.linkUrl ? (
              <a href={s.linkUrl} target="_blank" rel="noreferrer" className="block w-full h-full">
                <img src={s.img} alt={s.title || `banner-${i}`} className="w-full h-full object-cover" />
                {s.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white font-semibold text-lg">{s.title}</p>
                  </div>
                )}
              </a>
            ) : (
              <div className="w-full h-full">
                <img src={s.img} alt={s.title || `banner-${i}`} className="w-full h-full object-cover" />
                {s.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white font-semibold text-lg">{s.title}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {allSlides.length > 1 && (
          <>
            <button onClick={prev} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={next} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-20">
              {allSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all ${i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: servicesData, isLoading: loadingServices } = useListServices({ limit: 8, featured: true });
  const { data: categories, isLoading: loadingCategories } = useListCategories();
  const { data: banners, isLoading: loadingBanners } = useListBanners();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    if (search.trim()) window.location.href = `/services?search=${encodeURIComponent(search)}`;
  };

  return (
    <RootLayout>
      {/* Banner Carousel */}
      {!loadingBanners && banners && banners.length > 0 && (
        <section className="container mx-auto px-4 pt-6 pb-2">
          <BannerCarousel banners={banners as any} />
        </section>
      )}
      {loadingBanners && (
        <section className="container mx-auto px-4 pt-6 pb-2">
          <Skeleton className="w-full h-64 rounded-2xl" />
        </section>
      )}

      {/* Hero Section */}
      <section className="relative pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-[128px]" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-6xl font-bold mb-5 tracking-tight text-white"
            >
              الخدمات الرقمية،{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">بمستوى جديد</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-base md:text-lg text-muted-foreground mb-8"
            >
              أسرع وأضمن منصة لشحن الألعاب والخدمات الرقمية. أسعار منافسة، تنفيذ فوري، ودعم فني على مدار الساعة.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-xl flex items-center">
                <Search className="absolute right-4 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="ابحث عن خدمة، لعبة، أو بطاقة..."
                  className="w-full h-14 pl-4 pr-12 rounded-2xl bg-black/5 border border-border text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm"
                />
                <button onClick={handleSearch} className="absolute left-2 h-10 px-5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
                  بحث
                </button>
              </div>
            </motion.div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            {loadingCategories
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-11 w-28 rounded-xl" />)
              : categories?.map(cat => (
                <Link
                  key={cat.id}
                  href={`/services?categoryId=${cat.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
                >
                  {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-5 h-5 object-cover rounded" />}
                  {cat.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 md:py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white">الخدمات المميزة</h2>
            <Link href="/services" className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 text-sm">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {loadingServices
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 md:h-80 rounded-2xl" />)
              : servicesData?.services.map(service => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group flex flex-col bg-card border border-border hover:border-primary/30 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="aspect-[4/3] bg-black/5 relative overflow-hidden">
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-10 h-10 opacity-20" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm md:text-base text-white mb-1 line-clamp-1">{service.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">{service.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                      <span className="text-base md:text-xl font-bold text-primary">${service.price}</span>
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Zap, color: "text-primary bg-primary/10", title: "تنفيذ فوري", desc: "معظم خدماتنا تتم معالجتها وتسليمها بشكل آلي وفوري بمجرد إتمام الطلب." },
              { icon: Shield, color: "text-accent bg-accent/10", title: "دفع آمن", desc: "نوفر طرق دفع متعددة ومشفرة بالكامل لضمان أمان معلوماتك المالية." },
              { icon: Clock, color: "text-green-400 bg-green-500/10", title: "دعم 24/7", desc: "فريق دعم فني متواجد على مدار الساعة للرد على استفساراتكم ومساعدتكم." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-6 md:p-8 rounded-2xl bg-card border border-border text-center">
                <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto ${color} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </RootLayout>
  );
}
