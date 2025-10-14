import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Category {
  id: string;
  name_ar: string;
  slug: string;
}

interface Product {
  id: string;
  name_ar: string;
  description_ar?: string;
  price: number;
  image_url?: string;
  category_id?: string;
}

const Products = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name_ar');

    if (error) {
      toast.error('حدث خطأ في تحميل الفئات');
      return;
    }

    setCategories(data || []);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast.error('حدث خطأ في تحميل المنتجات');
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">منتجاتنا</h1>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            الكل
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name_ar}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">لا توجد منتجات حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
