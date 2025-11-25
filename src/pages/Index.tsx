<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
=======
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, Truck, Shield } from 'lucide-react';
import logo from '@/assets/bazzarna-logo.jpeg';
import heroBg from '@/assets/hero.jpeg';
import { supabase } from '@/integrations/supabase/client';

import image_slide_1 from '@/assets/images_slide_1.jpeg';
import image_slide_2 from '@/assets/images_slide_2.jpeg';
import image_slide_3 from '@/assets/images_slide_3.jpeg';
>>>>>>> 5c2b0f6ece8db8775ec6c1819f8ec4f67928f520

interface Category {
  id: string;
  name_ar: string;
  slug: string;
  image_url?: string | null;
  parent_id?: string | null;
}

interface Product {
  id: string;
  category_id: string;
  name_ar: string;
  price: number;
  image_url?: string | null;
}

const Index = () => {
<<<<<<< HEAD
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name_ar")
      .limit(4);
    if (data) setCategories(data);
    if (error) console.error(error);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);
    if (data) setProducts(data);
    if (error) console.error(error);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchProducts()]);
      setLoading(false);
    };
    loadData();
  }, []);
=======
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [newestProducts, setNewestProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // محلاتنا
  const [ourStoresCategory, setOurStoresCategory] = useState<Category | null>(null);
  const [ourStoresSub, setOurStoresSub] = useState<Category[]>([]);

  useEffect(() => {
    fetchMainCategories();
    fetchOurStores();
    fetchNewestProducts();
  }, []);

  // Main categories except محلاتنا
  const fetchMainCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .neq('slug', 'ourstores')      // REMOVE محلاتنا
      .order('name_ar');

    if (!error && data) {
      setMainCategories(data);
    }
  };

  // محلاتنا fetch
  const fetchOurStores = async () => {
    const { data: mainCat } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', 'ourstores')
      .single();

    if (mainCat) {
      setOurStoresCategory(mainCat);

      const { data: subCats } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', mainCat.id);

      if (subCats) setOurStoresSub(subCats);
    }
  };

  // Newest products
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
>>>>>>> 5c2b0f6ece8db8775ec6c1819f8ec4f67928f520

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-gray-900">
      <Header />

      <main className="flex-1">
<<<<<<< HEAD
        {/* Hero Section */}
        <section
          className="relative overflow-hidden"
          style={{
            backgroundImage: "url('/src/assets/backround_5.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/25"></div> {/* Dark overlay for contrast */}
          <div className="container mx-auto px-4 py-32 text-center relative z-10">
            <img
              src="/src/assets/bazzarna_logo_2.png"
              alt="Bazzarna"
              className="mx-auto h-32 md:h-40 w-auto mb-6 relative z-10 animate-fadeIn"
            />
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight text-white animate-fadeIn delay-200">
              بازارنا... كل ما تحتاجه في مكان واحد
            </h1>
            <p className="text-lg md:text-2xl mb-10 opacity-90 text-white animate-fadeIn delay-400">
              متجرك الإلكتروني الموثوق في الجزائر
            </p>
            <Link to="/products">
              <Button className="bg-[#FFD700] text-white font-bold px-10 py-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn delay-600">
                تسوق الآن
              </Button>
            </Link>
          </div>

          {/* Optional abstract shapes */}
          <div className="absolute inset-0">
            <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-yellow-300/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-[-120px] right-[-80px] w-80 h-80 bg-yellow-400/20 rounded-full filter blur-2xl animate-pulse-slow"></div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-[#FFFDF9]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              تصفح حسب الفئة
            </h2>
            {loading ? (
              <p className="text-center">جاري التحميل...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform duration-500 hover:-translate-y-2"
                  >
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name_ar}
                        className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-48 md:h-56 bg-white flex items-center justify-center text-black font-semibold text-xl border-b-4 border-green-400">
                        {category.name_ar}
                      </div>


                    )}
                  </Link>
                ))}
              </div>
            )}
=======

        {/* HERO SECTION */}
        <section
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-primary via-primary/95 to-primary/80" />
          <div className="relative container mx-auto px-4 py-20 md:py-32 text-center">
            <img src={logo} className="h-32 md:h-40 mx-auto mb-8" />
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              بازارنا... كل ما تحتاجه في مكان واحد
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/95 mb-10">
              متجرك الإلكتروني الموثوق في الجزائر
            </p>

            <Link to="/products">
              <Button size="lg" className="bg-accent text-accent-foreground font-bold px-10 py-7 rounded-xl">
                تسوق الآن
                <ArrowLeft className="mr-2" />
              </Button>
            </Link>
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

        {/* =====================================
              محلاتنا — BEFORE Categories
        ===================================== */}
        {ourStoresCategory && (
          <section className="py-20 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-4 text-center">

              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
                {ourStoresCategory.name_ar}
              </h2>
              <p className="text-muted-foreground text-lg mb-12">كل محلاتنا في مكان واحد</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {ourStoresSub.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/productstores?supplier=${sub.id}`}
                    className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg"
                  >
                    <img
                      src={sub.image_url || ''}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-primary/60 transition-all"></div>
                    <h3 className="absolute inset-0 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                      {sub.name_ar}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================
              MAIN CATEGORIES (EXCLUDING محلاتنا)
        ===================================== */}
        <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 text-center">

            <h2 className="text-4xl md:text-5xl font-bold mb-4">تصفح حسب الفئة</h2>
            <p className="text-muted-foreground text-lg mb-12">اختر الفئة التي تناسبك</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {mainCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg"
                >
                  <img
                    src={category.image_url || ''}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-primary/60 transition-colors"></div>
                  <h3 className="absolute inset-0 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                    {category.name_ar}
                  </h3>
                </Link>
              ))}
            </div>
>>>>>>> 5c2b0f6ece8db8775ec6c1819f8ec4f67928f520
          </div>
        </section>

        {/* NEWEST PRODUCTS — unchanged */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
              أحدث المنتجات
            </h2>

            {!loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {newestProducts.map((product) => (
                  <Link to={`/product/${product.id}`} key={product.id}>
                    <div className="rounded-xl bg-card border hover:shadow-xl">
                      <img
                        src={product.image_url}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-4 text-right">
                        <h3 className="font-bold mb-1">{product.name_ar}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.category_name} › {product.sub_category_name || "—"}
                        </p>
                        <p className="text-primary font-semibold">{product.price} دج</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
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
