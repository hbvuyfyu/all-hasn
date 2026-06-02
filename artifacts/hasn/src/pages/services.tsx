import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useListServices, useListCategories } from "@workspace/api-client-react";
import { RootLayout } from "@/components/layout/root-layout";
import { motion } from "framer-motion";
import { Search, ImageIcon, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Services() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCategory = params.get("categoryId") ? Number(params.get("categoryId")) : undefined;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(initialCategory);

  const { data: servicesData, isLoading: loadingServices } = useListServices({
    categoryId: selectedCategory,
    search: search || undefined,
    limit: 24,
  });
  const { data: categories } = useListCategories();

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">جميع الخدمات</h1>
          <p className="text-muted-foreground">اكتشف مجموعتنا الكاملة من الخدمات الرقمية</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-search"
              type="search"
              placeholder="ابحث عن خدمة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-10 bg-black/5 border-border text-white placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === undefined ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(undefined)}
              className="rounded-full"
            >
              الكل
            </Button>
            {categories?.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                className="rounded-full"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loadingServices ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))
          ) : servicesData?.services.length === 0 ? (
            <div className="col-span-full text-center py-24 text-muted-foreground">
              <SlidersHorizontal className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">لا توجد خدمات تطابق بحثك</p>
            </div>
          ) : (
            servicesData?.services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  data-testid={`card-service-${service.id}`}
                  href={`/services/${service.id}`}
                  className="group flex flex-col bg-card border border-border hover:border-primary/30 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 h-full"
                >
                  <div className="aspect-[4/3] bg-black/5 relative overflow-hidden">
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-white/10" />
                      </div>
                    )}
                    {service.isFeatured && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary rounded-full text-xs text-white font-medium">
                        مميزة
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-white mb-2 line-clamp-1">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{service.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                      <span className="text-lg font-bold text-primary">${service.price}</span>
                      <span className="text-xs text-foreground/50 bg-black/5 px-2 py-1 rounded-lg">اطلب الآن</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </RootLayout>
  );
}
