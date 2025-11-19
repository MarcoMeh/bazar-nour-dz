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
import { Search, DollarSign, ArrowLeft, Inbox } from "lucide-react";

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

  const [sortField, setSortField] = useState<"name_ar" | "price" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const debouncedSetSearchTerm = useRef(debounce((value) => setSearchTerm(value), 500)).current;
  const debouncedSetMinPrice = useRef(debounce((value) => setMinPriceInput(value), 500)).current;
  const debouncedSetMaxPrice = useRef(debounce((value) => setMaxPriceInput(value), 500)).current;

  const supplierId = searchParams.get("supplier");

  useEffect(() => {
    if (supplierId) {
      fetchSupplierCategory(supplierId);
    }
  }, [supplierId]);

  useEffect(() => {
    if (supplierCategory) {
      fetchProducts();
    }
  }, [supplierCategory, searchTerm, minPriceInput, maxPriceInput, sortField, sortOrder]);

  const fetchSupplierCategory = async (id: string) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("المورد غير موجود");
      return;
    }

    setSupplierCategory(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from("products").select("*");

    // filter by supplier_name = subcategory.name_ar
    query = query.eq("supplier_name", supplierCategory?.name_ar || "");

    if (searchTerm) query = query.ilike("name_ar", `%${searchTerm}%`);

    const parsedMin = parseFloat(minPriceInput);
    const parsedMax = parseFloat(maxPriceInput);

    if (!isNaN(parsedMin)) query = query.gte("price", parsedMin);
    if (!isNaN(parsedMax)) query = query.lte("price", parsedMax);

    const { data, error } = (await query.order("created_at", { ascending: false })) as {
      data: Product[] | null;
      error: PostgrestError | null;
    };

    if (error) toast.error("خطأ في تحميل المنتجات");

    setProducts(data || []);
    setLoading(false);
  };

  const sortedProducts = [...products].sort((a, b) => {
    let A: any = a[sortField] ?? "";
    let B: any = b[sortField] ?? "";

    if (sortField === "created_at") {
      A = new Date(A).getTime();
      B = new Date(B).getTime();
    }
    if (sortField === "price") {
      A = Number(A);
      B = Number(B);
    }

    if (sortOrder === "asc") return A > B ? 1 : -1;
    return A < B ? 1 : -1;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">

        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            منتجات {supplierCategory?.name_ar}
          </h1>
          <p className="text-muted-foreground text-lg">
            جميع المنتجات التابعة لهذا المورد
          </p>
        </div>

        {/* FILTER BOX */}
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

          {/* Sorting */}
          <div className="flex gap-4 mt-4 justify-center">
            <select value={sortField} onChange={(e) => setSortField(e.target.value as any)} className="border p-2 rounded-lg">
              <option value="name_ar">الاسم</option>
              <option value="price">السعر</option>
              <option value="created_at">الأحدث</option>
            </select>

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="border p-2 rounded-lg">
              <option value="asc">⬆ تصاعدي</option>
              <option value="desc">⬇ تنازلي</option>
            </select>
          </div>
        </Card>

        {/* PRODUCT LIST */}
        {loading ? (
          <p className="text-center">جاري التحميل...</p>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl shadow border">
            <Inbox size={40} className="mx-auto mb-4 opacity-60" />
            <p className="text-xl mb-2">لا توجد منتجات</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sortedProducts.map((product) => (
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
