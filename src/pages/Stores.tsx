import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import { useStores } from "@/hooks/useStores";
import { useCategories } from "@/hooks/useCategories";
import { Pagination } from "@/components/Pagination";

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
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">محلاتنا</h1>

            <Tabs value={selectedCategory} className="w-full mb-8" onValueChange={handleCategoryChange}>
                <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start p-0">
                    <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-muted/50 px-4 py-2 rounded-full"
                    >
                        الكل
                    </TabsTrigger>
                    {categories.map((cat) => (
                        <TabsTrigger
                            key={cat.id}
                            value={String(cat.id)}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-muted/50 px-4 py-2 rounded-full"
                        >
                            {cat.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {storesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <div className="aspect-video bg-muted animate-pulse" />
                            <CardContent className="p-6 space-y-3">
                                <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
                                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {storesData?.stores.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                لا توجد محلات في هذه الفئة حالياً
                            </div>
                        ) : (
                            storesData?.stores.map((store) => (
                                <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                                    <div className="aspect-video bg-muted relative group">
                                        {store.image_url ? (
                                            <img src={store.image_url} alt={store.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-100">
                                                لا توجد صورة
                                            </div>
                                        )}
                                        {store.categories && store.categories.length > 0 && (
                                            <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end">
                                                {store.categories.slice(0, 2).map((cat: any) => (
                                                    <span key={cat.id} className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-xl mb-2">{store.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                                            {store.description || "لا يوجد وصف"}
                                        </p>
                                        <Button asChild className="w-full">
                                            <Link to={`/store/${store.id}`}>زيارة المحل</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {storesData && storesData.totalPages > 1 && (
                        <div className="mt-8">
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
