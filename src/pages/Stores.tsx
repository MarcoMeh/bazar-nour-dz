import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
// Card import is no longer needed for the new design, but Button is
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton for consistent loading state
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import { useStores } from "@/hooks/useStores";
import { useCategories } from "@/hooks/useCategories";
import { Pagination } from "@/components/Pagination";
import { ArrowLeft, Store } from "lucide-react"; // Added Icons

export default function Stores() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const pageSize = 9; // Grid 3x3

    // Sync URL params with state
    useEffect(() => {
        const categoryParam = searchParams.get("category");
        const pageParam = searchParams.get("page");
        if (categoryParam) setSelectedCategory(categoryParam);
        if (pageParam) setPage(Number(pageParam));
    }, [searchParams]);

    const { data: storesData, isLoading: storesLoading } = useStores({
        page,
        pageSize,
        categoryId: selectedCategory === "all" ? undefined : selectedCategory
    });

    const { data: categories = [], isLoading: categoriesLoading } = useCategories();

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setPage(1);
        setSearchParams(params => {
            if (value === "all") params.delete("category");
            else params.set("category", value);
            params.set("page", "1");
            return params;
        });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setSearchParams(params => {
            params.set("page", newPage.toString());
            return params;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (categoriesLoading && page === 1) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="container py-8 min-h-screen">
            <SEO
                title="المتاجر"
                description="تصفح أفضل المتاجر والعلامات التجارية في الجزائر على بازارنا. تسوق بثقة من محلات موثوقة."
            />

            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-primary">محلاتنا</h1>
                <p className="text-gray-500 text-lg">اكتشف نخبة المتاجر والعلامات التجارية في الجزائر</p>
            </div>

            <Tabs value={selectedCategory} className="w-full mb-12" onValueChange={handleCategoryChange}>
                <TabsList className="flex flex-wrap h-auto gap-3 bg-transparent justify-center p-0">
                    <TabsTrigger
                        value="all"
                        className="px-6 py-2 rounded-full border border-gray-200 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:border-gray-900 transition-all"
                    >
                        الكل
                    </TabsTrigger>
                    {categories.map((cat) => (
                        <TabsTrigger
                            key={cat.id}
                            value={String(cat.id)}
                            className="px-6 py-2 rounded-full border border-gray-200 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:border-gray-900 transition-all"
                        >
                            {cat.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {storesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-2/3 mx-auto" />
                                <Skeleton className="h-3 w-1/2 mx-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {storesData?.stores.length === 0 ? (
                            <div className="col-span-full text-center py-20 opacity-50">
                                <Store className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-xl text-muted-foreground">لا توجد محلات في هذه الفئة حالياً</p>
                            </div>
                        ) : (
                            storesData?.stores.map((store) => (
                                <div
                                    key={store.id}
                                    className="group relative flex flex-col items-center"
                                >
                                    <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:-translate-y-2 border border-gray-100">

                                        {/* ✅ 1. Background Link - Makes the whole card clickable */}
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
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                                                        <Store className="h-20 w-20" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                                            </div>
                                        </Link>

                                        {/* Categories Tags (Top Right) - Optional but nice to keep from old design */}
                                        {store.categories && store.categories.length > 0 && (
                                            <div className="absolute top-4 left-4 flex flex-wrap gap-1 z-10 pointer-events-none">
                                                {store.categories.slice(0, 1).map((cat: any) => (
                                                    <span key={cat.id} className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs px-3 py-1 rounded-full">
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* ✅ 2. Store Info Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-8 text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-10 pointer-events-none">

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

                                            <h3 className="text-2xl font-bold mb-2 tracking-tight group-hover:text-primary-foreground transition-colors">
                                                {store.name}
                                            </h3>
                                            <p className="text-sm text-gray-300 line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                {store.description || "متجر مميز يقدم أفضل المنتجات والخدمات"}
                                            </p>

                                            {/* ✅ 3. Button - Re-enable pointer events */}
                                            <div className="pointer-events-auto">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="w-full rounded-full bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 transition-all duration-300 font-bold group-hover:scale-105"
                                                >
                                                    <Link to={`/store/${store.slug || store.id}`}>
                                                        زيارة المتجر
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Quick Action Helper */}
                                        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0 z-10 pointer-events-none">
                                            <ArrowLeft className="h-5 w-5 text-white transform rotate-45" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {storesData && storesData.totalPages > 1 && (
                        <div className="mt-16">
                            <Pagination
                                currentPage={page}
                                totalPages={storesData.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}