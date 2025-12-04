/* FULLY RESPONSIVE & SORTING + COLORS/SIZES FILTER — SAFE TO REPLACE */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Tag,
  LayoutGrid,
  ArrowLeft,
  Inbox,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Pagination } from "@/components/Pagination";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [sortField, setSortField] = useState<"name" | "price" | "created_at" | "view_count" | "average_rating">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [searchTerm, setSearchTerm] = useState("");
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  // New filter states
  const [freeDeliveryFilter, setFreeDeliveryFilter] = useState<boolean | undefined>(undefined);
  const [homeDeliveryFilter, setHomeDeliveryFilter] = useState<boolean | undefined>(undefined);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRatingFilter, setMinRatingFilter] = useState<number | undefined>(undefined);

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Fetch products with React Query
  const { data: productsData, isLoading: productsLoading, error } = useProducts({
    page: currentPage,
    pageSize,
    categoryId: selectedSubCategory || selectedMainCategory || undefined,
    storeId: selectedStore || undefined,
    search: searchTerm || undefined,
    minPrice: minPriceInput ? parseFloat(minPriceInput) : undefined,
    maxPrice: maxPriceInput ? parseFloat(maxPriceInput) : undefined,
    color: selectedColor || undefined,
    size: selectedSize || undefined,
    // New filters
    isFreeDelivery: freeDeliveryFilter,
    isHomeDelivery: homeDeliveryFilter,
    inStockOnly: inStockOnly,
    minRating: minRatingFilter,
    // Sort options
    sortBy: sortField,
    sortOrder: sortOrder,
  });

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const storeParam = searchParams.get("store");
    const searchParam = searchParams.get("search");

    if (categoryParam) {
      setSelectedMainCategory(categoryParam);
    }
    if (storeParam) {
      setSelectedStore(storeParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  // Extract available colors and sizes from products
  useEffect(() => {
    if (productsData?.products) {
      const colors = Array.from(
        new Set(productsData.products.flatMap((p) => p.colors || []))
      ).sort();
      const sizes = Array.from(
        new Set(productsData.products.flatMap((p) => p.sizes || []))
      ).sort();
      setAvailableColors(colors);
      setAvailableSizes(sizes);
    }
  }, [productsData]);

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error("حدث خطأ في تحميل المنتجات");
    }
  }, [error]);

  const getMainCategories = () => categories.filter((cat) => !cat.parent_id);
  const getSubCategories = (parentId: string) =>
    categories.filter((cat) => cat.parent_id === parentId);

  const handleMainCategoryClick = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleBackToMain = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setSearchTerm("");
    setSelectedColor("");
    setSelectedSize("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Client-side sorting
  const sortedProducts = [...(productsData?.products || [])].sort((a, b) => {
    let fieldA: any = a[sortField] ?? "";
    let fieldB: any = b[sortField] ?? "";

    if (sortField === "created_at") {
      fieldA = new Date(fieldA).getTime();
      fieldB = new Date(fieldB).getTime();
    }
    if (sortField === "price") {
      fieldA = Number(fieldA);
      fieldB = Number(fieldB);
    }
    if (sortField === "name") {
      fieldA = String(fieldA);
      fieldB = String(fieldB);
    }

    if (sortOrder === "asc") return fieldA > fieldB ? 1 : fieldA < fieldB ? -1 : 0;
    return fieldA < fieldB ? 1 : fieldA > fieldB ? -1 : 0;
  });

  const shouldShowProductGrid =
    selectedSubCategory || selectedMainCategory || (!selectedMainCategory && !selectedSubCategory);

  const loading = productsLoading || categoriesLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* HERO */}
        <div className="text-center mb-10 py-10 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-2">منتجاتنا المذهلة</h1>
          <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-xl mx-auto">
            اكتشف أحدث المنتجات وأفضل العروض.
          </p>
        </div>

        {/* FILTER BOX */}
        <Card className="mb-8 p-4 sm:p-6 md:p-8 bg-card rounded-xl shadow-xl border">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
            <Search size={20} /> بحث وفلترة
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative">
              <Label>البحث بالاسم</Label>
              <Input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8"
              />
              <Search className="absolute left-2 top-9 text-muted-foreground" size={16} />
            </div>

            <div className="relative">
              <Label>الحد الأدنى للسعر</Label>
              <Input
                type="number"
                value={minPriceInput}
                onChange={(e) => {
                  setMinPriceInput(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="0"
                className="w-full pl-8"
              />
              <span className="absolute left-2 top-9 text-muted-foreground text-sm">دج</span>
            </div>

            <div className="relative">
              <Label>الحد الأقصى للسعر</Label>
              <Input
                type="number"
                value={maxPriceInput}
                onChange={(e) => {
                  setMaxPriceInput(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="10000"
                className="w-full pl-8"
              />
              <span className="absolute left-2 top-9 text-muted-foreground text-sm">دج</span>
            </div>
          </div>

          {/* NEW: color & size selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>اللون</Label>
              <select
                value={selectedColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border p-2 rounded-lg"
              >
                <option value="">كل الألوان</option>
                {availableColors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>المقاس</Label>
              <select
                value={selectedSize}
                onChange={(e) => {
                  setSelectedSize(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border p-2 rounded-lg"
              >
                <option value="">كل المقاسات</option>
                {availableSizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery & Stock Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <Label>نوع التوصيل</Label>
              <select
                value={freeDeliveryFilter === true ? "free" : homeDeliveryFilter === true ? "home" : "all"}
                onChange={(e) => {
                  if (e.target.value === "free") {
                    setFreeDeliveryFilter(true);
                    setHomeDeliveryFilter(undefined);
                  } else if (e.target.value === "home") {
                    setFreeDeliveryFilter(undefined);
                    setHomeDeliveryFilter(true);
                  } else {
                    setFreeDeliveryFilter(undefined);
                    setHomeDeliveryFilter(undefined);
                  }
                  setCurrentPage(1);
                }}
                className="w-full border p-2 rounded-lg"
              >
                <option value="all">كل الخيارات</option>
                <option value="free">توصيل مجاني</option>
                <option value="home">توصيل للمنزل</option>
              </select>
            </div>

            <div>
              <Label>التوفر</Label>
              <select
                value={inStockOnly ? "in-stock" : "all"}
                onChange={(e) => {
                  setInStockOnly(e.target.value === "in-stock");
                  setCurrentPage(1);
                }}
                className="w-full border p-2 rounded-lg"
              >
                <option value="all">عرض الكل</option>
                <option value="in-stock">متوفر فقط</option>
              </select>
            </div>

            <div>
              <Label>التقييم</Label>
              <select
                value={minRatingFilter || "all"}
                onChange={(e) => {
                  setMinRatingFilter(e.target.value === "all" ? undefined : parseFloat(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full border p-2 rounded-lg"
              >
                <option value="all">جميع التقييمات</option>
                <option value="5">5 نجوم فقط</option>
                <option value="4">4 نجوم وأعلى</option>
                <option value="3">3 نجوم وأعلى</option>
              </select>
            </div>
          </div>

          {/* Sorting */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 justify-center">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="border p-2 rounded-lg"
            >
              <option value="created_at">التاريخ</option>
              <option value="name">الاسم</option>
              <option value="price">السعر</option>
              <option value="view_count">الأكثر مشاهدة</option>
              <option value="average_rating">الأعلى تقييماً</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="border p-2 rounded-lg"
            >
              <option value="desc">من الأعلى</option>
              <option value="asc">من الأسفل</option>
            </select>
          </div>
        </Card>

        {/* MAIN CATEGORIES */}
        {!selectedMainCategory && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
              <LayoutGrid size={20} /> التصنيفات
            </h2>

            {categoriesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {getMainCategories().map((cat) => (
                  <Card
                    key={cat.id}
                    onClick={() => handleMainCategoryClick(cat.id)}
                    className="cursor-pointer hover:shadow-lg transition p-2 sm:p-3"
                  >
                    <div className="h-24 sm:h-28 overflow-hidden rounded-md">
                      <img
                        src={cat.image_url || ""}
                        loading="lazy"
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-center mt-2 font-semibold text-sm sm:text-base">{cat.name}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB CATEGORIES */}
        {selectedMainCategory && !selectedSubCategory && (
          <div className="mb-8">
            <Button variant="outline" onClick={handleBackToMain} className="mb-4">
              <ArrowLeft size={16} /> العودة
            </Button>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
              <Tag size={20} /> التصنيفات الفرعية
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {getSubCategories(selectedMainCategory).map((cat) => (
                <Card
                  key={cat.id}
                  className="cursor-pointer hover:shadow-lg transition p-2 sm:p-3"
                  onClick={() => {
                    setSelectedSubCategory(cat.id);
                    setCurrentPage(1);
                  }}
                >
                  <div className="h-24 sm:h-28 overflow-hidden rounded-md">
                    <img
                      src={cat.image_url || ""}
                      loading="lazy"
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-center mt-2 font-semibold text-sm sm:text-base">{cat.name}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCT GRID */}
        {shouldShowProductGrid && (
          <>
            {(selectedMainCategory || selectedSubCategory) && (
              <Button
                variant="outline"
                onClick={() => (selectedSubCategory ? setSelectedSubCategory(null) : handleBackToMain())}
                className="mb-4"
              >
                <ArrowLeft size={16} /> العودة
              </Button>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" message="جاري تحميل المنتجات..." />
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl shadow border">
                <Inbox size={40} className="mx-auto mb-4 opacity-60" />
                <p className="text-lg sm:text-xl mb-2">لا توجد منتجات</p>
                <Button onClick={handleBackToMain}>عرض كل المنتجات</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>

                {productsData && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={productsData.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Products;
