import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewModal } from "@/components/QuickViewModal";
import {
    ArrowLeft,
    Search,
    Shield,
    Clock,
    Star,
    Zap,
    TrendingUp,
    Store,
    Truck
} from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import SEO from "@/components/SEO";

// Assets
import heroBg from "@/assets/backround_5.jpeg";

// Types
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
    description_ar?: string;
    price: number;
    image_url?: string | null;
    additional_images?: string[];
    category_name?: string;
    sub_category_name?: string | null;
    colors?: string[];
    sizes?: string[];
    is_delivery_home_available: boolean;
    is_delivery_desktop_available: boolean;
    is_sold_out: boolean;
    is_free_delivery: boolean;
    store_id: string;
}

interface Store {
    id: string;
    name: string;
    image_url?: string | null;
    description?: string | null;
    category_id?: string | null;
}

const Home = () => {
    const navigate = useNavigate();
    const [mainCategories, setMainCategories] = useState<Category[]>([]);
    const [newestProducts, setNewestProducts] = useState<Product[]>([]);
    const [bestSellers, setBestSellers] = useState<Product[]>([]);
    const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        hero_visible: true,
        features_visible: true,
        products_visible: true,
        stores_visible: true,
        categories_visible: true,
        flash_sale_visible: true,
        trending_visible: true,
        newsletter_visible: true,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });

    // Countdown Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return { hours: 12, minutes: 0, seconds: 0 }; // Reset
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const [storeCategories, setStoreCategories] = useState<any[]>([]);
    const [selectedStoreCategory, setSelectedStoreCategory] = useState("all");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchSettings(),
                fetchMainCategories(),
                fetchStoreCategories(),
                fetchStores(),
                fetchProducts(),
                fetchFlashSaleProducts(),
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase.from("site_settings" as any).select("*").single();
        if (data) setSettings(data as any);
    };

    const fetchMainCategories = async () => {
        // Fetch all categories (they are main categories, subcategories are in separate table)
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name")
            .limit(5);

        console.log("Fetched categories:", data, "Error:", error);
        if (data) setMainCategories(data);
    };

    const fetchStoreCategories = async () => {
        const { data } = await supabase.from("store_categories").select("*").order("name");
        if (data) setStoreCategories(data);
    };

    const fetchStores = async () => {
        // Fetch stores with their categories assuming category_id exists
        // If it fails, we will handle it.
        const { data, error } = await supabase.from("stores").select("id, name, image_url, description, category_id");
        if (data) setStores(data);
        if (error) console.error("Error fetching stores:", error);
    };

    const fetchProducts = async () => {
        const { data } = await supabase
            .from("products")
            .select(`
                *,
                categories!inner(name, parent:parent_id(name))
            `)
            .order("created_at", { ascending: false })
            .limit(20);

        if (data) {
            const formattedProducts = data.map((item: any) => ({
                ...item,
                category_name: item.categories?.name || "غير مصنف",
                sub_category_name: item.categories?.parent?.name || null,
                is_delivery_home_available: item.is_delivery_home_available ?? false,
                is_delivery_desktop_available: item.is_delivery_desktop_available ?? false,
                is_sold_out: item.is_sold_out ?? false,
                is_free_delivery: item.is_free_delivery ?? false,
            }));
            setNewestProducts(formattedProducts);
            // Simulate best sellers by shuffling or taking a slice
            setBestSellers([...formattedProducts].sort(() => 0.5 - Math.random()).slice(0, 10));
        }
    };

    const fetchFlashSaleProducts = async () => {
        const { data, error } = await supabase
            .from("flash_sale_items" as any)
            .select(`
                product:products (
                    *,
                    categories!inner(name, parent:parent_id(name))
                )
            `)
            .limit(10);

        if (error) {
            console.error("Error fetching flash sale products:", error);
            return;
        }

        if (data && data.length > 0) {
            const formattedProducts = data
                .filter((item: any) => item.product) // Safety check
                .map((item: any) => {
                    const prod = item.product;
                    return {
                        ...prod,
                        category_name: prod.categories?.name || "غير مصنف",
                        sub_category_name: prod.categories?.parent?.name || null,
                        is_delivery_home_available: prod.is_delivery_home_available ?? false,
                        is_delivery_desktop_available: prod.is_delivery_desktop_available ?? false,
                        is_sold_out: prod.is_sold_out ?? false,
                        is_free_delivery: prod.is_free_delivery ?? false,
                    };
                });
            setFlashSaleProducts(formattedProducts);
        } else {
            setFlashSaleProducts([]);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const plugin = useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-gray-900 font-cairo overflow-x-hidden">
            <SEO
                title="الرئيسية"
                description="بازارنا - وجهتك الأولى للتسوق الإلكتروني في الجزائر. اكتشف أفضل المتاجر والمنتجات بأسعار تنافسية وتوصيل لجميع الولايات."
                image={heroBg}
            />

            {/* 1. HERO SECTION */}
            <section className="relative min-h-[65vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Background with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroBg}
                        alt="Hero Background"
                        className="w-full h-full object-cover scale-105 animate-pulse-slow object-center"
                    />
                    {/* Updated Gradient: More vibrant and trustworthy (Indigo/Slate) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-black/40 md:to-transparent"></div>
                    {/* Optional: Subtle Pattern Overlay for texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-8 md:pt-0">
                    {/* Text Content */}
                    <div className="text-white space-y-6 md:space-y-8 text-right order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 animate-fade-in shadow-lg">
                            <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-full w-full bg-emerald-400"></span>
                            </span>
                            <span className="text-indigo-100 font-bold text-xs md:text-sm tracking-wide">المنصة رقم #1 في الجزائر</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight animate-slide-up tracking-tight">
                            بازارنا.. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-yellow-300 via-amber-200 to-yellow-100 filter drop-shadow-sm">
                                كل ما تحتاجه
                            </span>
                            <br className="md:hidden" /> في مكان واحد
                        </h1>

                        <p className="text-base md:text-xl text-gray-200/90 max-w-xl leading-relaxed animate-slide-up delay-100 font-medium">
                            أضخم تشكيلة من المنتجات الأصلية والمحلات الموثوقة.
                            أسعار تنافسية، وتوصيل سريع <span className="text-yellow-400 font-bold">لـ 58 ولاية</span> مع الدفع عند الاستلام.
                        </p>

                        {/* Search Bar - Enhanced */}
                        <form onSubmit={handleSearch} className="relative max-w-lg animate-slide-up delay-200">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
                                <div className="relative flex bg-white rounded-full p-1.5 md:p-2 shadow-2xl items-center">
                                    <Input
                                        type="text"
                                        placeholder="ابحث عن هاتف، ملابس، ديكور..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 border-none shadow-none focus-visible:ring-0 text-gray-900 text-base md:text-lg h-10 md:h-12 px-4 md:px-6 rounded-full bg-transparent placeholder:text-gray-400"
                                    />
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="rounded-full px-6 md:px-8 bg-indigo-600 hover:bg-indigo-700 text-white h-10 md:h-12 transition-all duration-300 hover:scale-105 shadow-md"
                                    >
                                        <Search className="h-4 w-4 md:h-5 md:w-5" />
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {/* Trust Badges - More Prominent */}
                        <div className="flex flex-wrap gap-3 md:gap-6 pt-2 md:pt-4 animate-slide-up delay-300">
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                                <div className="p-2 bg-yellow-400/20 rounded-full text-yellow-400">
                                    <Truck className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs md:text-sm font-bold text-white">توصيل 58 ولاية</span>
                                    <span className="text-[10px] md:text-xs text-gray-300">سريع ومضمون</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                                <div className="p-2 bg-green-400/20 rounded-full text-green-400">
                                    <Shield className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs md:text-sm font-bold text-white">الدفع عند الاستلام</span>
                                    <span className="text-[10px] md:text-xs text-gray-300">تأكد من سلعتك أولاً</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Empty div for grid balance */}
                    <div className="hidden lg:block"></div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce hidden md:flex flex-col items-center gap-2 text-white/50">
                    <span className="text-xs">اكتشف المزيد</span>
                    <ArrowLeft className="h-5 w-5 -rotate-90" />
                </div>
            </section>

            {/* 2. FEATURED STORES (Moved after Hero) */}
            {settings.stores_visible && (
                <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-16 space-y-4">
                            <Badge variant="outline" className="px-6 py-2 border-primary/20 bg-primary/5 text-primary rounded-full text-sm font-bold tracking-wider mb-4 animate-fade-in">
                                عالم من المتاجر
                            </Badge>
                            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
                                اكتشف <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">متاجرنا المميزة</span>
                            </h2>
                            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                                منصتك الأولى لاكتشاف أفضل العلامات التجارية والمتاجر المحلية. تسوق بكل ثقة من نخبة البائعين في الجزائر.
                            </p>
                        </div>

                        {/* Category Filter Tabs */}
                        <div className="flex flex-wrap justify-center gap-3 mb-16 animate-slide-up delay-100">
                            <button
                                onClick={() => setSelectedStoreCategory("all")}
                                className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 ${selectedStoreCategory === "all"
                                    ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                الكل
                            </button>
                            {storeCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedStoreCategory(cat.id)}
                                    className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 ${selectedStoreCategory === cat.id
                                        ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20"
                                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Stores Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {loading ? (
                                [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="h-64 w-full rounded-[2rem]" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-2/3 mx-auto" />
                                            <Skeleton className="h-3 w-1/2 mx-auto" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                stores
                                    .filter(store => selectedStoreCategory === "all" || store.category_id === selectedStoreCategory)
                                    .slice(0, 8) // Limit displayed stores
                                    .map((store, index) => (
                                        <Link
                                            key={store.id}
                                            to={`/products?store=${store.id}`}
                                            className="group relative flex flex-col items-center"
                                        >
                                            <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:-translate-y-2 border border-gray-100">
                                                {/* Background Image / Cover */}
                                                <div className="absolute inset-0 bg-gray-100">
                                                    {store.image_url ? (
                                                        <img
                                                            src={store.image_url}
                                                            alt={store.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                                                            <Store className="h-20 w-20" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                                                </div>

                                                {/* Store Info Overlay */}
                                                <div className="absolute bottom-0 left-0 right-0 p-8 text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                    {/* Store Logo/Avatar (Floating) */}
                                                    <div className="relative mx-auto w-16 h-16 mb-4">
                                                        <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full animate-pulse-slow"></div>
                                                        <div className="relative w-full h-full rounded-full bg-white border-2 border-white/50 overflow-hidden flex items-center justify-center shadow-lg">
                                                            {store.image_url ? (
                                                                <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xl font-bold text-gray-800">{store.name.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <h3 className="text-2xl font-bold mb-2 tracking-tight group-hover:text-primary-foreground transition-colors">{store.name}</h3>
                                                    <p className="text-sm text-gray-300 line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                        {store.description || "متجر مميز يقدم أفضل المنتجات والخدمات"}
                                                    </p>

                                                    <Button
                                                        size="sm"
                                                        className="w-full rounded-full bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 transition-all duration-300 font-bold group-hover:scale-105"
                                                    >
                                                        زيارة المتجر
                                                    </Button>
                                                </div>

                                                {/* Quick Action Helper */}
                                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                    <ArrowLeft className="h-5 w-5 text-white transform rotate-45" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                            )}
                        </div>

                        {stores.length === 0 && !loading && (
                            <div className="text-center py-20 opacity-50">
                                <Store className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-xl">لا توجد متاجر متاحة حالياً</p>
                            </div>
                        )}

                        <div className="mt-16 text-center">
                            <p className="text-gray-500 mb-6">هل أنت تاجر؟ انضم إلينا اليوم وابدأ رحلتك في التجارة الإلكترونية</p>
                            <Link to="/seller-register">
                                <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 transform hover:-translate-y-1 transition-all">
                                    افتح متجرك مجاناً
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. FLASH SALE SECTION (Moved after Stores) */}
            {settings.flash_sale_visible && (
                <section className="py-16 bg-gradient-to-br from-red-500 to-orange-600 text-white overflow-hidden relative">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm animate-pulse">
                                    <Zap className="h-8 w-8 text-yellow-300" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">عروض فلاش</h2>
                                    <p className="text-red-100 text-lg">تنتهي قريباً، لا تفوت الفرصة!</p>
                                </div>
                            </div>

                            {/* Countdown Timer */}
                            <div className="flex gap-4 text-center">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 min-w-[80px] border border-white/20">
                                    <span className="block text-3xl font-bold font-mono">{timeLeft.hours}</span>
                                    <span className="text-xs opacity-80">ساعة</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 min-w-[80px] border border-white/20">
                                    <span className="block text-3xl font-bold font-mono">{timeLeft.minutes}</span>
                                    <span className="text-xs opacity-80">دقيقة</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 min-w-[80px] border border-white/20">
                                    <span className="block text-3xl font-bold font-mono text-yellow-300">{timeLeft.seconds}</span>
                                    <span className="text-xs opacity-80">ثانية</span>
                                </div>
                            </div>
                        </div>

                        {/* Flash Sale Carousel */}
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            plugins={[plugin.current]}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {loading ? (
                                    [1, 2, 3, 4].map((i) => (
                                        <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/4">
                                            <Skeleton className="h-[400px] w-full rounded-2xl" />
                                        </CarouselItem>
                                    ))
                                ) : (
                                    flashSaleProducts.map((product) => (
                                        <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                                            <ProductCard
                                                product={product}
                                                onQuickView={setQuickViewProduct}
                                            />
                                        </CarouselItem>
                                    ))
                                )}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:flex -left-4 bg-white hover:bg-gray-100 text-gray-900 border-none shadow-xl h-12 w-12" />
                            <CarouselNext className="hidden md:flex -right-4 bg-white hover:bg-gray-100 text-gray-900 border-none shadow-xl h-12 w-12" />
                        </Carousel>
                    </div>
                </section>
            )}

            {/* 4. BEST SELLERS */}
            {settings.products_visible && (
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black mb-2 flex items-center gap-3">
                                    <TrendingUp className="text-primary h-8 w-8 md:h-12 md:w-12" />
                                    الأكثر مبيعاً
                                </h2>
                                <p className="text-gray-500 text-lg">منتجات أحبها الآخرون هذا الأسبوع</p>
                            </div>
                            <Link to="/products?sort=best_selling">
                                <Button variant="outline" className="rounded-full px-6 font-bold hover:bg-gray-100 border-2">
                                    مشاهدة الكل
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {loading
                                ? [1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-[400px] rounded-2xl" />
                                ))
                                : bestSellers.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onQuickView={setQuickViewProduct}
                                    />
                                ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. NEW ARRIVALS */}
            {settings.products_visible && (
                <section className="py-24 bg-[#FAFAFA]">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black mb-4">وصل حديثاً</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                                تصفح أحدث المنتجات المضافة إلى بازارنا. كن أول من يحصل عليها!
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {loading
                                ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                    <Skeleton key={i} className="h-[400px] rounded-2xl" />
                                ))
                                : newestProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onQuickView={setQuickViewProduct}
                                    />
                                ))}
                        </div>

                        <div className="mt-16 text-center">
                            <Link to="/products">
                                <Button size="lg" className="rounded-full px-10 h-14 bg-black text-white hover:bg-gray-800 font-bold hover:scale-105 transition-transform shadow-xl">
                                    تصفح جميع المنتجات
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
};

export default Home;
