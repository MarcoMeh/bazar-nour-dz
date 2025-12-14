import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";
import { Pagination } from "@/components/Pagination";
import {
    Search,
    Store,
    ArrowLeft,
    MapPin,
    Star,
    CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { PageBackground } from "@/type_defs";

// Types
interface StoreType {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    slug: string | null;
    store_categories?: {
        categories: {
            name: string;
        }
    }[];
}

interface CategoryType {
    id: string;
    name: string;
    image_url: string | null;
}

// Main Categories IDs
const MAIN_CATEGORY_IDS = [
    "157d6be9-fc68-45c7-a1a3-798ca55b8b9f", // WOMEN
    "21f91d9f-b396-47e6-8e95-da8269aa9fde", // MEN
    "ffaa15ae-6fad-45a1-b1b5-aa7c54edbcf2", // KIDS
    "d65bd4b9-8ef0-46f3-ac7c-cc89912c5a0b", // UNDERWEAR
    "bf4652fd-bd43-46db-9419-1fb1abc97bb8", // ACCESSORIES
    "7331fe06-31be-44e7-b868-adcdb8d339d9"  // SHOES
];

export default function Stores() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Data States
    const [stores, setStores] = useState<StoreType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalStores, setTotalStores] = useState(0);
    const [backgroundImg, setBackgroundImg] = useState<string>("");

    const pageSize = 12;

    // Fetch dynamic background
    useEffect(() => {
        const fetchBackground = async () => {
            const { data } = await supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("page_backgrounds" as any)
                .select("image_url")
                .eq("page_key", "stores_hero")
                .single();

            if ((data as unknown as PageBackground)?.image_url) {
                setBackgroundImg((data as unknown as PageBackground).image_url!);
            }
        };
        fetchBackground();
    }, []);

    // 1. Fetch Categories (Only Main Ones)
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("id, name, image_url")
                .in("id", MAIN_CATEGORY_IDS)
                .order("name");

            if (data) {
                setCategories(data);
            }
        };
        fetchCategories();
    }, []);

    // 2. Fetch Stores
    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from("stores")
                    .select(`
                        id, name, description, image_url, slug,
                        store_categories(
                            category_id,
                            categories(name)
                        )
                    `, { count: "exact" })
                    .eq("is_active", true)
                    .or(`subscription_end_date.gt.${new Date().toISOString()},subscription_end_date.is.null`);

                if (selectedCategory !== "all") {
                    query = supabase
                        .from("stores")
                        .select(`
                            id, name, description, image_url, slug,
                            store_categories!inner(
                                category_id,
                                categories(name)
                            )
                        `, { count: "exact" })
                        .eq("is_active", true)
                        .eq("store_categories.category_id", selectedCategory);
                }

                if (searchTerm) {
                    query = query.ilike("name", `%${searchTerm}%`);
                }

                const from = (page - 1) * pageSize;
                const to = from + pageSize - 1;

                const { data, count, error } = await query
                    .range(from, to)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                setStores(data as any || []);
                setTotalStores(count || 0);

            } catch (error) {
                console.error("Error fetching stores:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchStores();
        }, 300);

        return () => clearTimeout(timer);
    }, [page, selectedCategory, searchTerm]);

    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-20 font-cairo text-right" dir="rtl">
            <SEO
                title="المتاجر - بازارنا"
                description="تصفح أفضل المتاجر والعلامات التجارية في الجزائر على بازارنا."
            />

            {/* ================= HEADER SECTION ================= */}
            <div className="relative pt-20 pb-16 px-4 shadow-sm overflow-hidden min-h-[40vh] flex flex-col justify-center">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={backgroundImg}
                        alt="Background"
                        className="w-full h-full object-cover object-top opacity-100 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white/90 via-white/80 to-white/90 backdrop-blur-[2px]"></div>
                </div>

                <div className="container mx-auto text-center max-w-4xl relative z-10">
                    <Badge variant="outline" className="mb-6 px-4 py-1 border-primary/20 bg-white/50 backdrop-blur-md text-primary rounded-full animate-fade-in shadow-sm">
                        وجهتك للتسوق الموثوق
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 text-slate-900 tracking-tight leading-tight drop-shadow-sm">
                        دليل <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">المتاجر</span>
                    </h1>
                    <p className="text-gray-600 font-medium text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
                        اكتشف نخبة المتاجر والعلامات التجارية في الجزائر. تسوق بذكاء وثقة من محلاتك المفضلة.
                    </p>

                    {/* Search & Categories Bar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-3xl mx-auto animate-slide-up">
                        <div className="relative w-full md:w-2/3 group">
                            <Input
                                className="h-14 pr-12 pl-6 rounded-full border-gray-200 bg-white/90 backdrop-blur-md focus:bg-white text-lg shadow-lg hover:shadow-xl transition-all focus:ring-2 focus:ring-primary/20 text-right"
                                placeholder="ابحث عن متجر..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute right-4 top-4 h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= CATEGORY TABS ================= */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 justify-start lg:justify-center px-2 py-2">
                        <button
                            onClick={() => handleCategoryChange("all")}
                            className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${selectedCategory === "all"
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-2 ring-slate-900 ring-offset-2"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md"
                                }`}
                        >
                            <span className="text-lg">🏢</span>
                            الكل
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`flex items-center gap-3 px-2 pl-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${selectedCategory === cat.id
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-2 ring-slate-900 ring-offset-2"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                    {cat.image_url ? (
                                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                                    )}
                                </div>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ================= STORES GRID ================= */}
            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
                                <div className="space-y-2 px-4">
                                    <Skeleton className="h-4 w-2/3 mx-auto" />
                                    <Skeleton className="h-3 w-1/2 mx-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : stores.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm mx-auto max-w-2xl animate-fade-in">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Store className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">لم يتم العثور على متاجر</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">نأسف، لا توجد نتائج تطابق بحثك الحالي. جرب تغيير كلمات البحث أو التصنيف.</p>
                        <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory("all") }} className="px-8 rounded-full h-12">
                            عرض كل المتاجر
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                        {stores.map((store, index) => (
                            <div
                                key={store.id}
                                className="group relative flex flex-col items-center animate-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-xl transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:-translate-y-2 border border-gray-100">

                                    {/* Link wrapper */}
                                    <Link
                                        to={`/store/${store.slug || store.id}`}
                                        className="absolute inset-0 z-0"
                                    >
                                        {/* Background Image */}
                                        <div className="absolute inset-0 bg-gray-100">
                                            {store.image_url ? (
                                                <img
                                                    src={store.image_url}
                                                    alt={store.name}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300">
                                                    <Store className="h-20 w-20 mb-4 opacity-50" />
                                                    <span className="text-sm font-medium">لا توجد صورة</span>
                                                </div>
                                            )}
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                                        </div>
                                    </Link>

                                    {/* Store Info Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 z-10 pointer-events-none">

                                        {/* Store Logo/Avatar */}
                                        <div className="relative mx-auto w-20 h-20 mb-4 group-hover:scale-110 transition-transform duration-500">
                                            <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full animate-pulse-slow"></div>
                                            <div className="relative w-full h-full rounded-full bg-white border-2 border-white/50 overflow-hidden flex items-center justify-center shadow-lg">
                                                {store.image_url ? (
                                                    <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-bold text-gray-800">{store.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-white rounded-full p-1 shadow-sm">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-bold mb-2 tracking-tight group-hover:text-primary-foreground transition-colors line-clamp-1">
                                            {store.name}
                                        </h3>

                                        {/* Categories Tags */}
                                        {store.store_categories && store.store_categories.length > 0 && (
                                            <div className="flex justify-center gap-2 mb-3 opacity-80">
                                                {store.store_categories.slice(0, 2).map((cat: any, idx: number) => (
                                                    <span key={idx} className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full border border-white/10">
                                                        {cat.categories?.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-300 line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-auto overflow-hidden">
                                            {store.description || "متجر مميز يقدم أفضل المنتجات والخدمات"}
                                        </p>

                                        {/* Button */}
                                        <div className="pointer-events-auto transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                                            <Button
                                                asChild
                                                size="sm"
                                                className="w-full rounded-full bg-white text-black hover:bg-primary hover:text-white border-none shadow-lg font-bold transition-all duration-300"
                                            >
                                                <Link to={`/store/${store.slug || store.id}`}>
                                                    زيارة المتجر
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Action Icon */}
                                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0 z-10 pointer-events-none">
                                        <ArrowLeft className="h-5 w-5 text-white transform -rotate-45" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {totalStores > pageSize && (
                    <div className="mt-20 flex justify-center">
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(totalStores / pageSize)}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}