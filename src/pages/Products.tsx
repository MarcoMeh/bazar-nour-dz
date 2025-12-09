/* PREMIUM PRODUCTS PAGE - WORLD CLASS DESIGN */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";
import { QuickViewModal } from "@/components/QuickViewModal";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useStore } from "@/hooks/useStores";
import { Pagination } from "@/components/Pagination";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  X,
  Star,
  TrendingUp,
  Sparkles,
  Filter,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  parent_id?: string | null;
}

import SEO from "@/components/SEO";

const Products = () => {
  const [searchParams] = useSearchParams();

  // View & Layout
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState(3);

  // Filters
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Price
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  // Advanced Filters
  const [freeDeliveryFilter, setFreeDeliveryFilter] = useState(false);
  const [homeDeliveryFilter, setHomeDeliveryFilter] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  // Fashion Filters
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Sort
  const [sortBy, setSortBy] = useState<"created_at" | "price" | "average_rating" | "view_count">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Quick View
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Fetch data
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: storeDetails } = useStore(selectedStore);

  // Prepare Categories Data
  const mainCategories = categories.filter((c) => !c.parent_id);
  const subCategories = categories.filter((c) => c.parent_id === selectedMainCategory);

  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: currentPage,
    pageSize,
    categoryId: selectedMainCategory || undefined,
    subcategoryId: selectedSubCategory || undefined,
    storeId: selectedStore || undefined,
    search: debouncedSearch || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    isFreeDelivery: freeDeliveryFilter || undefined,
    isHomeDelivery: homeDeliveryFilter || undefined,
    inStockOnly,
    minRating,
    sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
    colors: selectedColors.length > 0 ? selectedColors : undefined,
    sortBy,
    sortOrder,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const storeParam = searchParams.get("store");

    if (categoryParam) {
      setSelectedMainCategory(categoryParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    if (storeParam) {
      setSelectedStore(storeParam);
    }
  }, [searchParams]);

  const activeFiltersCount = [
    freeDeliveryFilter,
    homeDeliveryFilter,
    inStockOnly,
    minRating,
    selectedMainCategory,
    selectedSubCategory,
    priceRange[0] > 0 || priceRange[1] < 100000,
    selectedSizes.length > 0,
    selectedColors.length > 0,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setFreeDeliveryFilter(false);
    setHomeDeliveryFilter(false);
    setInStockOnly(false);
    setMinRating(undefined);
    setPriceRange([0, 100000]);
    setSearchTerm("");
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm font-medium mb-2">الفئة المختارة:</p>
        {selectedMainCategory ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-sm py-1 px-3">
              {categories.find(c => c.id === selectedMainCategory)?.name}
            </Badge>
            {selectedSubCategory && (
              <Badge variant="outline" className="text-sm py-1 px-3 bg-background">
                {categories.find(c => c.id === selectedSubCategory)?.name}
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">الكل</p>
        )}
      </div>

      {/* Price Range */}
      <div>
        <PriceRangeSlider
          min={0}
          max={100000}
          value={priceRange}
          onChange={setPriceRange}
        />
      </div>

      <Separator />

      {/* Quick Filters */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">خيارات سريعة</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="free-delivery"
              checked={freeDeliveryFilter}
              onCheckedChange={(checked) =>
                setFreeDeliveryFilter(checked as boolean)
              }
            />
            <label htmlFor="free-delivery" className="text-sm cursor-pointer">
              توصيل مجاني
            </label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="home-delivery"
              checked={homeDeliveryFilter}
              onCheckedChange={(checked) =>
                setHomeDeliveryFilter(checked as boolean)
              }
            />
            <label htmlFor="home-delivery" className="text-sm cursor-pointer">
              توصيل للمنزل
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

      <Separator />

      {/* Size Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">المقاس</Label>
        <div className="flex flex-wrap gap-2">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44'].map((size) => (
            <Button
              key={size}
              variant={selectedSizes.includes(size) ? "default" : "outline"}
              size="sm"
              className="h-8 px-3"
              onClick={() => {
                setSelectedSizes(prev =>
                  prev.includes(size)
                    ? prev.filter(s => s !== size)
                    : [...prev, size]
                );
                setCurrentPage(1);
              }}
            >
              {size}
            </Button>
          ))}
        </div>
        {selectedSizes.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            المختار: {selectedSizes.join(', ')}
          </div>
        )}
      </div>

      <Separator />

      {/* Color Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">اللون</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'أحمر', value: 'أحمر', color: '#EF4444' },
            { name: 'أزرق', value: 'أزرق', color: '#3B82F6' },
            { name: 'أخضر', value: 'أخضر', color: '#10B981' },
            { name: 'أصفر', value: 'أصفر', color: '#F59E0B' },
            { name: 'أسود', value: 'أسود', color: '#000000' },
            { name: 'أبيض', value: 'أبيض', color: '#FFFFFF' },
            { name: 'رمادي', value: 'رمادي', color: '#6B7280' },
            { name: 'بني', value: 'بني', color: '#92400E' },
            { name: 'وردي', value: 'وردي', color: '#EC4899' },
          ].map((color) => (
            <Button
              key={color.value}
              variant={selectedColors.includes(color.value) ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 gap-2"
              onClick={() => {
                setSelectedColors(prev =>
                  prev.includes(color.value)
                    ? prev.filter(c => c !== color.value)
                    : [...prev, color.value]
                );
                setCurrentPage(1);
              }}
            >
              <div
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: color.color }}
              />
              {color.name}
            </Button>
          ))}
        </div>
        {selectedColors.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            المختار: {selectedColors.join(', ')}
          </div>
        )}
      </div>

      <Separator />

      {/* Rating Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">التقييم</Label>
        <div className="space-y-2">
          {[4, 3, 2].map((rating) => (
            <Button
              key={rating}
              variant={minRating === rating ? "default" : "ghost"}
              className="w-full justify-start h-8"
              size="sm"
              onClick={() =>
                setMinRating(minRating === rating ? undefined : rating)
              }
            >
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                  />
                ))}
                <span className="mr-2 text-xs">وأكثر</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full mt-4 text-destructive border-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4 ml-2" />
          مسح جميع الفلاتر
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SEO
        title="تصفح المنتجات"
        description="اكتشف تشكيلة واسعة من المنتجات المميزة في بازارنا. تسوق الآن واحصل على أفضل العروض والأسعار."
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {/* Header */}
        <div className="mb-6 animate-slide-up">
          {selectedStore && storeDetails ? (
            <div className="relative mb-8">
              {/* Store Cover */}
              <div className="h-32 md:h-48 rounded-3xl bg-gradient-to-r from-primary/10 to-primary/5 relative overflow-hidden mb-12">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                {storeDetails.image_url && (
                  <img
                    src={storeDetails.image_url}
                    alt="Store Cover"
                    className="w-full h-full object-cover opacity-80 blur-[2px]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              </div>

              {/* Store Info */}
              <div className="absolute top-16 md:top-24 right-4 md:right-8 flex items-end gap-4 z-10">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background bg-white overflow-hidden shadow-xl flex items-center justify-center">
                    {storeDetails.image_url ? (
                      <img src={storeDetails.image_url} alt={storeDetails.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-gray-800">{storeDetails.name.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <div className="mb-2">
                  <Badge variant="secondary" className="mb-2">متجر موثوق</Badge>
                  <h1 className="text-2xl md:text-4xl font-black text-foreground">{storeDetails.name}</h1>
                </div>
              </div>

              {/* Store Description - Below header on mobile */}
              <div className="mt-4 md:mt-0 md:mr-40 px-2 max-w-2xl">
                <p className="text-muted-foreground text-sm md:text-base line-clamp-2 md:line-clamp-3">
                  {storeDetails.description || "أهلاً بكم في متجرنا! نقدم لكم أفضل المنتجات بأفضل الأسعار."}
                </p>
              </div>

              {/* Controls Wrapper for Store View */}
              <div className="flex items-center justify-end gap-3 mt-4">
                {/* View Controls & Filters duplicated here for store view */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        فلاتر
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="px-1 h-5 min-w-[1.25rem] text-[10px]">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                      <SheetHeader className="mb-6 text-right">
                        <SheetTitle className="flex items-center gap-2">
                          <SlidersHorizontal className="h-5 w-5" />
                          تصفية النتائج
                        </SheetTitle>
                      </SheetHeader>
                      <FiltersContent />
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
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
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gradient flex items-center">
                  <Sparkles className="inline-block ml-2 h-6 w-6 md:h-8 md:w-8 text-primary" />
                  اكتشف منتجاتنا
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  {productsData?.totalCount || 0} منتج متاح
                </p>
              </div>

              {/* View Controls & Filters */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        فلاتر
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="px-1 h-5 min-w-[1.25rem] text-[10px]">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                      <SheetHeader className="mb-6 text-right">
                        <SheetTitle className="flex items-center gap-2">
                          <SlidersHorizontal className="h-5 w-5" />
                          تصفية النتائج
                        </SheetTitle>
                      </SheetHeader>
                      <FiltersContent />
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="hidden md:flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
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

                {viewMode === "grid" && (
                  <Select value={gridCols.toString()} onValueChange={(v) => setGridCols(Number(v))}>
                    <SelectTrigger className="w-24 hidden md:flex">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 أعمدة</SelectItem>
                      <SelectItem value="3">3 أعمدة</SelectItem>
                      <SelectItem value="4">4 أعمدة</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 h-12 text-lg rounded-full"
              />
            </div>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [field, order] = v.split("-");
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger className="w-full sm:w-48 h-12 rounded-full">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">
                  <TrendingUp className="inline h-4 w-4 ml-2" />
                  الأحدث
                </SelectItem>
                <SelectItem value="price-asc">السعر: الأقل أولاً</SelectItem>
                <SelectItem value="price-desc">السعر: الأعلى أولاً</SelectItem>
                <SelectItem value="average_rating-desc">
                  <Star className="inline h-4 w-4 ml-2" />
                  الأعلى تقييماً
                </SelectItem>
                <SelectItem value="view_count-desc">الأكثر مشاهدة</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* Horizontal Category Navigation */}
        <div className="space-y-4">
          <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-none items-center">
            <Button
              variant={!selectedMainCategory ? "default" : "outline"}
              className={`rounded-full whitespace-nowrap px-6 h-10 ${!selectedMainCategory ? "bg-primary text-primary-foreground shadow-md" : "border-muted-foreground/30 hover:border-primary hover:text-primary bg-background"}`}
              onClick={() => {
                setSelectedMainCategory(null);
                setSelectedSubCategory(null);
              }}
            >
              الكل
            </Button>
            {mainCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedMainCategory === cat.id ? "default" : "outline"}
                className={`rounded-full whitespace-nowrap px-6 h-10 transition-all duration-300 gap-2 ${selectedMainCategory === cat.id ? "bg-primary text-primary-foreground shadow-md scale-105 font-bold" : "border-muted-foreground/30 hover:border-primary hover:text-primary bg-background"}`}
                onClick={() => {
                  setSelectedMainCategory(cat.id === selectedMainCategory ? null : cat.id);
                  setSelectedSubCategory(null);
                }}
              >
                {cat.image_url && <img src={cat.image_url} alt="" className="w-5 h-5 rounded-full object-cover border border-white/20" />}
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Sub Categories Row */}
          {selectedMainCategory && subCategories.length > 0 && (
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none items-center animate-fade-in bg-muted/30 p-2 rounded-xl">
              <Button
                variant={!selectedSubCategory ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-full whitespace-nowrap h-8 px-4 ${!selectedSubCategory ? "bg-white shadow-sm font-semibold" : "text-muted-foreground hover:bg-white/50"}`}
                onClick={() => setSelectedSubCategory(null)}
              >
                الكل
              </Button>
              {subCategories.map((sub) => (
                <Button
                  key={sub.id}
                  variant={selectedSubCategory === sub.id ? "secondary" : "ghost"}
                  size="sm"
                  className={`rounded-full whitespace-nowrap h-8 px-4 gap-2 transition-all ${selectedSubCategory === sub.id ? "bg-white shadow-sm font-semibold text-primary" : "text-muted-foreground hover:bg-white/50"}`}
                  onClick={() => setSelectedSubCategory(sub.id === selectedSubCategory ? null : sub.id)}
                >
                  {sub.image_url && <img src={sub.image_url} alt="" className="w-4 h-4 rounded-full object-cover" />}
                  {sub.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-72 shrink-0 animate-slide-up">
            <Card className="p-6 sticky top-24 glass-card border-none shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  <h3 className="font-bold text-lg">الفلاتر</h3>
                </div>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 ml-1" />
                    مسح
                  </Button>
                )}
              </div>
              <FiltersContent />
            </Card>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {productsLoading ? (
              <LoadingSpinner fullScreen={false} message="جاري تحميل المنتجات..." />
            ) : !productsData?.products?.length ? (
              <Card className="p-12 text-center animate-fade-in border-dashed">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4 text-muted-foreground/30">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">لا توجد منتجات</h3>
                  <p className="text-muted-foreground mb-4">
                    جرب تغيير الفلاتر أو البحث عن شيء آخر
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button onClick={clearAllFilters} variant="outline">
                      <X className="ml-2 h-4 w-4" />
                      مسح جميع الفلاتر
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <>
                <div
                  className={`grid gap-4 sm:gap-6 animate-fade-in ${viewMode === "grid"
                    ? `grid-cols-2 ${gridCols === 4
                      ? "lg:grid-cols-4"
                      : gridCols === 3
                        ? "lg:grid-cols-3"
                        : "lg:grid-cols-2"
                    }`
                    : "grid-cols-1"
                    }`}
                >
                  {productsData.products.map((product: any, index: number) => (
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

                {/* Pagination */}
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

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
};

export default Products;
