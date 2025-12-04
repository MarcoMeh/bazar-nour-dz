import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Stores() {
    const [stores, setStores] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: storesData } = await supabase
            .from("stores")
            .select("*, store_categories(name)")
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        const { data: categoriesData } = await supabase
            .from("store_categories")
            .select("*")
            .order("name");

        setStores(storesData || []);
        setCategories(categoriesData || []);
        setLoading(false);
    };

    const filteredStores = selectedCategory === "all"
        ? stores
        : stores.filter(store => String(store.category_id) === selectedCategory);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">محلاتنا</h1>

            <Tabs defaultValue="all" className="w-full mb-8" onValueChange={setSelectedCategory}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        لا توجد محلات في هذه الفئة حالياً
                    </div>
                ) : (
                    filteredStores.map((store) => (
                        <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-muted relative">
                                {store.image_url ? (
                                    <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        لا توجد صورة
                                    </div>
                                )}
                                {store.store_categories?.name && (
                                    <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        {store.store_categories.name}
                                    </span>
                                )}
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-2">{store.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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
        </div>
    );
}
