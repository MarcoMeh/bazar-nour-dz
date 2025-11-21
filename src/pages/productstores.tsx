// src/pages/productstores.tsx

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { debounce } from "lodash";
import { ArrowLeft, Inbox } from "lucide-react";

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
  supplier_name?: string;
  colors?: string[];
  sizes?: string[];
  is_delivery_home_available: boolean;
  is_delivery_desktop_available: boolean;
  is_sold_out: boolean;
  is_free_delivery: boolean;
  created_at?: string;
}

const ProductStores = () => {
  const [searchParams] = useSearchParams();
  const [supplierCategory, setSupplierCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const debouncedSetSearchTerm = useRef(debounce((value) => setSearchTerm(value), 500)).current;
  const debouncedSetMinPrice = useRef(debounce((value) => setMinPriceInput(value), 500)).current;
  const debouncedSetMaxPrice = useRef(debounce((value) => setMaxPriceInput(value), 500)).current;

  const supplierId = searchParams.get("supplier");

  useEffect(() => {
    if (supplierId) fetchSupplierCategory(supplierId);
  }, [supplierId]);

  useEffect(() => {
    if (supplierCategory) fetchProducts();
  }, [supplierCategory, searchTerm, minPriceInput, maxPriceInput, selectedColor, selectedSize]);

  const fetchSupplierCategory = async (id: string) => {
    const { data, error } = await supabase.from("store_owners").select("*").eq("id", id).single();

    if (error || !data) {
      toast.error("المورد غير موجود");
      return;
    }

    setSupplierCategory({
      id: data.id,
      name_ar: data.username,
      slug: data.username,
    });
  };

  const fetchProducts = async () => {
    setLoading(true);

    let query = supabase.from("products").select("*");

    query = query.eq("supplier_name", supplierCategory?.name_ar || "");

    if (searchTerm) query = query.ilike("name_ar", `%${searchTerm}%`);

    const parsedMin = parseFloat(minPriceInput);
    const parsedMax = parseFloat(maxPriceInput);

    if (!isNaN(parsedMin)) query = query.gte("price", parsedMin);
    if (!isNaN(parsedMax)) query = query.lte("price", parsedMax);

    if (selectedColor) query = query.contains("colors", [selectedColor]);
    if (selectedSize) query = query.contains("sizes", [selectedSize]);

    const { data, error } = (await query.order("created_at", { ascending: false })) as {
      data: Product[] | null;
      error: PostgrestError | null;
    };

    if (error) toast.error("خطأ في تحميل المنتجات");

    setProducts(data || []);
    setLoading(false);
  };

  const allColors = Array.from(new Set(products.flatMap((p) => p.colors || [])));
  const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes || [])));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">منتجات {supplierCategory?.name_ar}</h1>
          <p className="text-muted-foreground text-lg">جميع منتجات هذا المورد</p>
        </div>

        <Card className="mb-8 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-center">بحث وفلترة</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>البحث</Label>
              <Input type="text" onChange={(e) => debouncedSetSearchTerm(e.target.value)} />
            </div>

            <div>
              <Label>السعر الأدنى</Label>
              <Input type="number" onChange={(e) => debouncedSetMinPrice(e.target.value)} />
            </div>

            <div>
              <Label>السعر الأقصى</Label>
              <Input type="number" onChange={(e) => debouncedSetMaxPrice(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>اللون</Label>
              <select
                className="border p-2 rounded-lg w-full"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                <option value="">كل الألوان</option>
                {allColors.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>المقاس</Label>
              <select
                className="border p-2 rounded-lg w-full"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">كل المقاسات</option>
                {allSizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {loading ? (
          <p className="text-center">جاري التحميل...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl shadow border">
            <Inbox size={40} className="mx-auto mb-4 opacity-60" />
            <p className="text-xl mb-2">لا توجد منتجات</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        <Button variant="outline" onClick={() => history.back()} className="mt-6">
          <ArrowLeft size={16} /> الرجوع
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default ProductStores;