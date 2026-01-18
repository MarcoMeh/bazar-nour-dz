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
import { StoreThemeWrapper } from "@/components/store/StoreThemeWrapper";
import { STORE_THEMES } from "@/config/themes";

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
  theme_id?: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  text_color?: string;
  phone_numbers?: string[];
}

const CATEGORY_IDS = {
  WOMEN: "157d6be9-fc68-45c7-a1a3-798ca55b8b9f",
  MEN: "21f91d9f-b396-47e6-8e95-da8269aa9fde",
  KIDS: "ffaa15ae-6fad-45a1-b1b5-aa7c54edbcf2",
  UNDERWEAR: "d65bd4b9-8ef0-46f3-ac7c-cc89912c5a0b",
  ACCESSORIES: "bf4652fd-bd43-46db-9419-1fb1abc97bb8",
  SHOES: "7331fe06-31be-44e7-b868-adcdb8d339d9",
};

const getThemeType = (store: StoreDetails | null) => {
  if (store?.theme_id) return store.theme_id;

  // Fallback to category-based matching
  const categoryId = store?.category_id || store?.store_category_relations?.[0]?.category_id;
  if (!categoryId) return 'default';

  if (categoryId === CATEGORY_IDS.WOMEN || categoryId === CATEGORY_IDS.UNDERWEAR) return 'women-soft';
  if (categoryId === CATEGORY_IDS.MEN) return 'men-minimal';
  if (categoryId === CATEGORY_IDS.KIDS) return 'kids-playful';
  return 'default';
};

const StoreFront = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [themeId, setThemeId] = useState("default");
  const [loadingStore, setLoadingStore] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const theme = STORE_THEMES.find(t => t.id === themeId) || STORE_THEMES[0];

  useEffect(() => {
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
        setThemeId(getThemeType(mappedStore));
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

  const TikTokIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1 .05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );

  if (loadingStore) return <LoadingSpinner fullScreen message="جاري تجهيز المتجر..." />;
  if (!store) return <div className="min-h-screen flex items-center justify-center">المتجر غير موجود</div>;

  const renderHeader = () => {
    const isElegant = theme.styles.headerStyle === 'elegant';
    const isBold = theme.styles.headerStyle === 'bold';
    const isMinimal = theme.styles.headerStyle === 'minimal';

    return (
      <div className={`md:container md:mx-auto md:px-4 ${isMinimal ? 'pt-4' : 'md:pt-8'}`}>
        <div className={`relative store-card md:rounded-3xl overflow-hidden mb-8 border-none ${isElegant ? 'shadow-2xl' : ''}`}>

          {/* Cover Overlay for Bold Theme */}
          {isBold && (
            <div className="absolute inset-0 bg-[var(--store-primary)] opacity-10 mix-blend-multiply" />
          )}

          {/* Cover Image Banner */}
          {store.cover_image_url && (
            <div className={`w-full ${isElegant ? 'h-48 md:h-80' : 'h-40 md:h-64'} bg-gray-100 relative group`}>
              <img
                src={store.cover_image_url}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${isElegant ? 'from-black/80 via-black/20' : 'from-black/60'} to-transparent`} />
            </div>
          )}

          {/* Store Info Container */}
          <div className={`relative px-6 pb-8 ${store.cover_image_url ? '-mt-16 md:-mt-24' : 'pt-8'}`}>
            <div className={`flex flex-col gap-6 store-logo-container`}>

              {/* Logo & Status */}
              <div className="relative shrink-0">
                <div className={`relative ${isElegant ? 'w-32 h-32 md:w-48 md:h-48' : 'w-24 h-24 md:w-40 md:h-40'} rounded-2xl md:rounded-3xl border-4 ${isElegant ? 'border-[var(--store-accent)]' : 'border-[var(--store-background)]'} shadow-xl overflow-hidden bg-[var(--store-card-bg)]`}>
                  {store.image_url ? (
                    <img src={store.image_url} className="w-full h-full object-cover" alt={store.name} />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                      {store.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[var(--store-accent)] text-white p-1 rounded-full border-[3px] border-[var(--store-background)] shadow-lg">
                  <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6" />
                </div>
              </div>

              <div className={`flex-1 flex flex-col space-y-2 w-full`}>
                <div className="flex flex-col gap-1 w-full">
                  <h1 className={`${isBold ? 'text-4xl md:text-6xl uppercase tracking-tighter' : isElegant ? 'text-4xl md:text-5xl italic' : 'text-3xl md:text-4xl'} font-black w-full product-name`}>
                    {store.name}
                  </h1>
                  <div className={`flex flex-wrap items-center gap-4 text-sm opacity-80 font-semibold w-full store-logo-container`}>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[var(--store-primary)]" /> {store.address || "الجزائر"}</span>
                    {/* Social Media Icons */}
                    <div className="flex items-center gap-3">
                      {store.phone && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="bg-white/10 hover:bg-[var(--store-primary)] hover:text-white p-2 rounded-full transition-all">
                              <Phone className="w-4 h-4" />
                            </button>
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
                              <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <div>
                                      <p className="text-sm font-medium">رقم الهاتف الرئيسي</p>
                                      <p className="text-lg font-bold" dir="ltr">{store.phone}</p>
                                    </div>
                                  </div>
                                </div>

                                {store.phone_numbers && store.phone_numbers.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground mr-1">أرقام إضافية:</p>
                                    {store.phone_numbers.map((phone, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <Phone className="w-5 h-5 text-gray-400" />
                                          <p className="text-lg font-bold" dir="ltr">{phone}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
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
                      {store.whatsapp && (
                        <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-[var(--store-primary)] hover:text-white p-2 rounded-full transition-all">
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      {store.facebook && (
                        <a href={store.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-[var(--store-primary)] hover:text-white p-2 rounded-full transition-all">
                          <Facebook className="w-4 h-4" />
                        </a>
                      )}
                      {store.instagram && (
                        <a href={store.instagram} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-[var(--store-primary)] hover:text-white p-2 rounded-full transition-all">
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {store.tiktok && (
                        <a href={store.tiktok} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-[var(--store-primary)] hover:text-white p-2 rounded-full transition-all">
                          <TikTokIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {store.description && (
                  <p className={`text-base mt-4 max-w-3xl leading-relaxed opacity-90 product-description ${isElegant || theme.styles.layoutType === 'grid' || theme.styles.layoutType === 'modern' ? 'mx-auto' : ''}`}>
                    {store.description}
                  </p>
                )}
              </div>

              <div className={`flex flex-wrap ${isElegant ? 'justify-center' : 'md:justify-end'} gap-3 w-full md:w-auto`}>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getGridClass = () => {
    const { layoutType } = theme.styles;
    if (layoutType === 'masonry') return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start gap-4';
    if (layoutType === 'compact') return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3';
    if (layoutType === 'modern') return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8';
    // Default Grid
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-0';
  };

  return (
    <StoreThemeWrapper
      themeId={themeId}
      customColors={store ? {
        primary: store.primary_color,
        secondary: store.secondary_color,
        background: store.background_color,
        text: store.text_color
      } : undefined}
    >
      <SEO title={store.name} description={store.description || ""} image={store.image_url} />

      {renderHeader()}

      <div className="container mx-auto px-4 pb-20 overflow-x-hidden">

        {/* Advanced Search Bar */}
        <div className="sticky top-4 z-40 mb-12">
          <div className="relative store-card rounded-2xl p-2.5 flex gap-3 items-center border-none shadow-2xl">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--store-primary)]" />
              <Input
                placeholder="ما الذي تبحث عنه؟"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 h-14 bg-transparent border-none focus:ring-0 transition-all rounded-xl text-lg font-medium placeholder:opacity-40"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="h-14 px-6 rounded-xl store-btn border-none font-bold"
              >
                <Filter className="h-5 w-5 ml-2" />
                تصفية
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8 p-6 store-card rounded-2xl border-none animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <span className="font-black text-xl">نطاق السعر</span>
              <Badge variant="secondary" className="px-4 py-1.5 text-base font-bold bg-[var(--store-primary)] text-white">
                {priceRange[0]} - {priceRange[1]} دج
              </Badge>
            </div>
            <PriceRangeSlider min={0} max={50000} value={priceRange} onChange={setPriceRange} />
          </div>
        )}

        {/* PRODUCTS GRID */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : !productsData?.products?.length ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-3xl">
            <div className="inline-flex bg-white/80 p-6 rounded-full shadow-lg mb-4 text-[var(--store-primary)]">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black mb-2">لا توجد نتائج</h3>
            <p className="opacity-60 font-medium text-lg">حاول البحث عن شيء آخر أو تغيير خيارات التصفية</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-4 md:gap-8 ${getGridClass()}`}>
              {productsData.products.map((product) => (
                <div key={product.id} className={theme.styles.layoutType === 'masonry' ? (product.id.length % 5 === 0 ? 'row-span-2' : '') : ''}>
                  <ProductCard
                    {...product}
                    name_ar={product.name}
                    onQuickView={(p) => { setQuickViewProduct(p); setQuickViewOpen(true); }}
                  />
                </div>
              ))}
            </div>
            {productsData.totalCount > pageSize && (
              <div className="mt-16 flex justify-center">
                <Pagination currentPage={currentPage} totalPages={Math.ceil(productsData.totalCount / pageSize)} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick View - Styled by Theme Wrapper automatically */}
      <QuickViewModal product={quickViewProduct} open={quickViewOpen} onOpenChange={setQuickViewOpen} />

      {/* Footer Socials */}
      <div className="py-12 bg-black/5 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--store-primary)] flex items-center justify-center text-white font-black text-xl shadow-lg overflow-hidden border-2 border-white/10">
              {store.image_url ? (
                <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                store.name.charAt(0)
              )}
            </div>
            <div>
              <h4 className="font-black text-lg">{store.name}</h4>
              <p className="text-xs opacity-50 font-bold">جميع الحقوق محفوظة © 2024</p>
            </div>
          </div>
          <div className="flex gap-4">
            {store.phone && (
              <a href={`tel:${store.phone}`} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-xl text-gray-700 hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </a>
            )}
            {store.whatsapp && (
              <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-xl text-[#25D366] hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </a>
            )}
            {store.facebook && (
              <a href={store.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-xl text-[#1877F2] hover:scale-110 transition-transform">
                <Facebook className="w-6 h-6 fill-current" />
              </a>
            )}
            {store.instagram && (
              <a href={store.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-xl text-[#E4405F] hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
              </a>
            )}
            {store.tiktok && (
              <a href={store.tiktok} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-xl text-black hover:scale-110 transition-transform">
                <TikTokIcon className="w-6 h-6" />
              </a>
            )}
          </div>
        </div>
      </div>
    </StoreThemeWrapper>
  );
};

export default StoreFront;