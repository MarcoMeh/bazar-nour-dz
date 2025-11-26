/* FULLY RESPONSIVE & SORTING + COLORS/SIZES FILTER — SAFE TO REPLACE */

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { debounce } from "lodash";
import {
  Search,
  Tag,
  DollarSign,
  LayoutGrid,
  ArrowLeft,
  Inbox,
} from "lucide-react";

interface Category {
  id: string;
  name_ar: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
}

interface Product {
  id: string;
  name_ar: string;
  description_ar?: string;
  price: number;
  image_url?: string;
  category_id?: string | null;
  colors?: string[]; // NEW
  sizes?: string[];  // NEW
  is_delivery_home_available: boolean;
  is_delivery_desktop_available: boolean;
  is_sold_out: boolean;
  is_free_delivery: boolean;
  created_at?: string; // needed for date sorting
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<"name_ar" | "price" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [searchTerm, setSearchTerm] = useState("");
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");
  const [globalMinMaxPrice, setGlobalMinMaxPrice] = useState<[number, number]>([0, 1000]);

  // NEW: color / size filters
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  const debouncedSetSearchTerm = useRef(debounce((value: string) => setSearchTerm(value), 500)).current;
  const debouncedSetMinPrice = useRef(debounce((value: string) => setMinPriceInput(value), 500)).current;
  const debouncedSetMaxPrice = useRef(debounce((value: string) => setMaxPriceInput(value), 500)).current;

  useEffect(() => {
    fetchCategories();
    fetchGlobalMinMaxPrices();
    fetchAvailableColorsAndSizes();

    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedMainCategory(categoryParam);
    } else {
      fetchProducts("", "", "");
    }

    return () => {
      debouncedSetSearchTerm.cancel();
      debouncedSetMinPrice.cancel();
      debouncedSetMaxPrice.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchProducts(searchTerm, minPriceInput, maxPriceInput, selectedColor, selectedSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubCategory, selectedMainCategory, searchTerm, minPriceInput, maxPriceInput, selectedColor, selectedSize]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name_ar");
    if (error) {
      toast.error("حدث خطأ في تحميل الفئات: " + (error.message || ""));
      return;
    }
    setCategories(data || []);
  };

  const fetchGlobalMinMaxPrices = async () => {
    // get min and max price quickly
    const { data, error } = await supabase
      .from("products")
      .select("price")
      .order("price", { ascending: true })
      .limit(10000); // safe guard - adjust if many products

    if (error || !data || data.length === 0) return;
    const prices = data.map((p) => Number(p.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    setGlobalMinMaxPrice([min, max]);
    setMinPriceInput(String(min));
    setMaxPriceInput(String(max));
  };

  const fetchAvailableColorsAndSizes = async () => {
    // fetch colors and sizes arrays from products and flatten unique values
    const { data, error } = await supabase
      .from("products")
      .select("colors, sizes")
      .limit(10000);

    if (error || !data) return;

    const colors = Array.from(new Set((data.flatMap((p: any) => p.colors || []) as string[])));
    const sizes = Array.from(new Set((data.flatMap((p: any) => p.sizes || []) as string[])));

    setAvailableColors(colors.sort());
    setAvailableSizes(sizes.sort());
  };

  const fetchProducts = async (
    currentSearchTerm: string,
    currentMinPriceInput: string,
    currentMaxPriceInput: string,
    colorFilter: string = "",
    sizeFilter: string = ""
  ) => {
    setLoading(true);
    let query = supabase.from("products").select("*");

    if (selectedSubCategory) {
      query = query.eq("category_id", selectedSubCategory);
    } else if (selectedMainCategory) {
      const subCategoryIds = categories.filter((cat) => cat.parent_id === selectedMainCategory).map((cat) => cat.id);
      if (subCategoryIds.length > 0) query = query.in("category_id", subCategoryIds);
    }

    if (currentSearchTerm) query = query.ilike("name_ar", `%${currentSearchTerm}%`);

    const parsedMin = parseFloat(currentMinPriceInput);
    const parsedMax = parseFloat(currentMaxPriceInput);

    if (!isNaN(parsedMin)) query = query.gte("price", parsedMin);
    if (!isNaN(parsedMax)) query = query.lte("price", parsedMax);

    // filter arrays using PostgREST `contains`
    if (colorFilter) {
      query = query.contains("colors", [colorFilter]);
    }
    if (sizeFilter) {
      query = query.contains("sizes", [sizeFilter]);
    }

    const { data, error } = (await query.order("created_at", { ascending: false })) as {
      data: Product[] | null;
      error: PostgrestError | null;
    };

    if (error) {
      toast.error("حدث خطأ في تحميل المنتجات: " + (error.message || ""));
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  const getMainCategories = () => categories.filter((cat) => !cat.parent_id);
  const getSubCategories = (parentId: string) => categories.filter((cat) => cat.parent_id === parentId);

  const handleMainCategoryClick = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory(null);
    setSearchTerm("");
  };

  const handleBackToMain = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setSearchTerm("");
    setSelectedColor("");
    setSelectedSize("");
  };

  const sortedProducts = [...products].sort((a, b) => {
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
    if (sortField === "name_ar") {
      fieldA = String(fieldA);
      fieldB = String(fieldB);
    }

    if (sortOrder === "asc") return fieldA > fieldB ? 1 : fieldA < fieldB ? -1 : 0;
    return fieldA < fieldB ? 1 : fieldA > fieldB ? -1 : 0;
  });

  const shouldShowProductGrid = selectedSubCategory || selectedMainCategory || (!selectedMainCategory && !selectedSubCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* HERO */}
        <div className="text-center mb-10 py-10 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-2">منتجاتنا المذهلة</h1>
          <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-xl mx-auto">اكتشف أحدث المنتجات وأفضل العروض.</p>
        </div>

        {/* FILTER BOX */}
        <Card className="mb-8 p-4 sm:p-6 md:p-8 bg-card rounded-xl shadow-xl border">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
            <Search size={20} /> بحث وفلترة
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative">
              <Label>البحث بالاسم</Label>
              <Input type="text" placeholder="ابحث عن منتج..." onChange={(e) => debouncedSetSearchTerm(e.target.value)} defaultValue={searchTerm} className="w-full pl-8" />
              <Search className="absolute left-2 top-9 text-muted-foreground" size={16} />
            </div>

            <div className="relative">
              <Label>الحد الأدنى للسعر</Label>
              <Input type="number" onChange={(e) => debouncedSetMinPrice(e.target.value)} defaultValue={minPriceInput} min={globalMinMaxPrice[0]} max={globalMinMaxPrice[1]} className="w-full pl-8" />
              <DollarSign className="absolute left-2 top-9 text-muted-foreground" size={16} />
            </div>

            <div className="relative">
              <Label>الحد الأقصى للسعر</Label>
              <Input type="number" onChange={(e) => debouncedSetMaxPrice(e.target.value)} defaultValue={maxPriceInput} min={globalMinMaxPrice[0]} max={globalMinMaxPrice[1]} className="w-full pl-8" />
              <DollarSign className="absolute left-2 top-9 text-muted-foreground" size={16} />
            </div>
          </div>

          {/* NEW: color & size selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>اللون</Label>
              <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-full border p-2 rounded-lg">
                <option value="">كل الألوان</option>
                {availableColors.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <Label>المقاس</Label>
              <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="w-full border p-2 rounded-lg">
                <option value="">كل المقاسات</option>
                {availableSizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Sorting */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 justify-center">
            <select value={sortField} onChange={(e) => setSortField(e.target.value as any)} className="border p-2 rounded-lg">
              <option value="name_ar">الاسم</option>
              <option value="price">السعر</option>
              <option value="created_at">التاريخ</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="border p-2 rounded-lg">
              <option value="asc">من الأسفل</option>
              <option value="desc">من الأعلى</option>
            </select>
          </div>
        </Card>

        {/* MAIN CATEGORIES */}
        {!selectedMainCategory && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
              <LayoutGrid size={20} /> التصنيفات
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {getMainCategories().map((cat) => (
                <Card key={cat.id} onClick={() => handleMainCategoryClick(cat.id)} className="cursor-pointer hover:shadow-lg transition p-2 sm:p-3">
                  <div className="h-24 sm:h-28 overflow-hidden rounded-md">
                    <img src={cat.image_url || ""} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-center mt-2 font-semibold text-sm sm:text-base">{cat.name_ar}</p>
                </Card>
              ))}
            </div>
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
                <Card key={cat.id} className="cursor-pointer hover:shadow-lg transition p-2 sm:p-3" onClick={() => setSelectedSubCategory(cat.id)}>
                  <div className="h-24 sm:h-28 overflow-hidden rounded-md">
                    <img src={cat.image_url || ""} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-center mt-2 font-semibold text-sm sm:text-base">{cat.name_ar}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCT GRID */}
        {shouldShowProductGrid && (
          <>
            {(selectedMainCategory || selectedSubCategory) && (
              <Button variant="outline" onClick={() => (selectedSubCategory ? setSelectedSubCategory(null) : handleBackToMain())} className="mb-4">
                <ArrowLeft size={16} /> العودة
              </Button>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 sm:h-60 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl shadow border">
                <Inbox size={40} className="mx-auto mb-4 opacity-60" />
                <p className="text-lg sm:text-xl mb-2">لا توجد منتجات</p>
                <Button onClick={handleBackToMain}>عرض كل المنتجات</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </>
        )}
      </main>


    </div>
  );
}

export default Products;
