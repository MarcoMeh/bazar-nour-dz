import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ShoppingBag, Truck, Shield } from "lucide-react";

// Assets
import logo from "@/assets/bazzarna_logo_2.png";
import heroBg from "@/assets/backround_5.jpeg"; // Using HEAD's preferred background

interface Category {
    id: string;
    name_ar: string;
    slug: string;
    image_url?: string | null;
    parent_id?: string | null;
}

interface Product {
    id: string;
    name_ar: string;
    price: number;
    image_url?: string | null;
    category_name?: string;
    sub_category_name?: string | null;
}

const Home = () => {
    const [mainCategories, setMainCategories] = useState<Category[]>([]);
    const [newestProducts, setNewestProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Our Stores
    const [ourStoresCategory, setOurStoresCategory] = useState<Category | null>(null);
    const [ourStoresSub, setOurStoresSub] = useState<Category[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchMainCategories(),
                fetchOurStores(),
                fetchNewestProducts(),
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchMainCategories = async () => {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .is("parent_id", null)
            .neq("slug", "ourstores")
            .order("name_ar");

        if (!error && data) setMainCategories(data);
    };

    const fetchOurStores = async () => {
        const { data: mainCat } = await supabase
            .from("categories")
            .select("*")
            .eq("slug", "ourstores")
            .single();

        if (mainCat) {
            setOurStoresCategory(mainCat);
            const { data: subCats } = await supabase
                .from("categories")
                .select("*")
                .eq("parent_id", mainCat.id);
            if (subCats) setOurStoresSub(subCats);
        }
    };

    const fetchNewestProducts = async () => {
        const { data, error } = await supabase
            .from("products")
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
            .order("created_at", { ascending: false })
            .limit(20);

        if (!error && data) {
            setNewestProducts(
                data.map((item: any) => ({
                    ...item,
                    category_name: item.categories?.name_ar || "غير مصنف",
                    sub_category_name: item.categories?.parent?.name_ar || null,
                }))
            );
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-gray-900">
            <Header />

            <main className="flex-1">
                {/* Hero Section - HEAD Style */}
                <section
                    className="relative overflow-hidden"
                    style={{
                        backgroundImage: `url('${heroBg}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="absolute inset-0 bg-black/25"></div>
                    <div className="container mx-auto px-4 py-32 text-center relative z-10">
                        <img
                            src={logo}
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

                    {/* Abstract shapes from HEAD */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-yellow-300/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
                        <div className="absolute bottom-[-120px] right-[-80px] w-80 h-80 bg-yellow-400/20 rounded-full filter blur-2xl animate-pulse-slow"></div>
                    </div>
                </section>

                {/* Features Section - Incoming Content (Preserved) */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-2xl bg-green-50 border border-green-100 text-center hover:shadow-lg transition-all">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 text-green-600">
                                    <ShoppingBag className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-green-800">منتجات متنوعة</h3>
                                <p className="text-gray-600">ملابس، إلكترونيات، ديكور ومواد تجميل</p>
                            </div>

                            <div className="p-8 rounded-2xl bg-blue-50 border border-blue-100 text-center hover:shadow-lg transition-all">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 text-blue-600">
                                    <Truck className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-blue-800">توصيل سريع</h3>
                                <p className="text-gray-600">توصيل لجميع ولايات الوطن</p>
                            </div>

                            <div className="p-8 rounded-2xl bg-yellow-50 border border-yellow-100 text-center hover:shadow-lg transition-all">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4 text-yellow-600">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-yellow-800">الدفع عند الاستلام</h3>
                                <p className="text-gray-600">ادفع عند استلام طلبك بكل أمان</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Stores Section - Incoming Logic */}
                {ourStoresCategory && (
                    <section className="py-20 bg-gray-50">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800">
                                {ourStoresCategory.name_ar}
                            </h2>
                            <p className="text-gray-500 text-lg mb-12">كل محلاتنا في مكان واحد</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {ourStoresSub.map((sub) => (
                                    <Link
                                        key={sub.id}
                                        to={`/productstores?supplier=${sub.id}`}
                                        className="group relative aspect-square rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                                    >
                                        <img
                                            src={sub.image_url || ""}
                                            alt={sub.name_ar}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all"></div>
                                        <h3 className="absolute inset-0 flex items-center justify-center text-white text-xl md:text-2xl font-bold z-10">
                                            {sub.name_ar}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Main Categories Section - HEAD Style applied to Incoming Logic */}
                <section className="py-20 bg-[#FFFDF9]">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                            تصفح حسب الفئة
                        </h2>
                        {loading ? (
                            <p className="text-center">جاري التحميل...</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {mainCategories.map((category) => (
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
                                        {/* Overlay for text if image exists */}
                                        {category.image_url && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-4">
                                                <span className="text-white font-bold text-xl">{category.name_ar}</span>
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Newest Products Section - Incoming Logic */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
                            أحدث المنتجات
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {newestProducts.map((product) => (
                                <Link to={`/product/${product.id}`} key={product.id} className="group">
                                    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={product.image_url || ""}
                                                alt={product.name_ar}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-5 text-right">
                                            <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-green-700 transition-colors">
                                                {product.name_ar}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-3">
                                                {product.category_name}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-green-700">
                                                    {product.price} دج
                                                </span>
                                                <Button size="sm" variant="outline" className="rounded-full">
                                                    عرض
                                                </Button>
                                            </div>
                                        </div>
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

export default Home;
