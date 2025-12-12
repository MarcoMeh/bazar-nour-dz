import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/useProducts";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";
import { QuickViewModal } from "@/components/QuickViewModal";
import { Pagination } from "@/components/Pagination";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Search, MapPin, Phone, Grid3x3, List, Filter, Store, ArrowRight,
  Instagram, Facebook, Share2, CheckCircle2, Star, Clock,
  Heart, Briefcase, Baby, ShoppingBag
} from "lucide-react";
import SEO from "@/components/SEO";

// --- TYPES ---
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
  store_categories?: { category_id: string }[];
}

// --- CONSTANT IDs (Matching your Data Exactly) ---
const CATEGORY_IDS = {
  WOMEN: "157d6be9-fc68-45c7-a1a3-798ca55b8b9f",
  MEN: "21f91d9f-b396-47e6-8e95-da8269aa9fde",
  KIDS: "ffaa15ae-6fad-45a1-b1b5-aa7c54edbcf2",
  UNDERWEAR: "d65bd4b9-8ef0-46f3-ac7c-cc89912c5a0b",
  ACCESSORIES: "bf4652fd-bd43-46db-9419-1fb1abc97bb8",
  SHOES: "7331fe06-31be-44e7-b868-adcdb8d339d9",
};

// --- THEME DEFINITIONS ---
const themes = {
  women: {
    type: "women",
    icon: <Heart className="w-4 h-4" />,
    label: "أزياء نسائية",
    pageBg: "bg-gradient-to-b from-[#FFF0F5] to-white",
    cardBorder: "border-pink-200",
    gradientOverlay: "bg-gradient-to-t from-rose-950/90 via-pink-900/40 to-transparent",
    titleFont: "font-serif italic", // Elegant font
    titleGradient: "text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]",
    primaryBtn: "bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white shadow-lg shadow-rose-200/50",
    secondaryBtn: "bg-white text-rose-600 hover:bg-rose-50 border-2 border-rose-100",
    badge: "bg-rose-100 text-rose-600 border-rose-200",
    iconColor: "text-rose-400",
    activeTab: "text-rose-600",
    backBtn: "bg-rose-900/30 hover:bg-rose-900/50 border-rose-200/20"
  },
  men: {
    type: "men",
    icon: <Briefcase className="w-4 h-4" />,
    label: "أزياء رجالية",
    pageBg: "bg-gradient-to-b from-[#F1F5F9] to-white",
    cardBorder: "border-slate-300",
    gradientOverlay: "bg-gradient-to-t from-slate-950/90 via-blue-950/50 to-transparent",
    titleFont: "font-mono uppercase tracking-wider", // Strong font
    titleGradient: "text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-slate-100 to-blue-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]",
    primaryBtn: "bg-gradient-to-r from-slate-800 to-blue-900 hover:from-slate-900 hover:to-blue-950 text-white shadow-lg shadow-slate-300/50",
    secondaryBtn: "bg-white text-slate-900 hover:bg-slate-100 border-2 border-slate-200",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    iconColor: "text-blue-500",
    activeTab: "text-slate-900",
    backBtn: "bg-slate-900/30 hover:bg-slate-900/50 border-slate-200/20"
  },
  kids: {
    type: "kids",
    icon: <Baby className="w-4 h-4" />,
    label: "عالم الأطفال",
    pageBg: "bg-gradient-to-b from-[#FFFAEB] to-white",
    cardBorder: "border-orange-200",
    gradientOverlay: "bg-gradient-to-t from-orange-950/80 via-yellow-900/30 to-transparent",
    titleFont: "font-comic", // Playful font (you might need to define this class)
    titleGradient: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-200 to-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]",
    primaryBtn: "bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 text-white shadow-lg shadow-orange-200/50",
    secondaryBtn: "bg-white text-orange-600 hover:bg-orange-50 border-2 border-orange-100",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    iconColor: "text-orange-400",
    activeTab: "text-orange-600",
    backBtn: "bg-orange-900/30 hover:bg-orange-900/50 border-orange-200/20"
  },
  default: {
    type: "default",
    icon: <Store className="w-4 h-4" />,
    label: "متجر رسمي",
    pageBg: "bg-[#F8F9FA]",
    cardBorder: "border-white/10",
    gradientOverlay: "bg-gradient-to-t from-black via-black/50 to-transparent",
    titleFont: "font-sans font-black", // Standard bold font
    titleGradient: "text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-300 drop-shadow-2xl",
    primaryBtn: "bg-black hover:bg-gray-900 text-white shadow-gray-300",
    secondaryBtn: "bg-white text-black hover:bg-gray-100",
    badge: "bg-white/10 text-white border-white/10",
    iconColor: "text-yellow-400",
    activeTab: "text-black",
    backBtn: "bg-white/10 hover:bg-white/20 border-white/20"
  }
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

  // View & Filters
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [freeDeliveryFilter, setFreeDeliveryFilter] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"created_at" | "price" | "average_rating">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      if (!slug) return;
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

        let query = supabase.from("stores").select(`
            *,
            whatsapp, facebook, instagram, tiktok,
            profiles:owner_id(phone, email, address),
            store_categories(category_id)
          `).eq("is_active", true);

        if (isUUID) query = query.eq("id", slug);
        else query = query.eq("slug", slug);

        const { data, error } = await query.single();

        if (error) throw error;

        const mappedStore = {
          ...data,
          phone: data.profiles?.phone,
          email: data.profiles?.email,
          address: data.profiles?.address
        };
        setStore(mappedStore);

        // HYBRID DETECTION LOGIC
        let foundId = data.category_id;
        if (!foundId && data.store_categories && data.store_categories.length > 0) {
          foundId = data.store_categories[0].category_id;
        }

        setCurrentTheme(getThemeById(foundId));

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoadingStore(false);
      }
    };
    fetchStore();
  }, [slug]);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: currentPage,
    pageSize,
    storeId: store?.id || undefined,
    search: debouncedSearch || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    isFreeDelivery: freeDeliveryFilter || undefined,
    inStockOnly,
    sortBy,
    sortOrder,
  });

  const activeFiltersCount = [freeDeliveryFilter, inStockOnly, priceRange[0] > 0 || priceRange[1] < 100000, debouncedSearch].filter(Boolean).length;
  const clearAllFilters = () => { setFreeDeliveryFilter(false); setInStockOnly(false); setPriceRange([0, 100000]); setSearchTerm(""); };

  if (loadingStore) return <LoadingSpinner fullScreen message="جاري تجهيز المتجر..." />;

  if (!store) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Store className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">المتجر غير موجود</h2>
        <Button onClick={() => navigate("/stores")}>العودة</Button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-20 font-cairo transition-colors duration-700 ${currentTheme.pageBg}`}>
      <SEO title={store.name} description={store.description || ""} image={store.image_url} />

      {/* DEBUG BAR REMOVED */}

      {/* HERO SECTION */}
      <div className="p-4 md:p-6 pb-0">
        <div className={`relative w-full h-[65vh] md:h-[75vh] rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-900 group border ${currentTheme.cardBorder}`}>

          {/* Background Image */}
          <div className="absolute inset-0">
            {store.image_url ? (
              <img src={store.image_url} alt={store.name} className="w-full h-full object-cover opacity-90 transition-transform duration-[3s] ease-out group-hover:scale-105" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                <Store className="text-white/5 w-64 h-64" />
              </div>
            )}
            <div className={`absolute inset-0 ${currentTheme.gradientOverlay} opacity-100`}></div>
          </div>

          {/* Back Button */}
          <div className="absolute top-6 left-6 z-30">
            <Link to="/stores">
              <div className={`backdrop-blur-xl text-white p-3 rounded-full transition-all duration-300 group-hover:-translate-x-1 ${currentTheme.backBtn}`}>
                <ArrowRight className="w-6 h-6" />
              </div>
            </Link>
          </div>

          {/* Category Badge */}
          <div className="absolute top-6 right-6 z-30 animate-slide-up delay-100">
            <Badge className={`backdrop-blur-md border-none py-1.5 px-4 text-sm gap-1.5 ${currentTheme.primaryBtn}`}>
              {currentTheme.icon}
              {currentTheme.label}
            </Badge>
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-20 px-4 z-20 text-center">

            {/* Avatar */}
            <div className="relative mb-6">
              <div className="absolute -inset-6 bg-white/10 backdrop-blur-xl rounded-full blur-xl animate-pulse-slow"></div>
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white/90 bg-white overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                {store.image_url ? (
                  <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-5xl font-bold">{store.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className={`absolute bottom-2 right-2 text-white p-1.5 rounded-full border-[3px] border-white shadow-md ${currentTheme.primaryBtn}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* NAME - UPDATED WITH FONT & REMOVED BLACK FONT WEIGHT */}
            <h1 className={`text-4xl md:text-6xl lg:text-7xl mb-4 tracking-tight drop-shadow-2xl ${currentTheme.titleFont} ${currentTheme.titleGradient}`}>
              {store.name}
            </h1>

            {/* Info Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge className={`backdrop-blur-md px-4 py-2 text-sm h-auto gap-2 rounded-xl ${currentTheme.badge}`}>
                <MapPin className={`w-4 h-4 ${currentTheme.iconColor}`} />
                {store.address || "توصيل 58 ولاية"}
              </Badge>
              <Badge className={`backdrop-blur-md px-4 py-2 text-sm h-auto gap-2 rounded-xl ${currentTheme.badge}`}>
                <Star className={`w-4 h-4 ${currentTheme.iconColor} fill-current`} />
                4.9 تقييم
              </Badge>
            </div>

            {/* Buttons - UPDATED WITH NEW STYLES */}
            <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl">
              {store.phone && (
                <a href={`tel:${store.phone}`} className="w-full md:flex-1">
                  <Button className={`w-full h-14 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform ${currentTheme.secondaryBtn}`}>
                    <Phone className={`w-5 h-5 ml-2 ${currentTheme.iconColor}`} />
                    اتصل بالمتجر
                  </Button>
                </a>
              )}
              {store.whatsapp && (
                <a href={store.whatsapp.startsWith('http') ? store.whatsapp : `https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer" className="w-full md:flex-1">
                  <Button className={`w-full h-14 rounded-2xl font-bold text-lg border-none shadow-xl hover:scale-[1.02] transition-transform ${currentTheme.primaryBtn}`}>
                    <span className="ml-2">WhatsApp</span>
                    تواصل الآن
                  </Button>
                </a>
              )}

              {/* Socials */}
              <div className="flex gap-2 bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                {store.instagram && (
                  <a href={store.instagram} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all hover:scale-110">
                    <Instagram className="w-6 h-6 text-pink-400" />
                  </a>
                )}
                {store.facebook && (
                  <a href={store.facebook} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all hover:scale-110">
                    <Facebook className="w-6 h-6 text-blue-400" />
                  </a>
                )}
                <button onClick={() => navigator.share({ title: store.name, url: window.location.href })} className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all hover:scale-110">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ابحث في هذا المتجر..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 bg-white shadow-sm border-gray-200 h-12 rounded-xl" />
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="md:hidden h-12 w-12 rounded-xl">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => { const [f, o] = v.split("-"); setSortBy(f as any); setSortOrder(o as any); }}>
              <SelectTrigger className="w-[180px] bg-white shadow-sm border-gray-200 h-12 rounded-xl"><SelectValue placeholder="ترتيب حسب" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">الأحدث</SelectItem>
                <SelectItem value="price-asc">الأرخص</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden md:flex items-center gap-1 bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm h-12">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className={`rounded-lg h-full ${viewMode === 'grid' ? currentTheme.primaryBtn : ''}`}><Grid3x3 className="h-4 w-4" /></Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className={`rounded-lg h-full ${viewMode === 'list' ? currentTheme.primaryBtn : ''}`}><List className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {showFilters && (
            <aside className="w-full md:w-72 shrink-0 animate-slide-up">
              <Card className="p-6 sticky top-4 bg-white shadow-sm border-gray-100 rounded-[1.5rem]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`font-bold flex items-center gap-2 ${currentTheme.activeTab}`}><Filter className="w-4 h-4" /> تصفية المنتجات</h3>
                  {activeFiltersCount > 0 && <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-destructive h-auto p-0">مسح الكل</Button>}
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className="mb-3 block text-sm text-gray-500">نطاق السعر</Label>
                    <PriceRangeSlider min={0} max={100000} value={priceRange} onChange={setPriceRange} />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox id="free-delivery" checked={freeDeliveryFilter} onCheckedChange={(c) => setFreeDeliveryFilter(c as boolean)} className={`data-[state=checked]:bg-black`} />
                      <label htmlFor="free-delivery" className="text-sm cursor-pointer font-medium">توصيل مجاني</label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox id="in-stock" checked={inStockOnly} onCheckedChange={(c) => setInStockOnly(c as boolean)} className={`data-[state=checked]:bg-black`} />
                      <label htmlFor="in-stock" className="text-sm cursor-pointer font-medium">متوفر</label>
                    </div>
                  </div>
                </div>
              </Card>
            </aside>
          )}

          <main className="flex-1">
            {productsLoading ? <LoadingSpinner fullScreen={false} message="جاري تحميل المنتجات..." /> : !productsData?.products?.length ? (
              <Card className="p-12 text-center animate-fade-in bg-white border-2 border-dashed border-gray-200 rounded-[2rem]">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4 grayscale opacity-50">🛍️</div>
                  <h3 className="text-2xl font-bold mb-2">لا توجد منتجات</h3>
                  <Button onClick={clearAllFilters}>عرض جميع المنتجات</Button>
                </div>
              </Card>
            ) : (
              <>
                <div className={`grid gap-6 animate-fade-in ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                  {productsData.products.map((product, index) => (
                    <div key={product.id} className="hover-lift animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <ProductCard {...product} name_ar={product.name} description_ar={product.description} is_delivery_home_available={product.is_delivery_home_available} is_delivery_desktop_available={product.is_delivery_desktop_available} is_sold_out={product.is_sold_out} is_free_delivery={product.is_free_delivery} onQuickView={(p) => { setQuickViewProduct(p); setQuickViewOpen(true); }} />
                    </div>
                  ))}
                </div>
                {productsData.totalCount > pageSize && <div className="mt-12 flex justify-center"><Pagination currentPage={currentPage} totalPages={Math.ceil(productsData.totalCount / pageSize)} onPageChange={setCurrentPage} /></div>}
              </>
            )}
          </main>
        </div>
      </div>
      <QuickViewModal product={quickViewProduct} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </div>
  );
};

export default ProductStores;