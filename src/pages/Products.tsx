import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  category_id?: string;
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    
    // Check if category param exists in URL
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedMainCategory(categoryParam);
    } else {
      fetchProducts();
    }
  }, [searchParams]);

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

    if (selectedSubCategory) {
      query = query.eq('category_id', selectedSubCategory);
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
  }, [selectedSubCategory]);

  const getMainCategories = () => categories.filter(cat => !cat.parent_id);
  const getSubCategories = (parentId: string) => categories.filter(cat => cat.parent_id === parentId);

  const handleMainCategoryClick = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory(null);
    setProducts([]);
  };

  const handleBackToMain = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setProducts([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">منتجاتنا</h1>

        {/* Main Categories */}
        {!selectedMainCategory && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">اختر التصنيف</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {getMainCategories().map((cat) => (
                <Card
                  key={cat.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border-muted hover:border-accent/40 hover:scale-[1.02] group"
                  onClick={() => handleMainCategoryClick(cat.id)}
                >
                  {cat.image_url && (
                    <div className="h-32 w-full overflow-hidden shrink-0">
                      <img 
                        src={cat.image_url} 
                        alt={cat.name_ar}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className={`p-4 ${!cat.image_url ? 'h-24' : 'min-h-[4rem]'} flex items-center justify-center`}>
                    <h3 className="font-semibold text-lg text-center">{cat.name_ar}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories */}
        {selectedMainCategory && !selectedSubCategory && (
          <div className="mb-8">
            <Button variant="ghost" onClick={handleBackToMain} className="mb-4">
              ← العودة للتصنيفات الرئيسية
            </Button>
            <h2 className="text-xl font-semibold mb-4">اختر التصنيف الفرعي</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {getSubCategories(selectedMainCategory).map((cat) => (
                <Card
                  key={cat.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border-muted hover:border-accent/40 hover:scale-[1.02] group"
                  onClick={() => setSelectedSubCategory(cat.id)}
                >
                  {cat.image_url && (
                    <div className="h-32 w-full overflow-hidden shrink-0">
                      <img 
                        src={cat.image_url} 
                        alt={cat.name_ar}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className={`p-4 ${!cat.image_url ? 'h-24' : 'min-h-[4rem]'} flex items-center justify-center`}>
                    <h3 className="font-semibold text-lg text-center">{cat.name_ar}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {selectedSubCategory && (
          <>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedSubCategory(null)} 
              className="mb-4"
            >
              ← العودة للتصنيفات الفرعية
            </Button>
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
                <p className="text-xl text-muted-foreground">لا توجد منتجات في هذا التصنيف</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
