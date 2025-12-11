import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";
import { QuickViewModal } from "@/components/QuickViewModal";
import { Pagination } from "@/components/Pagination";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Grid3x3,
  List,
  Filter,
  TrendingUp,
  Star,
  Store,
  ArrowRight,
  X
} from "lucide-react";

interface StoreDetails {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  address?: string; // This might be in profiles too? stores uses owner address or store address? Schema has address in profiles. stores no address.
  phone?: string;
  email?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  created_at: string;
  profiles?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

const ProductStores = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Store Details
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);

  // View & Layout
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState(3);
  const [showFilters, setShowFilters] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [freeDeliveryFilter, setFreeDeliveryFilter] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sort
  const [sortBy, setSortBy] = useState<"created_at" | "price" | "average_rating">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Quick View
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Fetch Store Details
  useEffect(() => {
    const fetchStore = async () => {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from("stores")
          .select(`
            *,
            whatsapp,
            facebook,
            instagram,
            tiktok,
            profiles:owner_id(phone, email, address)
          `)
          .eq("slug", slug)
          .eq("is_active", true)
          .or(`subscription_end_date.gt.${new Date().toISOString()},subscription_end_date.is.null`)
          .single();

        console.log("Fetched Store Data:", data); // Debug log

        if (error) throw error;
        // Map profile data to store object if store fields are empty
        const mappedStore = {
          ...data,
          phone: data.profiles?.phone,
          email: data.profiles?.email,
          address: data.profiles?.address
        };
        setStore(mappedStore);
      } catch (error) {
        console.error("Error fetching store:", error);
        toast.error("فشل تحميل بيانات المتجر");
      } finally {
        setLoadingStore(false);
      }
    };

    fetchStore();
  }, [slug]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Products
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

  const activeFiltersCount = [
    freeDeliveryFilter,
    inStockOnly,
    priceRange[0] > 0 || priceRange[1] < 100000,
    debouncedSearch
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFreeDeliveryFilter(false);
    setInStockOnly(false);
    setPriceRange([0, 100000]);
    setSearchTerm("");
  };

  if (loadingStore) {
    return <LoadingSpinner fullScreen message="جاري تحميل المتجر..." />;
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">المتجر غير موجود</h2>
          <Button onClick={() => navigate("/stores")}>تصفح المتاجر الأخرى</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        {/* Background with blur */}
        <div className="absolute inset-0 bg-primary/5">
          {store.image_url && (
            <img
              src={store.image_url}
              alt={store.name}
              className="w-full h-full object-cover opacity-50 blur-xl scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Store Info */}
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/stores")}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            عودة للمتاجر
          </Button>

          <div className="flex flex-col md:flex-row items-end md:items-center gap-6 animate-slide-up">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-background shadow-2xl bg-white">
                {store.image_url ? (
                  <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <Store className="h-16 w-16 text-primary/40" />
                  </div>
                )}
              </div>
              <Badge className="absolute -bottom-3 -right-3 px-3 py-1 bg-green-500 hover:bg-green-600 shadow-lg">
                مفتوح الآن
              </Badge>
            </div>

            <div className="flex-1 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gradient">{store.name}</h1>
              {store.description && (
                <p className="text-muted-foreground max-w-2xl text-lg mb-4 line-clamp-2">
                  {store.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {store.address && (
                  <div className="flex items-center gap-1 bg-background/50 px-3 py-1 rounded-full backdrop-blur-sm border">
                    <MapPin className="h-4 w-4 text-primary" />
                    {store.address}
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-1 bg-background/50 px-3 py-1 rounded-full backdrop-blur-sm border">
                    <Phone className="h-4 w-4 text-primary" />
                    {store.phone}
                  </div>
                )}
                <div className="flex items-center gap-1 bg-background/50 px-3 py-1 rounded-full backdrop-blur-sm border">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>4.8 (120 تقييم)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {store.phone && (
                <a href={`tel:${store.phone}`}>
                  <Button size="lg" className="shadow-lg hover-lift">
                    <Phone className="ml-2 h-4 w-4" />
                    اتصل الآن
                  </Button>
                </a>
              )}
              {store.email && (
                <a href={`mailto:${store.email}`}>
                  <Button size="lg" variant="outline" className="shadow-lg hover-lift bg-background/50 backdrop-blur-sm">
                    <Mail className="ml-2 h-4 w-4" />
                    راسلنا
                  </Button>
                </a>
              )}
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-2 mt-4">
              {store.whatsapp && (
                <a href={store.whatsapp.startsWith('http') ? store.whatsapp : `https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="secondary" className="rounded-full text-green-600 hover:bg-[#25D366] hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  </Button>
                </a>
              )}
              {store.facebook && (
                <a href={store.facebook} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="secondary" className="rounded-full text-blue-600 hover:bg-[#1877F2] hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.376h3.558l-.46 3.667h-3.098v7.98h-4.843Z" /></svg>
                  </Button>
                </a>
              )}
              {store.instagram && (
                <a href={store.instagram} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="secondary" className="rounded-full text-pink-600 hover:bg-[#E4405F] hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  </Button>
                </a>
              )}
              {store.tiktok && (
                <a href={store.tiktok} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="secondary" className="rounded-full text-black hover:bg-black hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.03 5.84-.02 8.75-.08 1.46-.54 2.94-1.34 4.14-1.32 1.97-3.54 3.07-5.96 2.96-2.42-.11-4.58-1.6-5.64-3.83-1.06-2.23-.67-4.94.97-6.82 1.64-1.89 4.34-2.52 6.6-1.54V6.03c-2.84-.99-6.15-.37-8.4 1.63-2.25 2-3.12 5.25-2.2 8.11.92 2.86 3.65 4.92 6.63 5.02 2.99.1 5.8-1.69 7.07-4.5 1.27-2.81 1.08-6.1-.49-8.75V.02h-1.29c-.01 0-.01 0 0 0" /></svg>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في هذا المتجر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 bg-background/50 backdrop-blur-sm"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [field, order] = v.split("-");
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">الأحدث</SelectItem>
                <SelectItem value="price-asc">السعر: الأقل</SelectItem>
                <SelectItem value="price-desc">السعر: الأعلى</SelectItem>
                <SelectItem value="average_rating-desc">الأعلى تقييماً</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-full md:w-72 shrink-0 animate-slide-up">
              <Card className="p-6 sticky top-4 glass-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold">تصفية المنتجات</h3>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-destructive h-auto p-0">
                      مسح الكل
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <PriceRangeSlider
                      min={0}
                      max={100000}
                      value={priceRange}
                      onChange={setPriceRange}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="free-delivery"
                        checked={freeDeliveryFilter}
                        onCheckedChange={(checked) => setFreeDeliveryFilter(checked as boolean)}
                      />
                      <label htmlFor="free-delivery" className="text-sm cursor-pointer">
                        توصيل مجاني
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="in-stock"
                        checked={inStockOnly}
                        onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                      />
                      <label htmlFor="in-stock" className="text-sm cursor-pointer">
                        متوفر في المخزون
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            </aside>
          )}

          {/* Products Grid */}
          <main className="flex-1">
            {productsLoading ? (
              <LoadingSpinner fullScreen={false} message="جاري تحميل المنتجات..." />
            ) : !productsData?.products?.length ? (
              <Card className="p-12 text-center animate-fade-in bg-background/50 backdrop-blur-sm border-dashed">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🛍️</div>
                  <h3 className="text-2xl font-bold mb-2">لا توجد منتجات</h3>
                  <p className="text-muted-foreground mb-4">
                    لم يتم العثور على منتجات تطابق بحثك في هذا المتجر
                  </p>
                  <Button onClick={clearAllFilters}>عرض جميع المنتجات</Button>
                </div>
              </Card>
            ) : (
              <>
                <div
                  className={`grid gap-6 animate-fade-in ${viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                    }`}
                >
                  {productsData.products.map((product, index) => (
                    <div
                      key={product.id}
                      className="hover-lift animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard
                        {...product}
                        name_ar={product.name}
                        description_ar={product.description}
                        is_delivery_home_available={product.is_delivery_home_available}
                        is_delivery_desktop_available={product.is_delivery_desktop_available}
                        is_sold_out={product.is_sold_out}
                        is_free_delivery={product.is_free_delivery}
                        onQuickView={(p) => {
                          setQuickViewProduct(p);
                          setQuickViewOpen(true);
                        }}
                      />
                    </div>
                  ))}
                </div>

                {productsData.totalCount > pageSize && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(productsData.totalCount / pageSize)}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
};

export default ProductStores;
