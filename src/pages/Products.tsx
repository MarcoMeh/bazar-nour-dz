import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard'; // Assuming this component is well-styled
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { debounce } from 'lodash';
import { Search, Tag, DollarSign, PackageOpen, LayoutGrid,ArrowLeft,Inbox} from 'lucide-react';

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
  is_delivery_home_available: boolean;
  is_delivery_desktop_available: boolean;
  is_sold_out: boolean;
  is_free_delivery: boolean;
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // New state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [minPriceInput, setMinPriceInput] = useState<string>(''); // For text input
  const [maxPriceInput, setMaxPriceInput] = useState<string>(''); // For text input
  const [globalMinMaxPrice, setGlobalMinMaxPrice] = useState<[number, number]>([0, 1000]); // To set bounds for inputs

  // Debounced search term for better performance
  const debouncedSetSearchTerm = useRef(debounce((value) => setSearchTerm(value), 500)).current;
  const debouncedSetMinPrice = useRef(debounce((value) => setMinPriceInput(value), 500)).current;
  const debouncedSetMaxPrice = useRef(debounce((value) => setMaxPriceInput(value), 500)).current;


  useEffect(() => {
    fetchCategories();
    fetchGlobalMinMaxPrices();
    
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedMainCategory(categoryParam);
    } else {
      fetchProducts(searchTerm, minPriceInput, maxPriceInput);
    }

    return () => {
      debouncedSetSearchTerm.cancel();
      debouncedSetMinPrice.cancel();
      debouncedSetMaxPrice.cancel();
    };
  }, [searchParams]);

  useEffect(() => {
    fetchProducts(searchTerm, minPriceInput, maxPriceInput);
  }, [selectedSubCategory, selectedMainCategory, searchTerm, minPriceInput, maxPriceInput]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name_ar');

    if (error) {
      toast.error('حدث خطأ في تحميل الفئات: ' + error.message);
      return;
    }
    setCategories(data || []);
  };

  const fetchGlobalMinMaxPrices = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('price')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching global min/max prices:', error.message);
      return;
    }

    if (data && data.length > 0) {
      const prices = data.map(p => p.price);
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      setGlobalMinMaxPrice([minP, maxP]);
      setMinPriceInput(minP.toString());
      setMaxPriceInput(maxP.toString());
    } else {
      setGlobalMinMaxPrice([0, 1000]);
      setMinPriceInput('0');
      setMaxPriceInput('1000');
    }
  };

  const fetchProducts = async (currentSearchTerm: string, currentMinPriceInput: string, currentMaxPriceInput: string) => {
    setLoading(true);
    let query = supabase.from('products').select('*, is_delivery_home_available, is_delivery_desktop_available, is_sold_out, is_free_delivery');

    if (selectedSubCategory) {
      query = query.eq('category_id', selectedSubCategory);
    } else if (selectedMainCategory) {
      const subCategoryIds = categories
        .filter(cat => cat.parent_id === selectedMainCategory)
        .map(cat => cat.id);
      
      if (subCategoryIds.length > 0) {
        query = query.in('category_id', subCategoryIds);
      } else {
        setProducts([]);
        setLoading(false);
        return;
      }
    }

    if (currentSearchTerm) {
      query = query.ilike('name_ar', `%${currentSearchTerm}%`);
    }

    const parsedMinPrice = parseFloat(currentMinPriceInput);
    const parsedMaxPrice = parseFloat(currentMaxPriceInput);

    if (!isNaN(parsedMinPrice)) {
      query = query.gte('price', parsedMinPrice);
    }
    if (!isNaN(parsedMaxPrice)) {
      query = query.lte('price', parsedMaxPrice);
    }

    const { data, error } = (await query.order('created_at', { ascending: false })) as { data: Product[] | null; error: PostgrestError | null };

    if (error) {
      toast.error('حدث خطأ في تحميل المنتجات: ' + error.message);
      setLoading(false);
      setProducts([]); 
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  const getMainCategories = () => categories.filter(cat => !cat.parent_id);
  const getSubCategories = (parentId: string) => categories.filter(cat => cat.parent_id === parentId);

  const handleMainCategoryClick = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory(null);
    setSearchTerm('');
    // Price inputs don't reset here, they keep their last set value
  };

  const handleBackToMain = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setSearchTerm('');
    // Price inputs don't reset here, they keep their last set value
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchTerm(e.target.value);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetMaxPrice(e.target.value);
  };

  const shouldShowProductGrid = selectedSubCategory || selectedMainCategory || (!selectedMainCategory && !selectedSubCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative overflow-hidden">
        {/* Decorative Background Element 1 */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        {/* Decorative Background Element 2 */}
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        
        {/* Hero Section */}
        <div className="text-center mb-12 py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl shadow-lg relative overflow-hidden">
          <div
            className="absolute inset-0 z-0 opacity-10"
            style={{
              backgroundImage: 'url("@/assets/hero_product_background.jpeg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              منتجاتنا المذهلة
            </h1>
            <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl mx-auto">
              اكتشف أحدث المنتجات وأفضل العروض في جميع الفئات.
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-12 p-8 bg-card rounded-xl shadow-xl border border-border/40 backdrop-blur-sm relative z-10">
          <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3 text-primary-foreground">
            <Search className="text-primary" size={28} /> بحث وفلترة متقدم
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <Label htmlFor="product-search" className="mb-2 block text-muted-foreground">البحث بالاسم</Label>
              <Input
                id="product-search"
                type="text"
                placeholder="ابحث عن منتج..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 bg-background/70"
                onChange={handleSearchInputChange}
                defaultValue={searchTerm}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground mt-3" size={18} />
            </div>
            <div className="relative">
              <Label htmlFor="min-price" className="mb-2 block text-muted-foreground">الحد الأدنى للسعر</Label>
              <Input
                id="min-price"
                type="number"
                placeholder={`الحد الأدنى (${globalMinMaxPrice[0]})`}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 bg-background/70"
                onChange={handleMinPriceChange}
                defaultValue={minPriceInput}
                min={globalMinMaxPrice[0]}
                max={globalMinMaxPrice[1]}
              />
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground mt-3" size={18} />
            </div>
            <div className="relative">
              <Label htmlFor="max-price" className="mb-2 block text-muted-foreground">الحد الأقصى للسعر</Label>
              <Input
                id="max-price"
                type="number"
                placeholder={`الحد الأقصى (${globalMinMaxPrice[1]})`}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 bg-background/70"
                onChange={handleMaxPriceChange}
                defaultValue={maxPriceInput}
                min={globalMinMaxPrice[0]}
                max={globalMinMaxPrice[1]}
              />
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground mt-3" size={18} />
            </div>
          </div>
        </Card>

        {/* Categories Section */}
        {!selectedMainCategory && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3 text-primary-foreground">
              <LayoutGrid className="text-accent" size={30} /> تصفح تصنيفاتنا
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getMainCategories().map((cat) => (
                <Card
                  key={cat.id}
                  className="cursor-pointer group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-500 ease-in-out border border-muted-foreground/20 hover:border-primary-foreground transform hover:scale-[1.03]"
                  onClick={() => handleMainCategoryClick(cat.id)}
                >
                  {cat.image_url && (
                    <div className="h-40 w-full overflow-hidden shrink-0">
                      <img 
                        src={cat.image_url} 
                        alt={cat.name_ar}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                      />
                    </div>
                  )}
                  <div className={`p-4 bg-background/80 group-hover:bg-primary-foreground/90 transition-colors duration-300 ${!cat.image_url ? 'h-28' : 'min-h-[5rem]'} flex items-center justify-center`}>
                    <h3 className="font-bold text-xl text-center group-hover:text-primary transition-colors duration-300">{cat.name_ar}</h3>
                  </div>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <p className="text-lg text-muted-foreground">
                <PackageOpen className="inline-block mr-2 text-accent" size={20} />
                لدينا مجموعة واسعة من المنتجات التي تناسب جميع احتياجاتك.
              </p>
            </div>
          </div>
        )}

        {selectedMainCategory && !selectedSubCategory && (
          <div className="mb-12">
            <Button variant="outline" onClick={handleBackToMain} className="mb-6 group text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 transition-colors duration-300">
              <ArrowLeft className="inline-block ml-2 group-hover:translate-x-[-4px] transition-transform duration-300" size={18} /> العودة للتصنيفات الرئيسية
            </Button>
            <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3 text-primary-foreground">
              <Tag className="text-accent" size={30} /> اختر التصنيف الفرعي
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getSubCategories(selectedMainCategory).length > 0 ? (
                getSubCategories(selectedMainCategory).map((cat) => (
                  <Card
                    key={cat.id}
                    className="cursor-pointer group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-500 ease-in-out border border-muted-foreground/20 hover:border-primary-foreground transform hover:scale-[1.03]"
                    onClick={() => setSelectedSubCategory(cat.id)}
                  >
                    {cat.image_url && (
                      <div className="h-40 w-full overflow-hidden shrink-0">
                        <img 
                          src={cat.image_url} 
                          alt={cat.name_ar}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                        />
                      </div>
                    )}
                    <div className={`p-4 bg-background/80 group-hover:bg-primary-foreground/90 transition-colors duration-300 ${!cat.image_url ? 'h-28' : 'min-h-[5rem]'} flex items-center justify-center`}>
                      <h3 className="font-bold text-xl text-center group-hover:text-primary transition-colors duration-300">{cat.name_ar}</h3>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
                    <PackageOpen size={24} className="text-warning" />
                    لا توجد تصنيفات فرعية لهذه الفئة حالياً.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Grid */}
        {shouldShowProductGrid && (
          <>
            {(selectedSubCategory || selectedMainCategory) && (
              <Button 
                variant="outline" 
                onClick={() => selectedSubCategory ? setSelectedSubCategory(null) : handleBackToMain()} 
                className="mb-6 group text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 transition-colors duration-300"
              >
                <ArrowLeft className="inline-block ml-2 group-hover:translate-x-[-4px] transition-transform duration-300" size={18} />
                العودة {selectedSubCategory ? 'للتصنيفات الفرعية' : 'للتصنيفات الرئيسية'}
              </Button>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 rounded-xl bg-muted animate-pulse shadow-md"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl shadow-lg border border-border/40">
                <Inbox size={48} className="mx-auto mb-6 text-muted-foreground/60" />
                <p className="text-2xl text-muted-foreground font-semibold mb-4">
                  عفواً! لا توجد منتجات مطابقة
                </p>
                <p className="text-md text-gray-500">
                  جرب تغيير كلمات البحث أو نطاق السعر، أو تصفح فئات مختلفة.
                </p>
                <Button onClick={handleBackToMain} className="mt-8 px-8 py-3 text-lg">
                  استكشف جميع المنتجات
                </Button>
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