import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name_ar: string;
  slug: string;
  image_url?: string | null;
}

interface Product {
  id: string;
  category_id: string;
  name_ar: string;
  price: number;
  image_url?: string | null;
}

const Index = () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-gray-900">
      <Header />

      <main className="flex-1">
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
