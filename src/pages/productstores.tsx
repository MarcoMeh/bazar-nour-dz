import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import debounce from "lodash/debounce";
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
  colors?: string[];
  sizes?: string[];
  is_delivery_home_available: boolean;
  is_delivery_desktop_available: boolean;
  is_sold_out: boolean;
  is_free_delivery: boolean;
  created_at?: string;
  store_id: string; // Made required to match ProductCard
}

const ProductStores = () => {
  const [searchParams] = useSearchParams();
  const [supplierCategory, setSupplierCategory] = useState<{ id: string; name_ar: string; slug: string; image_url?: string | null } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const debouncedSetSearchTerm = useRef(debounce((value: string) => setSearchTerm(value), 500)).current;
  const debouncedSetMinPrice = useRef(debounce((value: string) => setMinPriceInput(value), 500)).current;
  const debouncedSetMaxPrice = useRef(debounce((value: string) => setMaxPriceInput(value), 500)).current;

  const supplierId = searchParams.get("supplier");

  useEffect(() => {
    if (supplierId) fetchSupplierCategory(supplierId);
  }, [supplierId]);

  useEffect(() => {
    if (supplierCategory) fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierCategory, searchTerm, minPriceInput, maxPriceInput, selectedColor, selectedSize]);

  const fetchSupplierCategory = async (id: string) => {
    // Corrected: Query 'stores' table, not 'store_owners'
    const { data, error } = await supabase.from("stores").select("*").eq("id", id).single();

    if (error || !data) {
      toast.error("المتجر غير موجود");
      return;
    }

    setSupplierCategory({
      id: data.id,
      name_ar: data.name, // 'stores' table has 'name'
      slug: data.name, // Using name as slug for now
      image_url: data.image_url ?? null
    });
  };

  const fetchProducts = async () => {
    setLoading(true);

    try {
      // Corrected: Query by 'store_id'
      let query = supabase.from("products").select("*").eq("store_id", supplierCategory?.id || "");

      if (searchTerm) query = query.ilike("name", `%${searchTerm}%`); // 'products' has 'name'

      const parsedMin = parseFloat(minPriceInput);
      const parsedMax = parseFloat(maxPriceInput);

      if (!isNaN(parsedMin)) query = query.gte("price", parsedMin);
      if (!isNaN(parsedMax)) query = query.lte("price", parsedMax);

      if (selectedColor) query = query.contains("colors", [selectedColor]);
      if (selectedSize) query = query.contains("sizes", [selectedSize]);

      const { data, error } = (await query.order("created_at", { ascending: false })) as {
        data: any[] | null; // Use any[] initially to map
        error: PostgrestError | null;
      };

      if (error) {
        throw error;
      }

      // Map DB columns to Product interface
      const mappedProducts: Product[] = (data || []).map((p) => ({
        id: p.id,
        name_ar: p.name,
        description_ar: p.description,
        price: p.price,
        image_url: p.image_url,
        colors: p.colors,
        sizes: p.sizes,
        is_delivery_home_available: p.is_delivery_home_available ?? true,
        is_delivery_desktop_available: p.is_delivery_desk_available ?? true, // Note: desk vs desktop naming
        is_sold_out: p.is_sold_out ?? false,
        is_free_delivery: p.is_free_delivery ?? false,
        created_at: p.created_at,
        store_id: p.store_id
      }));

      setProducts(mappedProducts);
    } catch (err) {
      console.error(err);
      toast.error("خطأ في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const allColors = Array.from(new Set(products.flatMap((p) => p.colors || [])));
  const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes || [])));

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            {supplierCategory?.image_url ? (
              <img src={supplierCategory.image_url} alt="store" className="w-20 h-16 object-cover rounded" />
            ) : null}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">منتجات {supplierCategory?.name_ar}</h1>
              <p className="text-muted-foreground text-lg">جميع منتجات هذا المتجر</p>
            </div>
          </div>
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

        <Button variant="outline" onClick={() => window.history.back()} className="mt-6">
          <ArrowLeft size={16} /> الرجوع
        </Button>
      </main>

    </div>
  );
};

export default ProductStores;
