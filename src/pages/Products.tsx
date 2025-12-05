/* PREMIUM PRODUCTS PAGE - WORLD CLASS DESIGN */

import { useState, useEffect } from "react";
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
import { Pagination } from "@/components/Pagination";
import { LoadingSpinner } from "@/components/LoadingSpinner";
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
  parent_id?: string | null;
}

const Products = () => {
  const [searchParams] = useSearchParams();

  // View & Layout
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState(3);
  const [showFilters, setShowFilters] = useState(true);

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
  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: currentPage,
    pageSize,
    categoryId: selectedSubCategory || selectedMainCategory || undefined,
    storeId: selectedStore || undefined,
    search: debouncedSearch || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    isFreeDelivery: freeDeliveryFilter || undefined,
    isHomeDelivery: homeDeliveryFilter || undefined,
    inStockOnly,
    minRating,
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
    if (categoryParam) setSelectedMainCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
  }, [searchParams]);

  const mainCategories = categories.filter((c) => !c.parent_id);
  const subCategories = categories.filter((c) => c.parent_id === selectedMainCategory);

  const activeFiltersCount = [
    freeDeliveryFilter,
    homeDeliveryFilter,
    inStockOnly,
    minRating,
    selectedMainCategory,
    selectedSubCategory,
    priceRange[0] > 0 || priceRange[1] < 100000,
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gradient">
                <Sparkles className="inline-block ml-2 h-8 w-8" />
                اكتشف منتجاتنا
              </h1>
              <p className="text-muted-foreground">
                {productsData?.totalCount || 0} منتج متاح
              </p>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
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
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 أعمدة</SelectItem>
                    <SelectItem value="3">3 أعمدة</SelectItem>
                    <SelectItem value="4">4 أعمدة</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 ml-2" />
                فلاتر {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </div>
          </div>

          {/* Search & Sort Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 h-12 text-lg"
              />
            </div>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [field, order] = v.split("-");
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger className="w-48">
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

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className={`${showFilters ? "block" : "hidden"
              } md:block w-full md:w-80 shrink-0 animate-slide-up`}>
              <Card className="p-6 sticky top-4 glass-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    <h3 className="font-bold text-lg">الفلاتر</h3>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary">{activeFiltersCount}</Badge>
                    )}
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4 ml-1" />
                      مسح الكل
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
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

                  {/* Categories */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">الفئات</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {mainCategories.map((cat) => (
                        <div key={cat.id}>
                          <Button
                            variant={selectedMainCategory === cat.id ? "default" : "ghost"}
                            className="w-full justify-start"
                            size="sm"
                            onClick={() => {
                              setSelectedMainCategory(
                                selectedMainCategory === cat.id ? null : cat.id
                              );
                              setSelectedSubCategory(null);
                            }}
                          >
                            {cat.name}
                          </Button>
                          {selectedMainCategory === cat.id && subCategories.length > 0 && (
                            <div className="mr-4 mt-2 space-y-1">
                              {subCategories.map((sub) => (
                                <Button
                                  key={sub.id}
                                  variant={selectedSubCategory === sub.id ? "secondary" : "ghost"}
                                  className="w-full justify-start text-sm"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedSubCategory(
                                      selectedSubCategory === sub.id ? null : sub.id
                                    )
                                  }
                                >
                                  {sub.name}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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

                  {/* Rating Filter */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">التقييم</Label>
                    <div className="space-y-2">
                      {[4, 3, 2].map((rating) => (
                        <Button
                          key={rating}
                          variant={minRating === rating ? "default" : "ghost"}
                          className="w-full justify-start"
                          size="sm"
                          onClick={() =>
                            setMinRating(minRating === rating ? undefined : rating)
                          }
                        >
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                              />
                            ))}
                            <span className="mr-2">وأكثر</span>
                          </div>
                        </Button>
                      ))}
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
              <Card className="p-12 text-center animate-fade-in">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">لا توجد منتجات</h3>
                  <p className="text-muted-foreground mb-4">
                    جرب تغيير الفلاتر أو البحث عن شيء آخر
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button onClick={clearAllFilters}>
                      <X className="ml-2 h-4 w-4" />
                      مسح جميع الفلاتر
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <>
                <div
                  className={`grid gap-6 animate-fade-in ${viewMode === "grid"
                    ? `grid-cols-1 sm:grid-cols-2 ${gridCols === 4
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
