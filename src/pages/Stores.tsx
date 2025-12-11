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

                                        {/* Social Links */}
                                        <div className="flex gap-2 justify-center mt-3 pt-3 border-t">
                                            {store.whatsapp && (
                                                <a href={store.whatsapp.startsWith('http') ? store.whatsapp : `https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#25D366] transition-colors">
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                </a>
                                            )}
                                            {store.facebook && (
                                                <a href={store.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1877F2] transition-colors">
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.376h3.558l-.46 3.667h-3.098v7.98h-4.843Z" /></svg>
                                                </a>
                                            )}
                                            {store.instagram && (
                                                <a href={store.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#E4405F] transition-colors">
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                                </a>
                                            )}
                                            {store.tiktok && (
                                                <a href={store.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors">
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.03 5.84-.02 8.75-.08 1.46-.54 2.94-1.34 4.14-1.32 1.97-3.54 3.07-5.96 2.96-2.42-.11-4.58-1.6-5.64-3.83-1.06-2.23-.67-4.94.97-6.82 1.64-1.89 4.34-2.52 6.6-1.54V6.03c-2.84-.99-6.15-.37-8.4 1.63-2.25 2-3.12 5.25-2.2 8.11.92 2.86 3.65 4.92 6.63 5.02 2.99.1 5.8-1.69 7.07-4.5 1.27-2.81 1.08-6.1-.49-8.75V.02h-1.29c-.01 0-.01 0 0 0" /></svg>
                                                </a>
                                            )}
                                        </div>
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
