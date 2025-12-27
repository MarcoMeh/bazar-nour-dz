import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";
import { Pagination } from "@/components/Pagination";
import { Search, Store, CheckCircle2, ShoppingBag } from "lucide-react";
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
    category_id?: string | null; // Deprecated
    categories?: { id: string; name: string }[];
}

// القائمة الثابتة (سنستخدمها لعرض الأسماء أيضاً)
const MAIN_CATEGORIES = [
    { id: "157d6be9-fc68-45c7-a1a3-798ca55b8b9f", name: "ملابس نسائية", image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400" },
    { id: "21f91d9f-b396-47e6-8e95-da8269aa9fde", name: "ملابس رجالية", image_url: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400" },
    { id: "ffaa15ae-6fad-45a1-b1b5-aa7c54edbcf2", name: "ملابس أطفال", image_url: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400" },
    { id: "7331fe06-31be-44e7-b868-adcdb8d339d9", name: "أحذية", image_url: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400" },
    { id: "bf4652fd-bd43-46db-9419-1fb1abc97bb8", name: "إكسسوارات", image_url: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400" },
    { id: "d65bd4b9-8ef0-46f3-ac7c-cc89912c5a0b", name: "ملابس داخلية", image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400" }
];

export default function Stores() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Data States
    const [stores, setStores] = useState<StoreType[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalStores, setTotalStores] = useState(0);
    const [backgroundImg, setBackgroundImg] = useState<string>("");

    const pageSize = 12;

    // Fetch Dynamic Background
    useEffect(() => {
        const fetchBackground = async () => {
            const { data } = await supabase.from("page_backgrounds" as any).select("image_url").eq("page_key", "stores_hero").single();
            if ((data as unknown as PageBackground)?.image_url) {
                setBackgroundImg((data as unknown as PageBackground).image_url!);
            }
        };
        fetchBackground();
    }, []);

    // Fetch Stores
    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                let query;

                const selectQuery = `id, name, description, image_url, slug, store_category_relations(categories(id, name, slug))`;

                // الفلترة
                if (selectedCategory !== "all") {
                    query = supabase
                        .from("stores")
                        .select(`id, name, description, image_url, slug, store_category_relations!inner(categories(id, name, slug))`, { count: "exact" })
                        .eq("store_category_relations.category_id", selectedCategory);
                } else {
                    query = supabase
                        .from("stores")
                        .select(selectQuery, { count: "exact" });
                }

                query = query.eq("is_active", true);

                // Filter out manually suspended stores
                query = query.or("is_manually_suspended.is.false,is_manually_suspended.is.null");

                // شرط الاشتراك (اختياري حسب بياناتك)
                query = query.or(`subscription_end_date.gt.${new Date().toISOString()},subscription_end_date.is.null`);

                if (searchTerm) {
                    query = query.ilike("name", `%${searchTerm}%`);
                }

                const from = (page - 1) * pageSize;
                const to = from + pageSize - 1;

                const { data, count, error } = await query
                    .range(from, to)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Supabase Error:", error);
                    throw error;
                }

                // Map data
                const processed = (data as any || []).map((s: any) => ({
                    ...s,
                    categories: s.store_category_relations?.map((r: any) => r.categories).filter(Boolean) || []
                }));

                setStores(processed);
                setTotalStores(count || 0);

            } catch (error) {
                console.error("Error fetching stores:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => { fetchStores(); }, 300);
        return () => clearTimeout(timer);
    }, [page, selectedCategory, searchTerm]);

    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        setPage(1);
    };

    // دالة مساعدة لجلب اسم الفئة من الكود بدلاً من قاعدة البيانات
    const getCategoryName = (catId: string | null) => {
        if (!catId) return null;
        const cat = MAIN_CATEGORIES.find(c => c.id === catId);
        return cat ? cat.name : null;
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-20 font-cairo text-right" dir="rtl">
            <SEO title="دليل المتاجر - بازارنا" description="تصفح أفضل المتاجر والعلامات التجارية في الجزائر." />

            {/* HEADER SECTION */}
            <div className="relative pt-24 pb-12 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={backgroundImg || "/placeholder.jpg"} alt="Background" className="w-full h-full object-cover opacity-100" />
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px]"></div>
                </div>

                <div className="container mx-auto text-center max-w-3xl relative z-10">
                    <Badge variant="outline" className="mb-4 px-4 py-1.5 border-blue-200 bg-blue-50 text-blue-700 rounded-full font-bold">
                        وجهتك للتسوق الموثوق
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">
                        دليل <span className="text-blue-600">المتاجر</span>
                    </h1>

                    <div className="relative max-w-xl mx-auto group mt-8">
                        <Input
                            className="h-12 pr-12 pl-6 rounded-2xl border-gray-200 bg-white shadow-lg focus:shadow-xl transition-all focus:ring-2 focus:ring-blue-100 text-right"
                            placeholder="ابحث عن متجر..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute right-4 top-3 h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* CATEGORY FILTER (Pills Style) */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-3 transition-all duration-300">
                <div className="container mx-auto px-4">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        <button
                            onClick={() => handleCategoryChange("all")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap shrink-0 border ${selectedCategory === "all"
                                ? "bg-black text-white border-black shadow-lg shadow-black/20"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <Store className="w-4 h-4" />
                            الكل
                        </button>

                        {MAIN_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`flex items-center gap-2 pr-1.5 pl-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap shrink-0 border ${selectedCategory === cat.id
                                    ? "bg-black text-white border-black shadow-lg shadow-black/20"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                </div>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* STORES GRID */}
            <div className="container mx-auto px-4 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-[350px] w-full rounded-[2rem]" />
                        ))}
                    </div>
                ) : stores.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mx-auto max-w-lg">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد متاجر</h3>
                        <p className="text-gray-500 mb-6">لم يتم العثور على أي متجر. تأكد من اتصالك بالإنترنت.</p>
                        <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory("all") }} className="rounded-full">
                            تحديث الصفحة
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {stores.map((store) => (
                            <Link
                                key={store.id}
                                to={`/store/${store.slug || store.id}`}
                                className="group relative flex flex-col items-center"
                            >
                                <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:-translate-y-1">
                                    <div className="absolute inset-0 bg-gray-200">
                                        {store.image_url ? (
                                            <img src={store.image_url} alt={store.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 opacity-50" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-5 text-center text-white">
                                        <div className="relative mx-auto w-16 h-16 mb-3 transform group-hover:scale-105 transition-transform">
                                            <div className="w-full h-full rounded-2xl bg-white p-0.5 shadow-lg overflow-hidden">
                                                {store.image_url ? (
                                                    <img src={store.image_url} className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-800 font-bold text-xl rounded-xl">{store.name.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-white">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold mb-1 leading-tight line-clamp-1 group-hover:text-blue-200 transition-colors">
                                            {store.name}
                                        </h3>

                                        <div className="flex justify-center gap-1 mb-4 opacity-90 flex-wrap px-4">
                                            {store.categories?.slice(0, 3).map((cat) => (
                                                <span key={cat.id} className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="h-0 group-hover:h-10 overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
                                            <Button size="sm" className="w-full rounded-full bg-white text-black hover:bg-blue-600 hover:text-white border-none font-bold text-xs h-8">
                                                زيارة المتجر
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {totalStores > pageSize && (
                    <div className="mt-16 flex justify-center">
                        <Pagination currentPage={page} totalPages={Math.ceil(totalStores / pageSize)} onPageChange={setPage} />
                    </div>
                )}
            </div>
        </div>
    );
}