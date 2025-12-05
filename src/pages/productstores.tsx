import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
}

const ProductStores = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const supplierId = searchParams.get("supplier");

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
      if (!supplierId) return;
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("*")
          .eq("id", supplierId)
          .single();

        if (error) throw error;
        setStore(data);
      } catch (error) {
        console.error("Error fetching store:", error);
        toast.error("فشل تحميل بيانات المتجر");
      } finally {
        setLoadingStore(false);
      }
    };

    fetchStore();
  }, [supplierId]);

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
    storeId: supplierId || undefined,
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
              <Button size="lg" className="shadow-lg hover-lift">
                <Phone className="ml-2 h-4 w-4" />
                اتصل الآن
              </Button>
              <Button size="lg" variant="outline" className="shadow-lg hover-lift bg-background/50 backdrop-blur-sm">
                <Mail className="ml-2 h-4 w-4" />
                راسلنا
              </Button>
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
                        is_delivery_home_available={product.home_delivery}
                        is_delivery_desktop_available={product.office_delivery}
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
