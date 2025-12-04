import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, ShoppingBag, Truck, Shield, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

// Assets
import logo from "@/assets/bazzarna_logo_2.png";
import heroBg from "@/assets/backround_5.jpeg"; // Using HEAD's preferred background

interface Category {
    id: string;
    name?: string;
    name_ar?: string;
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
    colors?: string[];
    sizes?: string[];
    is_delivery_home_available?: boolean;
    is_delivery_desktop_available?: boolean;
    is_sold_out?: boolean;
    is_free_delivery?: boolean;
    store_id?: string;
}

interface Store {
    id: string;
    name: string;
    image_url?: string | null;
    description?: string | null;
}

const Home = () => {
    const [mainCategories, setMainCategories] = useState<Category[]>([]);
    const [newestProducts, setNewestProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        hero_visible: true,
        features_visible: true,
        products_visible: true,
        stores_visible: true,
        categories_visible: true,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchSettings(),
                fetchMainCategories(),
                fetchStores(),
                fetchNewestProducts(),
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from("site_settings" as any)
            .select("*")
            .single();

        if (!error && data) {
            setSettings(data as any);
        }
    };

    const fetchMainCategories = async () => {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name");

        if (!error && data) setMainCategories(data);
    };

    const fetchStores = async () => {
        const { data, error } = await supabase
            .from("stores")
            .select("id, name, image_url, description")
            .order("name");

        if (!error && data) setStores(data);
    };

    const fetchNewestProducts = async () => {
        const { data, error } = await supabase
            .from("products")
            .select(`
        id,
        name_ar,
        price,
        image_url,
        colors,
        sizes,
        is_delivery_home_available,
        is_delivery_desktop_available,
        is_sold_out,
        is_free_delivery,
        store_id,
        categories!inner(
          name,
          parent:parent_id(name)
        )
      `)
            .order("created_at", { ascending: false })
            .limit(20);

        if (!error && data) {
            setNewestProducts(
                data.map((item: any) => ({
                    ...item,
                    category_name: item.categories?.name || "غير مصنف",
                    sub_category_name: item.categories?.parent?.name || null,
                }))
            );
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-gray-900">


            <main className="flex-1">
                {/* Hero Section - HEAD Style */}
                {settings.hero_visible && (
                    <section
                        className="relative overflow-hidden"
                        style={{
                            backgroundImage: `url('${heroBg}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <div className="absolute inset-0 bg-black/25"></div>
                        <div className="container mx-auto px-4 py-16 md:py-32 text-center relative z-10">
                            <img
                                src={logo}
                                alt="Bazzarna"
                                className="mx-auto h-24 md:h-40 w-auto mb-6 relative z-10 animate-fadeIn"
                            />
                            <h1 className="text-3xl md:text-6xl font-extrabold mb-4 leading-tight text-white animate-fadeIn delay-200">
                                بازارنا... كل ما تحتاجه في مكان واحد
                            </h1>
                            <p className="text-lg md:text-2xl mb-10 opacity-90 text-white animate-fadeIn delay-400">
                                متجرك الإلكتروني الموثوق في الجزائر
                            </p>

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 animate-fadeIn delay-500">
                                <div className="relative flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="ابحث عن منتج..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-14 pl-12 text-lg bg-white/90 backdrop-blur-sm border-2 border-white/20 focus:border-yellow-400"
                                    />
                                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="h-14 px-8 bg-[#FFD700] text-white hover:bg-yellow-500"
                                    >
                                        <Search className="mr-2 h-5 w-5" />
                                        بحث
                                    </Button>
                                </div>
                            </form>

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
                )}

                {/* Features Section - Incoming Content (Preserved) */}
                {settings.features_visible && (
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
                )}

                {/* Best Product Section (Old Hero Style) */}
                {settings.products_visible && (
                    <section className="py-24 bg-gradient-to-r from-primary/5 to-secondary/5 relative overflow-hidden">
                        <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                            {/* Text Content */}
                            <div className="text-right space-y-8 order-2 lg:order-1">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20 backdrop-blur-sm">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                                    </span>
                                    <span className="font-medium text-sm">منتج مميز</span>
                                </div>

                                <h2 className="text-4xl lg:text-6xl font-black text-primary leading-tight tracking-tight">
                                    أفضل المنتجات <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-primary">الأكثر مبيعاً</span>
                                </h2>

                                <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                                    اكتشف مجموعتنا المختارة من المنتجات عالية الجودة التي نالت إعجاب عملائنا. جودة مضمونة وسعر منافس.
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                                        <Link to="/products">
                                            تسوق الآن <ArrowRight className="mr-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                </div>

                                <div className="flex items-center gap-8 pt-8">
                                    <div>
                                        <h4 className="text-3xl font-bold text-primary">+1000</h4>
                                        <p className="text-sm text-muted-foreground">عميل سعيد</p>
                                    </div>
                                    <div className="w-px h-12 bg-border"></div>
                                    <div>
                                        <h4 className="text-3xl font-bold text-primary">4.9</h4>
                                        <p className="text-sm text-muted-foreground">تقييم عام</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Image */}
                            <div className="relative animate-float order-1 lg:order-2 mb-12 lg:mb-0">
                                <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500">
                                    <img
                                        src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop"
                                        alt="Best Product"
                                        className="rounded-2xl w-full object-cover h-[500px]"
                                    />

                                    {/* Floating Card 1 */}
                                    <div className="absolute -left-12 top-1/4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce delay-1000">
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <Truck className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">توصيل سريع</p>
                                            <p className="text-xs text-muted-foreground">لجميع الولايات</p>
                                        </div>
                                    </div>

                                    {/* Floating Card 2 */}
                                    <div className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce delay-700">
                                        <div className="bg-yellow-100 p-3 rounded-full">
                                            <Shield className="h-6 w-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">جودة عالية</p>
                                            <p className="text-xs text-muted-foreground">ضمان الرضا</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Our Stores Section */}
                {settings.stores_visible && stores.length > 0 && (
                    <section className="py-20 bg-gray-50">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800">
                                محلاتنا
                            </h2>
                            <p className="text-gray-500 text-lg mb-12">تسوق من محلاتنا المميزة</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {stores.map((store) => (
                                    <Link
                                        key={store.id}
                                        to={`/products?store=${store.id}`}
                                        className="group relative aspect-square rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                                    >
                                        {store.image_url ? (
                                            <img
                                                src={store.image_url}
                                                alt={store.name}
                                                loading="lazy"
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                <span className="text-6xl font-bold text-primary/30">{store.name.charAt(0)}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all"></div>
                                        <h3 className="absolute inset-0 flex items-center justify-center text-white text-xl md:text-2xl font-bold z-10 px-4">
                                            {store.name}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Main Categories Section - HEAD Style applied to Incoming Logic */}
                {settings.categories_visible && (
                    <section className="py-20 bg-[#FFFDF9]">
                        <div className="container mx-auto px-4">
                            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                                تصفح حسب الفئة
                            </h2>
                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="rounded-3xl overflow-hidden h-48 md:h-56">
                                            <Skeleton className="w-full h-full" />
                                        </div>
                                    ))}
                                </div>
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
                                                    alt={category.name_ar || category.name || ""}
                                                    loading="lazy"
                                                    className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-48 md:h-56 bg-white flex items-center justify-center text-black font-semibold text-xl border-b-4 border-green-400">
                                                    {category.name_ar || category.name}
                                                </div>
                                            )}
                                            {/* Overlay for text if image exists */}
                                            {category.image_url && (
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-4">
                                                    <span className="text-white font-bold text-xl">{category.name_ar || category.name}</span>
                                                </div>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Newest Products Section - Incoming Logic */}
                {settings.products_visible && (
                    <section className="py-20 bg-white">
                        <div className="container mx-auto px-4">
                            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
                                أحدث المنتجات
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {loading ? (
                                    [1, 2, 3, 4].map((i) => (
                                        <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                                            <Skeleton className="h-64 w-full" />
                                            <div className="p-5 space-y-3">
                                                <Skeleton className="h-6 w-3/4 ml-auto" />
                                                <Skeleton className="h-4 w-1/2 ml-auto" />
                                                <div className="flex justify-between items-center">
                                                    <Skeleton className="h-6 w-20" />
                                                    <Skeleton className="h-8 w-16 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    newestProducts.map((product) => (
                                        <Link to={`/product/${product.id}`} key={product.id} className="group">
                                            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                                <div className="relative h-64 overflow-hidden">
                                                    <img
                                                        src={product.image_url || ""}
                                                        alt={product.name_ar}
                                                        loading="lazy"
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
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                )}

            </main>

        </div>
    );
};

export default Home;
