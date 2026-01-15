import { useState, useEffect, useRef, Suspense } from "react";
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
    Zap,
    TrendingUp,
    Store as StoreIcon,
    Truck,
    Sparkles,
    MousePointer2,
    Shirt,
    ShoppingBag as BagIcon,
    ArrowLeft,
    Search,
    Shield,
    Clock,
    Star,
    Baby,
    Gem,
    Footprints,
    Home as HomeIcon,
    Download
} from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import SEO from "@/components/SEO";
import { useInView } from "react-intersection-observer";
// import Spline from '@splinetool/react-spline'; // REMOVED

// Assets
import { PageBackground } from "@/type_defs";

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
    const [heroBackground, setHeroBackground] = useState<string>("");

    // Animation Hooks for Sections
    const { ref: storesRef, inView: storesInView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const { ref: categoriesRef, inView: categoriesInView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const { ref: flashRef, inView: flashInView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const { ref: trendingRef, inView: trendingInView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const { ref: arrivalsRef, inView: arrivalsInView } = useInView({ triggerOnce: true, threshold: 0.1 });
    const { ref: newsletterRef, inView: newsletterInView } = useInView({ triggerOnce: true, threshold: 0.1 });

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
                fetchHeroBackground(), // Add this
            ]);
            setLoading(false);
        };
        loadData();

        // Realtime Subscription for Settings
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'site_settings',
                },
                (payload) => {
                    console.log("Settings updated:", payload.new);
                    setSettings(payload.new as any);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchHeroBackground = async () => {
        const { data } = await supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from("page_backgrounds" as any)
            .select("image_url")
            .eq("page_key", "home_hero")
            .single();

        if ((data as unknown as PageBackground)?.image_url) {
            setHeroBackground((data as unknown as PageBackground).image_url!);
        }
    };

    const fetchSettings = async () => {
        const { data } = await supabase.from("site_settings" as any).select("*").single();
        if (data) setSettings(prev => ({ ...prev, ...(data as any) }));
    };

    const fetchMainCategories = async () => {
        // Fetch all categories (they are main categories, subcategories are in separate table)
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name")
            .limit(12);

        console.log("Fetched categories:", data, "Error:", error);
        if (data) setMainCategories(data);
    };

    const fetchStoreCategories = async () => {
        const { data } = await supabase.from("categories").select("*").order("name");
        if (data) setStoreCategories(data);
    };

    const fetchStores = async () => {
        // Fetch stores with their categories via the junction table
        const { data, error } = await supabase.from("stores")
            .select(`
                id, 
                name, 
                image_url, 
                description,
                slug,
                store_category_relations (
                    category_id
                )
            `)
            .eq("is_active", true)
            .or(`is_manually_suspended.is.false,is_manually_suspended.is.null`)
            .or(`subscription_end_date.gt.${new Date().toISOString()},subscription_end_date.is.null`)
            .limit(8);

        if (error) {
            console.error("Error fetching stores:", error);
            return;
        }

        if (data) {
            // Map the nested store_category_relations to a flat array of category IDs for filtering
            const formattedStores = data.map((store: any) => ({
                ...store,
                // We map this to allow filtering by checking if the category exists in this array
                category_ids: store.store_category_relations?.map((sc: any) => sc.category_id) || []
            }));
            setStores(formattedStores);
        }
    };

    const fetchProducts = async () => {
        const { data } = await supabase
            .from("products")
            .select(`
                *,
                categories!inner(name, parent:parent_id(name)),
                stores!inner(*)
            `)
            .eq("stores.is_active", true)
            .or(`is_manually_suspended.is.false,is_manually_suspended.is.null`, { foreignTable: 'stores' })
            .or(`subscription_end_date.gt.${new Date().toISOString()},subscription_end_date.is.null`, { foreignTable: 'stores' })
            .order("created_at", { ascending: false })
            .limit(8);

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
        console.log("DEBUG: Starting fetchFlashSaleProducts (JSON RPC)...");
        try {
            const { data, error } = await supabase
                .rpc('get_flash_sale_products_json');

            if (error) {
                console.error("DEBUG: RPC Error:", error);
                return;
            }

            console.log("DEBUG: Flash Sale JSON received:", data);

            if (data && Array.isArray(data)) {
                const formattedProducts = data.map((prod: any) => ({
                    ...prod,
                    category_name: prod.categories?.name || "غير مصنف",
                    sub_category_name: prod.subcategory_data?.name || prod.categories?.parent?.name || null,
                    is_delivery_home_available: prod.is_delivery_home_available ?? false,
                    is_delivery_desktop_available: prod.is_delivery_desktop_available ?? false,
                    is_sold_out: prod.is_sold_out ?? false,
                    is_free_delivery: prod.is_free_delivery ?? false,
                }));
                console.log("DEBUG: Formatted products count:", formattedProducts.length);
                setFlashSaleProducts(formattedProducts);
            } else {
                console.log("DEBUG: Flash Sale Data is empty or not an array.");
                setFlashSaleProducts([]);
            }
        } catch (err) {
            console.error("DEBUG: Unexpected error in fetchFlashSaleProducts:", err);
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
                title="بازارنا - متجر الأزياء الإلكتروني الأول في الجزائر"
                description="اكتشف أحدث صيحات الموضة في بازارنا! ملابس رجالية، نسائية، أطفال، أحذية وإكسسوارات. تسوق من أفضل المحلات مع توصيل سريع لجميع الولايات. مقاسات وألوان متنوعة."
                image={heroBackground || '/og-image.png'}
            />

            <style>
                {`
                @keyframes float-particle {
                    0%, 100% { transform: translate(0, 0); opacity: 0; }
                    50% { transform: translate(100px, -100px); opacity: 0.5; }
                }
                .3d-perspective {
                    perspective: 1000px;
                }
                .3d-card {
                    transform-style: preserve-3d;
                    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .3d-card:hover {
                    transform: translateZ(20px) rotateX(2deg) rotateY(-2deg);
                }
                @keyframes sparkle {
                    0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
                    50% { transform: scale(1) rotate(180deg); opacity: 0.8; }
                }
                .sparkle-particle {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                    filter: blur(1px);
                    box-shadow: 0 0 10px white, 0 0 20px white;
                    pointer-events: none;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .group-hover\:animate-shimmer:hover {
                    animation: shimmer 1.5s infinite;
                }
                `}
            </style>

            {/* 1. HERO SECTION - 3D ENSEMBLE EDITION */}
            {settings.hero_visible && (
                <section className="relative min-h-[65vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">

                    {/* Background Layer (Image + 3D Overlay) */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        {/* 1. Original Image Background */}
                        <img
                            src={heroBackground || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80'}
                            alt="Hero Background"
                            className="absolute inset-0 w-full h-full object-cover object-top md:object-center transform scale-105 animate-subtle-zoom transition-all duration-1000"
                        />

                        {/* 2. Dark Overlays for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/60 to-indigo-950/40"></div>
                        <div className="absolute inset-0 bg-black/40"></div>

                        {/* 3. 3D React Three Fiber Scene - T-Shirt Model */}


                        {/* Pattern Overlay */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay z-20"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-32 pb-12 md:pt-40 md:pb-20 pointer-events-none">
                        {/* Text Content - Enable pointer events for text/buttons */}
                        <div className="text-white space-y-8 md:space-y-10 text-right order-2 lg:order-1 pointer-events-auto">
                            {/* New Repositioned Badge - Floating on the Left */}
                            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-3xl border border-white/30 animate-fade-in shadow-[0_0_30px_rgba(0,0,0,0.1)] mb-10 hover:scale-105 transition-transform cursor-default">
                                <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                                <span className="text-white font-black text-sm tracking-widest uppercase">الأناقة تبدأ من هنا</span>
                            </div>

                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[1.1] animate-slide-up tracking-tighter">
                                <span className="block mb-2 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">عالمك الخاص</span>
                                <span className="text-[#FBBF24] drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                                    للتميز والأناقة
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-100 font-bold max-w-xl leading-relaxed animate-slide-up delay-150">
                                اكتشف تشكيلة حصرية من أرقى الماركات الجزائرية.
                            </p>

                            {/* Trust Badges - Single Line Style */}
                            <div className="flex flex-wrap items-center gap-6 animate-slide-up delay-200">
                                <div className="flex items-center gap-3 text-white font-bold">
                                    <Truck className="h-6 w-6 text-yellow-400" />
                                    <span>دفع لكل الولايات</span>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                <div className="flex items-center gap-3 text-white font-bold">
                                    <Shield className="h-6 w-6 text-yellow-400" />
                                    <span>دفع عند الاستلام</span>
                                </div>
                            </div>

                            {/* Search Bar - New Layout (Button on Left Visually) */}
                            <form onSubmit={handleSearch} className="relative max-w-2xl animate-slide-up delay-300">
                                <div className="relative group">
                                    <div className="relative flex bg-white rounded-full p-2 pl-2 shadow-2xl items-center border border-white/40 overflow-hidden">
                                        <Input
                                            type="text"
                                            placeholder="ماذا تريدين أن ترتدي اليوم؟"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="flex-1 border-none shadow-none focus-visible:ring-0 text-gray-800 text-lg md:text-xl h-10 md:h-14 px-6 bg-transparent placeholder:text-gray-400 font-bold text-right"
                                            dir="rtl"
                                        />
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-[#4154F1] hover:bg-[#3245d1] text-white transition-all shadow-lg p-0 flex-shrink-0"
                                        >
                                            <Search className="h-6 w-6" />
                                        </Button>
                                    </div>
                                </div>
                            </form>

                            {/* Download Button - 3D Premium Edition */}
                            <div className="pt-6 flex animate-slide-up delay-500">
                                <button className="group relative flex items-center gap-4 px-10 py-4 bg-gradient-to-b from-[#3B82F6] via-[#1D4ED8] to-[#1E3A8A] text-white rounded-full font-black text-xl shadow-[0_20px_50px_-10px_rgba(37,99,235,0.6),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.4)] hover:shadow-[0_30px_60px_-10px_rgba(37,99,235,0.8)] transition-all duration-300 hover:-translate-y-2 hover:scale-105 active:scale-95 overflow-hidden border border-white/20">
                                    <Download className="w-7 h-7 filter drop-shadow-md" />
                                    <span className="drop-shadow-md">حمل التطبيق</span>

                                    {/* Glossy Overlay Shine */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer transition-transform duration-1000"></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-10 hidden md:flex flex-col items-center gap-4 text-gray-400 mix-blend-multiply">
                        <span className="text-[10px] font-bold tracking-[0.3em] vertical-text">SCROLL</span>
                        <div className="w-px h-16 bg-gray-300 relative overflow-hidden">
                            <div className="absolute inset-x-0 h-4 bg-gray-800 animate-scroll-line"></div>
                        </div>
                    </div>
                </section>
            )}
            {/* 2. FEATURED STORES */}
            {settings.stores_visible && (
                <section
                    ref={storesRef}
                    className={`
                        py-12 bg-white relative overflow-hidden transition-all duration-1000 transform
                        ${storesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                    `}
                >
                    {/* Decorative Elements - Subtle Gradients */}
                    <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#FAFAFA] to-transparent"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
                    <div className="mt-16 text-center">
                        <Link to="/seller-register">
                            <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 transform hover:-translate-y-1 transition-all">
                                أنشئ متجرك الآن
                            </Button>
                        </Link>
                        <p className="text-gray-500 mb-6">هل أنت تاجر؟ انضم إلينا اليوم وابدأ رحلتك في التجارة الإلكترونية</p>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-8 space-y-4">
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
                        <div className={`flex flex-wrap justify-center gap-3 mb-8 transition-all duration-1000 delay-300 ${storesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 3d-perspective">
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
                                    .filter(store => selectedStoreCategory === "all" || (store as any).category_ids?.includes(selectedStoreCategory))
                                    .slice(0, 8)
                                    .map((store, index) => (
                                        <div
                                            key={store.id}
                                            className="group relative flex flex-col items-center 3d-card"
                                        >
                                            <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:-translate-y-2 border border-gray-100">

                                                {/* ✅ 1. Background Link - Makes the whole card clickable */}
                                                <Link
                                                    to={`/store/${(store as any).slug || store.id}`}
                                                    className="absolute inset-0 z-0"
                                                >
                                                    {/* Background Image */}
                                                    <div className="absolute inset-0 bg-gray-100">
                                                        {store.image_url ? (
                                                            <img
                                                                src={store.image_url}
                                                                alt={store.name}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                                                                <StoreIcon className="h-20 w-20" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                                                    </div>
                                                </Link>

                                                {/* ✅ 2. Store Info Overlay - Visible on mobile default, hover on desktop */}
                                                <div className="absolute bottom-0 left-0 right-0 p-8 text-center text-white transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 z-10 pointer-events-none">

                                                    {/* Store Logo/Avatar */}
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

                                                    <h3 className="text-2xl font-bold mb-2 tracking-tight md:group-hover:text-primary-foreground transition-colors">
                                                        {store.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-300 line-clamp-2 mb-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                        {store.description || "متجر مميز يقدم أفضل المنتجات والخدمات"}
                                                    </p>

                                                    {/* ✅ 3. Button - Re-enable pointer events so hover effects work */}
                                                    <div className="pointer-events-auto opacity-100 md:opacity-100">
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            className="w-full rounded-full bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 transition-all duration-300 font-bold group-hover:scale-105"
                                                        >
                                                            <Link to={`/store/${(store as any).slug || store.id}`}>
                                                                زيارة المتجر
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Quick Action Helper */}
                                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 transform translate-x-0 md:translate-x-4 md:group-hover:translate-x-0 z-10 pointer-events-none">
                                                    <ArrowLeft className="h-5 w-5 text-white transform rotate-45" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>

                        {stores.length === 0 && !loading && (
                            <div className="text-center py-20 opacity-50">
                                <StoreIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-xl">لا توجد متاجر متاحة حالياً</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 2.5 CATEGORIES SECTION - DREAMY EDITION */}
            {settings.categories_visible && (
                <section
                    ref={categoriesRef}
                    className={`
                        py-12 bg-white relative overflow-hidden transition-all duration-1000 delay-200 transform
                        ${categoriesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                    `}
                >
                    {/* Dreamy Background Effect */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[120px] -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] translate-y-1/2"></div>

                        {/* Sparkles */}
                        {[...Array(15)].map((_, i) => (
                            <div
                                key={i}
                                className="sparkle-particle"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    width: `${Math.random() * 4 + 2}px`,
                                    height: `${Math.random() * 4 + 2}px`,
                                    animation: `sparkle ${Math.random() * 3 + 2}s infinite ${Math.random() * 5}s`,
                                }}
                            />
                        ))}
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-gray-900">تصفح حسب الفئة</h2>
                            <p className="text-gray-500 text-lg font-medium">كل ما تبحث عنه في أقسامنا المتنوعة</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="flex flex-col items-center gap-4">
                                        <Skeleton className="h-32 w-32 rounded-full" />
                                        <Skeleton className="h-12 w-40 rounded-2xl" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-16">
                                {mainCategories.map((cat) => {
                                    // Helper function for mapping icons
                                    const getCatStyle = (name: string) => {
                                        const n = name || "";
                                        if (n.includes('نسائية')) return { icon: <Sparkles className="w-6 h-6 text-pink-500" />, borderColor: 'border-pink-200' };
                                        if (n.includes('رجالية')) return { icon: <Shirt className="w-6 h-6 text-blue-500" />, borderColor: 'border-blue-200' };
                                        if (n.includes('داخلية')) return { icon: <HomeIcon className="w-6 h-6 text-teal-500" />, borderColor: 'border-teal-200' };
                                        if (n.includes('أطفال')) return { icon: <Baby className="w-6 h-6 text-yellow-500" />, borderColor: 'border-yellow-200' };
                                        if (n.includes('إكسسوارات')) return { icon: <Gem className="w-6 h-6 text-amber-500" />, borderColor: 'border-amber-200' };
                                        if (n.includes('أحذية')) return { icon: <Footprints className="w-6 h-6 text-indigo-500" />, borderColor: 'border-indigo-200' };
                                        return { icon: <BagIcon className="w-6 h-6 text-gray-400" />, borderColor: 'border-gray-200' };
                                    };

                                    const style = getCatStyle(cat.name || "");

                                    return (
                                        <Link
                                            key={cat.id}
                                            to={`/products?categoryId=${cat.id}`}
                                            className="group relative flex flex-col items-center transition-all duration-500 hover:-translate-y-2"
                                        >
                                            {/* Circular Image with Gradient Border & Glow */}
                                            <div className={`
                                                relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] ${style.borderColor} 
                                                shadow-[0_0_30px_rgba(0,0,0,0.05)] group-hover:shadow-primary/20 
                                                transition-all duration-500 z-10 overflow-hidden bg-white
                                            `}>
                                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                {cat.image_url ? (
                                                    <img
                                                        src={cat.image_url}
                                                        alt={cat.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                                                        <span className="text-4xl">📦</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Floating Glass Label Card */}
                                            <div className="glass-card absolute top-[80%] left-1/2 -translate-x-1/2 w-[85%] py-4 px-2 rounded-2xl flex flex-col items-center gap-2 shadow-xl shadow-black/5 group-hover:shadow-2xl transition-all duration-500 z-20">
                                                <div className="p-2 transition-transform duration-500 group-hover:scale-110">
                                                    {style.icon}
                                                </div>
                                                <h3 className="font-black text-sm md:text-base text-gray-800 whitespace-nowrap">
                                                    {cat.name}
                                                </h3>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-24 flex justify-center md:hidden pointer-events-auto">
                            <Link to="/products">
                                <Button variant="outline" className="rounded-full px-12 h-12 font-bold border-gray-200 bg-white/50 backdrop-blur-md hover:bg-white transition-all shadow-sm">
                                    شاهد كل الأقسام
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. FLASH SALE SECTION */}
            {settings.flash_sale_visible && (
                <section
                    ref={flashRef}
                    className={`
                        py-12 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white overflow-hidden relative transition-all duration-1000 transform
                        ${flashInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                    `}
                >
                    {/* Seamless Wave-like Transition In */}
                    <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#FAFAFA] to-transparent pointer-events-none"></div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-6">
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
                                                {...product}
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

            {/* 2.2 FEATURES SECTION */}
            {settings.features_visible && (
                <section className="py-12 bg-white relative">
                    {/* Seamless Transition In from Orange Flash Sale */}
                    <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-orange-500 to-transparent opacity-10 pointer-events-none"></div>

                    <div className="container mx-auto px-4">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-black mb-4">لماذا تختارنا؟</h2>
                            <p className="text-gray-500">نقدم لك أفضل تجربة تسوق مع ضمانات حقيقية</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300 group">
                                <div className="p-4 bg-white rounded-full shadow-md mb-4 text-primary group-hover:scale-110 transition-transform">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">ضمان الجودة</h3>
                                <p className="text-gray-500 text-sm">منتجات أصلية 100% من أفضل الماركات العالمية والمحلية.</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300 group">
                                <div className="p-4 bg-white rounded-full shadow-md mb-4 text-green-500 group-hover:scale-110 transition-transform">
                                    <Truck className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">توصيل سريع</h3>
                                <p className="text-gray-500 text-sm">توصيل لجميع ولايات الجزائر (69 ولاية) في وقت قياسي.</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300 group">
                                <div className="p-4 bg-white rounded-full shadow-md mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                                    <StoreIcon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">خيارات متنوعة</h3>
                                <p className="text-gray-500 text-sm">مئات المتاجر وآلاف المنتجات في مكان واحد لتلبية جميع احتياجاتك.</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 4. BEST SELLERS (Trending) */}
            {settings.trending_visible && (
                <section
                    ref={trendingRef}
                    className={`
                        py-12 bg-[#FAFAFA] relative transition-all duration-1000 transform
                        ${trendingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                    `}
                >
                    {/* Gradient Transition In */}
                    <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white to-transparent"></div>

                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black mb-2 flex items-center gap-3">
                                    <TrendingUp className="text-primary h-8 w-8 md:h-12 md:w-12" />
                                    الأكثر طلباً
                                </h2>
                                <p className="text-gray-500 text-lg">منتجات أحبها الآخرون هذا الاسبوع</p>
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
                                : bestSellers.length > 0 ? (
                                    bestSellers.map((product) => (
                                        <div key={product.id} className="3d-perspective">
                                            <div className="3d-card h-full">
                                                <ProductCard
                                                    {...product}
                                                    onQuickView={setQuickViewProduct}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12 text-gray-400">
                                        <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>لا توجد منتجات رائجة حالياً</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. NEW ARRIVALS */}
            {settings.products_visible && (
                <section
                    ref={arrivalsRef}
                    className={`
                        py-12 bg-white relative transition-all duration-1000 transform
                        ${arrivalsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                    `}
                >
                    {/* Gradient Transition In */}
                    <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#FAFAFA] to-transparent"></div>

                    <div className="container mx-auto px-4">
                        <div className="text-center mb-8">
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
                                    <div key={product.id} className="3d-card h-full">
                                        <ProductCard
                                            {...product}
                                            onQuickView={setQuickViewProduct}
                                        />
                                    </div>
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

            {/* 6. NEWSLETTER SECTION */}
            {settings.newsletter_visible && (
                <section
                    ref={newsletterRef}
                    className={`
                        py-16 bg-slate-950 text-white relative overflow-hidden transition-all duration-1000 transform
                        ${newsletterInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                    `}
                >
                    {/* Gradient Transition In from White */}
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white to-transparent z-10"></div>

                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-20 transition-opacity duration-1000 group-hover:opacity-30"></div>

                    {/* Dynamic Glows */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>

                    <div className="container mx-auto px-4 relative z-20">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                            <div className="text-center md:text-right flex-1">
                                <h2 className="text-3xl md:text-4xl font-black mb-4">انضم لقائمتنا البريدية</h2>
                                <p className="text-primary-foreground/80 text-lg max-w-lg">
                                    احصل على أحدث العروض وكوبونات الخصم الحصرية مباشرة إلى بريدك الإلكتروني.
                                    لا تفوت فرصة التوفير!
                                </p>
                            </div>
                            <div className="w-full md:w-auto flex-1 max-w-md">
                                <form className="flex flex-col sm:flex-row gap-3">
                                    <Input
                                        type="email"
                                        placeholder="أدخل بريدك الإلكتروني"
                                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-white"
                                    />
                                    <Button
                                        size="lg"
                                        className="h-12 bg-white text-primary hover:bg-white/90 font-bold w-full sm:w-auto"
                                    >
                                        اشترك الآن
                                    </Button>
                                </form>
                                <p className="text-xs text-primary-foreground/60 mt-3 text-center md:text-right">
                                    نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                open={!!quickViewProduct}
                onOpenChange={(open) => !open && setQuickViewProduct(null)}
            />
        </div>
    );
};

export default Home;