import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, Truck, Shield, Tag, Sparkles, Smartphone, Palette, Home } from 'lucide-react';
import logo from '@/assets/bazzarna-logo.jpeg';
import heroBg from '@/assets/hero.jpeg';
import { supabase } from '@/integrations/supabase/client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Import your local slide images
import image_slide_1 from '@/assets/images_slide_1.jpeg';
import image_slide_2 from '@/assets/images_slide_2.jpeg';
import image_slide_3 from '@/assets/images_slide_3.jpeg';


interface Category {
  id: string;
  name_ar: string;
  slug: string;
  image_url?: string | null;
}

const Index = () => {
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [newestProducts, setNewestProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);


  useEffect(() => {
    fetchMainCategories();
    fetchNewestProducts();
  }, []);

  const fetchMainCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('name_ar')
      .limit(4);

    if (!error && data) {
      setMainCategories(data);
    }
  };
  const fetchNewestProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name_ar,
        price,
        image_url,
        categories!inner(
          name_ar,
          parent:parent_id(name_ar)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setNewestProducts(
        data.map((item) => ({
          ...item,
          category_name: item.categories?.name_ar || 'غير مصنف',
          sub_category_name: item.categories?.parent?.name_ar || null,
        }))
      );
    }
    setLoadingProducts(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-bl from-primary via-primary/95 to-primary/80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]" />
          </div>
          
          <div className="relative container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              {/* Logo with Animation */}
              <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <img 
                  src={logo} 
                  alt="Bazzarna" 
                  className="h-32 md:h-40 w-auto mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-primary-foreground animate-in fade-in slide-in-from-top-6 duration-700 delay-150">
                بازارنا... كل ما تحتاجه في مكان واحد
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl md:text-2xl mb-10 text-primary-foreground/95 animate-in fade-in slide-in-from-top-8 duration-700 delay-300">
                متجرك الإلكتروني الموثوق في الجزائر
              </p>
              
              {/* CTA Button with 3D Effect */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                <Link to="/products">
                  <Button 
                    size="lg" 
                    className="button-3d bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-accent/50 transition-all duration-300 group"
                  >
                    تسوق الآن
                    <ArrowLeft className="mr-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Modern Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0 text-background">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 105C120 90 240 60 360 48C480 36 600 42 720 54C840 66 960 84 1080 84C1200 84 1320 66 1380 57L1440 48V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" />
            </svg>
          </div>
        </section>
        {/* cursor slider*/}
       <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
                  <div className="relative h-[300px] md:h-[420px] rounded-2xl overflow-hidden shadow-lg group">
                    <img
                      src={image_slide_1} // Using local image
                      alt="Special Offer Sale"
                      className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/70 via-accent/60 to-accent/50 group-hover:bg-accent/80 transition-all duration-500" />
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                       <span className="text-sm md:text-lg font-semibold text-white/90 mb-2 uppercase tracking-wide group-hover:text-white transition-colors duration-300">
                        وصل حديثاً
                      </span>
                      <h3 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-md group-hover:scale-105 transition-transform duration-300">
                        منتجات جديدة كل أسبوع
                      </h3>
                      <p className="text-base md:text-xl text-white/95 mb-6 max-w-md drop-shadow group-hover:text-white transition-colors duration-300">
                        كن أول من يكتشف أحدث صيحات الموضة والإلكترونيات العصرية.
                      </p>
                      <Link to="/products">
                        <Button className="bg-white text-primary text-lg font-bold hover:bg-white/90 px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform group-hover:scale-110">
                          اكتشف المزيد
                          <ArrowLeft className="mr-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
          </div>
        </section>
        <section className="py-20 relative">
        <div className="container mx-auto px-4">

          {/* Mobile: horizontal row | Desktop: grid */}
          <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-8 no-scrollbar px-1">
          {/* Features Section */}
              {/* Feature 1 */}
              <div className="min-w-[260px] md:min-w-0 group relative p-8 rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 hover:border-accent/50 shadow-lg hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <ShoppingBag className="h-10 w-10 text-accent" />
                  </div>
                  <h3 className="font-bold text-2xl mb-3 text-foreground">منتجات متنوعة</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    ملابس، إلكترونيات، ديكور ومواد تجميل
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="min-w-[260px] md:min-w-0 group relative p-8 rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 hover:border-secondary/50 shadow-lg hover:shadow-2xl hover:shadow-secondary/10 hover:-translate-y-2 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Truck className="h-10 w-10 text-secondary" />
                  </div>
                  <h3 className="font-bold text-2xl mb-3 text-foreground">توصيل سريع</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    توصيل لجميع ولايات الوطن
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="min-w-[260px] md:min-w-0 group relative p-8 rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 hover:border-primary/50 shadow-lg hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Shield className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-bold text-2xl mb-3 text-foreground">الدفع عند الاستلام</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    ادفع عند استلام طلبك بكل أمان
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>
        {/* Categories Section */}
        <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(var(--primary),0.03),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(var(--accent),0.03),transparent_40%)]" />
          
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                تصفح حسب الفئة
              </h2>
              <p className="text-muted-foreground text-lg">اختر الفئة التي تناسبك</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {mainCategories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Image Background */}
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name_ar}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/60 to-transparent group-hover:from-primary/95 group-hover:via-primary/70 transition-all duration-500" />
                  
                  {/* Category Name */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-background group-hover:text-primary-foreground text-center group-hover:scale-110 transition-all duration-500 drop-shadow-lg">
                      {category.name_ar}
                    </h3>
                  </div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        {/* Newest Products Section */}
        <section className="py-20 bg-background relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                أحدث المنتجات
              </h2>
              <p className="text-muted-foreground text-lg">اكتشف أحدث الإضافات في متجرنا</p>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : newestProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">لا توجد منتجات جديدة حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {newestProducts.map((product) => (
                 <Link to={`/product/${product.id}`}>
                  <div
                    key={product.id}
                    className="group rounded-xl overflow-hidden bg-card border border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  >

                    <div className="relative">
                      <img
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name_ar}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-lg">
                        جديد
                      </div>
                    </div>

                    <div className="p-4 space-y-2 text-right">
                      <h3 className="text-lg font-bold text-foreground line-clamp-2">{product.name_ar}</h3>
                      <p className="text-muted-foreground text-sm">
                        {product.category_name} › {product.sub_category_name || '—'}
                      </p>
                      <p className="text-primary font-semibold">{product.price} دج</p>
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>


        
      </main>

      <Footer />
    </div>
  );
};

export default Index;