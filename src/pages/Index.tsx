import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, Truck, Shield } from 'lucide-react';
import logo from '@/assets/bazzarna-logo.jpeg';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name_ar: string;
  slug: string;
  image_url?: string | null;
}

const Index = () => {
  const [mainCategories, setMainCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchMainCategories();
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-bl from-primary via-primary/95 to-primary/90 text-primary-foreground py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <img 
                src={logo} 
                alt="Bazzarna" 
                className="h-32 md:h-40 w-auto mx-auto mb-8 drop-shadow-2xl"
              />
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                بازارنا... كل ما تحتاجه في مكان واحد
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-95">
                متجرك الإلكتروني الموثوق في الجزائر
              </p>
              <Link to="/products">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  تسوق الآن
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Decorative bottom wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 80L60 70C120 60 240 40 360 33.3C480 26.7 600 33.3 720 40C840 46.7 960 53.3 1080 50C1200 46.7 1320 33.3 1380 26.7L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="hsl(43 47% 97%)" />
            </svg>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-card border hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4 group-hover:bg-accent/20 transition-colors">
                  <ShoppingBag className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-bold text-xl mb-2">منتجات متنوعة</h3>
                <p className="text-muted-foreground">
                  ملابس، إلكترونيات، ديكور ومواد تجميل
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-card border hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Truck className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-bold text-xl mb-2">توصيل سريع</h3>
                <p className="text-muted-foreground">
                  توصيل لجميع ولايات الوطن
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-card border hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">الدفع عند الاستلام</h3>
                <p className="text-muted-foreground">
                  ادفع عند استلام طلبك بكل أمان
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              تصفح حسب الفئة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mainCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-card to-muted hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-muted hover:border-accent/40"
                >
                  {category.image_url && (
                    <img 
                      src={category.image_url} 
                      alt={category.name_ar}
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/80 to-transparent">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:scale-110 transition-transform">
                      {category.name_ar}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
