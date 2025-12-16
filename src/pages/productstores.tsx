import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/useProducts";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";
import { QuickViewModal } from "@/components/QuickViewModal";
import { Pagination } from "@/components/Pagination";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Search, MapPin, Phone, Grid3x3, List, Filter, ArrowRight,
  Instagram, Facebook, CheckCircle2, Star, MessageCircle, ShoppingBag, Store, Clock, FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SEO from "@/components/SEO";

// ... (نفس تعريفات الواجهات Themes و Interfaces السابقة بدون تغيير) ...
// --- TYPES & CONSTANTS (Keep existing code here) ---
interface StoreDetails {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  created_at: string;
  category_id?: string;
  profiles?: { phone?: string; email?: string; address?: string; };
  store_category_relations?: { category_id: string }[];
  cover_image_url?: string;
  opening_hours?: string;
  location_url?: string;
  return_policy?: string;
}

const CATEGORY_IDS = {
  WOMEN: "157d6be9-fc68-45c7-a1a3-798ca55b8b9f",
  MEN: "21f91d9f-b396-47e6-8e95-da8269aa9fde",
  KIDS: "ffaa15ae-6fad-45a1-b1b5-aa7c54edbcf2",
  UNDERWEAR: "d65bd4b9-8ef0-46f3-ac7c-cc89912c5a0b",
  ACCESSORIES: "bf4652fd-bd43-46db-9419-1fb1abc97bb8",
  SHOES: "7331fe06-31be-44e7-b868-adcdb8d339d9",
};

const themes = {
  women: { label: "أزياء نسائية", bg: "bg-pink-50/30", badge: "bg-pink-100 text-pink-700 border-pink-200" },
  men: { label: "أزياء رجالية", bg: "bg-slate-50/30", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  kids: { label: "عالم الأطفال", bg: "bg-orange-50/30", badge: "bg-orange-100 text-orange-700 border-orange-200" },
  default: { label: "متجر رسمي", bg: "bg-gray-50/30", badge: "bg-gray-100 text-gray-700 border-gray-200" }
};

const getThemeById = (categoryId: string | undefined) => {
  if (!categoryId) return themes.default;
  if (categoryId === CATEGORY_IDS.WOMEN || categoryId === CATEGORY_IDS.UNDERWEAR) return themes.women;
  if (categoryId === CATEGORY_IDS.MEN) return themes.men;
  if (categoryId === CATEGORY_IDS.KIDS) return themes.kids;
  return themes.default;
};

const ProductStores = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [currentTheme, setCurrentTheme] = useState(themes.default);
  const [loadingStore, setLoadingStore] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // تم التقليل للتحميل الأسرع
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  useEffect(() => {
    // ... (نفس كود جلب البيانات السابق fetchStore) ...
    const fetchStore = async () => {
      if (!slug) return;
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        let query = supabase.from("stores").select(`*, whatsapp, facebook, instagram, tiktok, cover_image_url, opening_hours, location_url, return_policy, profiles:owner_id(phone, email, address), store_category_relations(category_id)`).eq("is_active", true);
        if (isUUID) query = query.eq("id", slug); else query = query.eq("slug", slug);

        const { data, error } = await query.single();
        if (error) throw error;
        const mappedStore = { ...data, phone: data.profiles?.phone, email: data.profiles?.email, address: data.profiles?.address };
        setStore(mappedStore);
        let foundId = data.category_id;
        if (!foundId && data.store_category_relations && data.store_category_relations.length > 0) foundId = data.store_category_relations[0].category_id;
        setCurrentTheme(getThemeById(foundId));
      } catch (error) { console.error("Error:", error); } finally { setLoadingStore(false); }
    };
    fetchStore();
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: currentPage, pageSize, storeId: store?.id || undefined, search: debouncedSearch || undefined,
    minPrice: priceRange[0], maxPrice: priceRange[1], sortBy: "created_at", sortOrder: "desc",
  });

  if (loadingStore) return <LoadingSpinner fullScreen message="جاري تجهيز المتجر..." />;
  if (!store) return <div className="min-h-screen flex items-center justify-center">المتجر غير موجود</div>;

  return (
    <div className={`min-h-screen pb-20 font-cairo ${currentTheme.bg}`}>
      <SEO title={store.name} description={store.description || ""} image={store.image_url} />

      {/* Store Header - Mobile Compact */}
      <div className="md:container md:mx-auto md:px-4 md:pt-6">
        <div className="relative bg-white md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">

          {/* Cover Image Banner */}
          {store.cover_image_url && (
            <div className="w-full h-32 md:h-56 bg-gray-100 relative">
              <img
                src={store.cover_image_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Store Info Container (Overlapping Cover if exists) */}
          <div className={`relative px-4 pb-6 ${store.cover_image_url ? '-mt-12 md:-mt-16' : 'pt-6'}`}>
            <div className="flex flex-col md:flex-row gap-4 md:items-end">

              {/* Logo & Status */}
              <div className="relative flex items-center gap-3 md:gap-4 shrink-0">
                <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-xl md:rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white shrink-0">
                  {store.image_url ? (
                    <img src={store.image_url} className="w-full h-full object-cover rounded-lg" alt={store.name} />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-lg text-2xl font-bold text-gray-400">
                      {store.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-[2px] border-white shadow-sm">
                  <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                </div>
              </div>

              {/* Name shown beside Avatar on Mobile for compactness */}
              <div className="mb-1 md:hidden flex-1">
                <h1 className="text-lg font-bold text-white drop-shadow-md line-clamp-1">{store.name}</h1>
                <Badge variant="secondary" className="bg-white/90 text-black text-[10px] px-2 h-5 border-0 backdrop-blur-sm">
                  {currentTheme.label}
                </Badge>
              </div>
            </div>

            {/* Desktop Name & Details */}
            <div className="hidden md:block flex-1 text-right mb-2 space-y-1">
              <h1 className="text-3xl font-black text-gray-900">{store.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {store.address || "الجزائر"}</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.9</span>
              </div>
              {store.description && (
                <p className="text-base text-gray-600 mt-2 max-w-2xl leading-relaxed">
                  {store.description}
                </p>
              )}
            </div>

            {/* Actions Bar - SIDE BY SIDE ON MOBILE */}
            <div className="flex flex-col gap-3 mt-2 md:mt-0 w-full md:w-auto">

              {/* Buttons Row - Fixed to be Row on Mobile */}
              <div className="flex gap-2 w-full">
                {store.whatsapp && (
                  <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer" className="flex-1 md:flex-none">
                    <Button className="w-full md:w-auto h-10 gap-1.5 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-sm text-sm">
                      <MessageCircle className="w-4 h-4" />
                      <span className="md:hidden">واتساب</span>
                      <span className="hidden md:inline">تواصل عبر واتساب</span>
                    </Button>
                  </a>
                )}
                {store.phone && (
                  <a href={`tel:${store.phone}`} className="flex-1 md:flex-none">
                    <Button variant="outline" className="w-full md:w-auto h-10 gap-1.5 rounded-lg border-gray-300 bg-white text-gray-700 text-sm">
                      <Phone className="w-4 h-4" />
                      <span className="md:hidden">اتصال</span>
                      <span className="hidden md:inline">اتصل بالمتجر</span>
                    </Button>
                  </a>
                )}

                {(store.opening_hours || store.location_url || store.return_policy) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto h-10 gap-1.5 rounded-lg border-gray-300 bg-white text-gray-700 text-sm">
                        <Store className="w-4 h-4" />
                        <span className="md:hidden">المحل</span>
                        <span className="hidden md:inline">معلومات المتجر</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md" dir="rtl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Store className="w-5 h-5 text-primary" />
                          معلومات {store.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {store.opening_hours && (
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2 text-sm text-gray-900">
                              <Clock className="w-4 h-4 text-primary" />
                              ساعات العمل
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                              {store.opening_hours}
                            </p>
                          </div>
                        )}
                        {store.location_url && (
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2 text-sm text-gray-900">
                              <MapPin className="w-4 h-4 text-primary" />
                              الموقع
                            </h4>
                            <a
                              href={store.location_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 p-3 rounded-md"
                            >
                              <MapPin className="w-4 h-4" />
                              عرض على خرائط جوجل
                            </a>
                          </div>
                        )}
                        {store.return_policy && (
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2 text-sm text-gray-900">
                              <FileText className="w-4 h-4 text-primary" />
                              سياسة الاستبدال والاسترجاع
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                              {store.return_policy}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Social Icons - Enhanced Visibility */}
              {(store.facebook || store.instagram || store.tiktok) && (
                <div className="flex justify-center md:justify-start gap-4 md:gap-3 mt-2 md:mt-0">
                  {store.facebook && (
                    <a href={store.facebook} target="_blank" rel="noreferrer" className="bg-white p-2 rounded-full shadow-sm text-[#1877F2] hover:scale-110 transition-transform">
                      <Facebook className="w-6 h-6 md:w-7 md:h-7 fill-current" />
                    </a>
                  )}
                  {store.instagram && (
                    <a href={store.instagram} target="_blank" rel="noreferrer" className="bg-white p-2 rounded-full shadow-sm text-[#E4405F] hover:scale-110 transition-transform">
                      <Instagram className="w-6 h-6 md:w-7 md:h-7" />
                    </a>
                  )}
                  {store.tiktok && (
                    <a href={store.tiktok} target="_blank" rel="noreferrer" className="bg-white p-2 rounded-full shadow-sm text-black hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Description - Mobile Only (Below actions) */}
            {store.description && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{store.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="container mx-auto px-3 md:px-4">

        {/* Compact Search Bar */}
        <div className="sticky top-2 z-30 mb-4">
          <div className="bg-white/90 backdrop-blur-xl p-2 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 h-10 bg-transparent border-transparent focus:bg-gray-50 transition-all rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-1">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode("grid")} className="h-10 w-10 rounded-lg"><Grid3x3 className="h-4 w-4" /></Button>
              <Button variant={showFilters ? "default" : "outline"} size="icon" onClick={() => setShowFilters(!showFilters)} className="h-10 w-10 rounded-lg md:hidden"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* Filters Drawer (Mobile) / Sidebar (Desktop) */}
        {showFilters && (
          <div className="mb-4 p-4 bg-white rounded-xl border border-gray-100 animate-slide-up md:hidden">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm">السعر: {priceRange[0]} - {priceRange[1]} دج</span>
              <Button variant="ghost" size="sm" onClick={() => { setPriceRange([0, 100000]); setShowFilters(false) }} className="text-xs text-red-500 h-auto p-0">إلغاء</Button>
            </div>
            <PriceRangeSlider min={0} max={50000} value={priceRange} onChange={setPriceRange} />
          </div>
        )}

        {/* PRODUCTS GRID */}
        {productsLoading ? (
          <LoadingSpinner fullScreen={false} message="" />
        ) : !productsData?.products?.length ? (
          <div className="text-center py-12">
            <div className="inline-flex bg-gray-100 p-4 rounded-full mb-3"><ShoppingBag className="w-8 h-8 text-gray-400" /></div>
            <p className="text-gray-500">لا توجد منتجات حالياً</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
              {productsData.products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  name_ar={product.name}
                  onQuickView={(p) => { setQuickViewProduct(p); setQuickViewOpen(true); }}
                />
              ))}
            </div>
            {productsData.totalCount > pageSize && (
              <div className="mt-8 flex justify-center pb-8">
                <Pagination currentPage={currentPage} totalPages={Math.ceil(productsData.totalCount / pageSize)} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>

      <QuickViewModal product={quickViewProduct} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </div>
  );
};

export default ProductStores;